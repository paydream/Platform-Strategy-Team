// 예스폼 오류 모니터링 「확인 필요」 상태 — 치명 장애(위험도 높음 사건)를 사람이 확인했는지 기록한다.
// Vercel Hobby 요금제 서버 함수 12개 제한 때문에 따로 함수로 두지 않고 api/stats.js 가 ?alert=clarity 요청을 이 파일로 넘긴다(밑줄 파일은 함수로 안 셈).
// GET  /api/stats?alert=clarity            → { count, pending:[...] }  아직 확인 안 한 높음 사건(녹화 확인 결과 '문제 없음'·사후 기록 제외)
// GET  /api/stats?alert=clarity&summary=1  → { count }                 상단 메뉴(gnb.js)가 「자동관리(확인필요)」 표시에 쓴다
// POST /api/stats?alert=clarity {ids:[사건 id], by?}                    → 확인 처리 후 { count, pending }
// 인증: 사이트 비밀번호 쿠키(siteOk). 저장: data/clarity-ack.json (이 파일만 바뀐 커밋은 재배포 안 함)
const L = require('./_lib');
const F = require('./_statsfile');
const ACK = 'data/clarity-ack.json';

let ackCache = null; // { t, sha, data }
async function readAck(fresh) {
  if (!fresh && ackCache && Date.now() - ackCache.t < 20000) return ackCache;
  const r = await L.readJson(ACK, { acked: {} });
  ackCache = { t: Date.now(), sha: r.sha, data: r.data && r.data.acked ? r.data : { acked: {} } };
  return ackCache;
}
async function pendingList(fresh) {
  let d = null; try { d = await F.readData('clarity'); } catch { d = null; }
  const ack = await readAck(fresh);
  const inc = (d && Array.isArray(d.incidents)) ? d.incidents : [];
  const pending = inc.filter(i => i && i.id && !i.backfill && i.level === '높음'
    && !(i.verify && i.verify.verdict === '문제 없음') && !ack.data.acked[i.id])
    .map(i => ({ id: i.id, key: i.key, site: i.site, area: i.area, text: i.text, msg: i.msg || null, first: i.first, last: i.last, checks: i.checks, resolvedAt: i.resolvedAt || null, verify: i.verify || null }));
  return { pending, ack };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!L.siteOk(req)) return res.status(401).json({ error: '사이트 비밀번호가 필요합니다.' });
  try {
    if (req.method === 'GET') {
      const summary = String((req.query && req.query.summary) || '') === '1';
      const { pending } = await pendingList(false);
      return res.status(200).json(summary ? { count: pending.length } : { count: pending.length, pending });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
    let b; try { b = L.body(req); } catch { return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' }); }
    const ids = Array.isArray(b.ids) ? b.ids.map(String).filter(Boolean).slice(0, 50) : [];
    if (!ids.length) return res.status(400).json({ error: '확인할 항목이 없습니다.' });
    const by = String(b.by || '').slice(0, 40);
    for (let a = 0; a < 3; a++) {
      const cur = await readAck(true);
      const data = { acked: { ...cur.data.acked } };
      const at = new Date().toISOString();
      for (const id of ids) data.acked[id] = { at, ...(by ? { by } : {}) };
      // 90일 지난 기록은 정리
      const cut = Date.now() - 90 * 864e5;
      for (const [k, v] of Object.entries(data.acked)) if (Date.parse(v.at) < cut) delete data.acked[k];
      try {
        const sha = await L.writeJson(ACK, data, cur.sha, `오류 모니터링 확인 처리 ${ids.length}건`);
        ackCache = { t: Date.now(), sha, data };
        break;
      } catch (e) { if (a === 2 || (e.status !== 409 && e.status !== 422)) throw e; ackCache = null; }
    }
    const { pending } = await pendingList(false);
    return res.status(200).json({ ok: true, count: pending.length, pending });
  } catch (e) { return res.status(500).json({ error: L.ghError(e) }); }
};
