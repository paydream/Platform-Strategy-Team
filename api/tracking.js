// GA4·GTM 측정 기록 — data/tracking.json 한 파일에 저장 (이 파일만 바뀐 커밋은 재배포 안 함: vercel.json ignoreCommand)
// GET                                                  → 기록 전체 (GitHub에서 바로 읽음)
// POST {action:'check', password}                      → 팀 비밀번호 확인
// POST {action:'save', password(팀), author, record}   → 기록 추가·수정 (record.id 없으면 새로 추가)
// POST {action:'delete', password(관리자), id}         → 기록 삭제
// POST {action:'version', password(팀), author, key:'GTM-XXXX:버전', requester, worker, note} → GTM 버전에 요청자·작업자 메모
// GTM 게시 이력·GA4 수집량 스냅샷(data/tracking-snapshot.json)은 정적 파일이라 여기서 쓰지 않는다.
const crypto = require('crypto');
const L = require('./_lib');
const FILE = 'data/tracking.json';
const PRODUCTS = ['yesform', 'sign', 'editor'];
const METHODS = ['GTM', '사이트 코드', 'GA4 관리자', '기타'];
const CHANGES = ['추가', '수정', '삭제'];
const wait = ms => new Promise(r => setTimeout(r, ms));
const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const s = (v, n) => String(v ?? '').trim().slice(0, n);
const bad = m => Object.assign(new Error(m), { code: 400 });

function clean(src, prev) {
  const r = { ...(prev || {}) };
  r.date = s(src.date, 10); if (!/^\d{4}-\d\d-\d\d$/.test(r.date)) throw bad('날짜를 넣어 주세요.');
  if (!PRODUCTS.includes(src.product)) throw bad('제품을 골라 주세요.'); r.product = src.product;
  r.title = s(src.title, 200); if (!r.title) throw bad('무엇을 추가·수정했는지 적어 주세요.');
  r.change = CHANGES.includes(src.change) ? src.change : '추가';
  r.method = METHODS.includes(src.method) ? src.method : 'GTM';
  const ev = Array.isArray(src.events) ? src.events : String(src.events || '').split(/[,\s]+/);
  r.events = [...new Set(ev.map(x => String(x).trim()).filter(x => /^[A-Za-z_][A-Za-z0-9_]{0,39}$/.test(x)))].slice(0, 40);
  for (const k of ['requester', 'worker']) r[k] = s(src[k], 40);
  r.note = s(src.note, 2000);
  r.basis = s(src.basis, 40);
  const v = src.gtm && Number(src.gtm.version);
  r.gtm = src.gtm && src.gtm.container && v ? { container: s(src.gtm.container, 20), version: v } : null;
  r.log = Array.isArray(r.log) ? r.log : [];
  return r;
}
async function mutate(fn, msg) {
  for (let i = 0; i < 3; i++) {
    const cur = await L.readJson(FILE, { records: [], gtmNotes: {} });
    cur.data.records = cur.data.records || []; cur.data.gtmNotes = cur.data.gtmNotes || {};
    const out = fn(cur.data);
    if (out && out.error) return out;
    cur.data.updated = today();
    try { await L.writeJson(FILE, cur.data, cur.sha, msg(out)); return out; }
    catch (e) { if (e.status !== 409 && e.status !== 422) throw e; }
  }
  return { error: '동시에 저장이 몰렸습니다. 다시 눌러 주세요.', status: 409 };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!L.configured()) return res.status(503).json({ error: '저장 기능이 아직 설정되지 않았습니다.' });
  try {
    if (req.method === 'GET') { const { data } = await L.readJson(FILE, { records: [] }); return res.status(200).json(data); }
    if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
    let b; try { b = L.body(req); } catch { return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' }); }
    const author = s(b.author, 30);
    if (b.action === 'delete') {
      if (!L.adminOk(b.password)) { await wait(800); return res.status(401).json({ error: '삭제는 관리자 비밀번호가 필요합니다.' }); }
      const out = await mutate(d => { const n = d.records.length; d.records = d.records.filter(x => x.id !== b.id); return d.records.length === n ? { error: '이미 지워진 기록입니다.', status: 404 } : { ok: true }; }, () => `측정 기록 삭제: ${b.id}`);
      return res.status(out.error ? out.status : 200).json(out);
    }
    if (!L.teamOk(b.password) && !L.siteOk(req)) { await wait(800); return res.status(401).json({ error: '팀 비밀번호가 맞지 않습니다.' }); }
    if (b.action === 'check') return res.status(200).json({ ok: true });
    if (!author) return res.status(400).json({ error: '이름을 넣어 주세요.' });
    if (b.action === 'save') {
      const src = b.record || {};
      const out = await mutate(d => {
        const idx = src.id ? d.records.findIndex(x => x.id === src.id) : -1;
        if (src.id && idx < 0) return { error: '그 사이 지워진 기록입니다. 새로고침해 주세요.', status: 404 };
        const r = clean(src, idx >= 0 ? d.records[idx] : null);
        if (idx < 0) { r.id = 'r' + crypto.randomBytes(4).toString('hex'); r.log = [{ date: today(), by: author, text: '기록 추가' }]; d.records.push(r); }
        else { r.log.push({ date: today(), by: author, text: '기록 수정' }); if (r.log.length > 40) r.log = r.log.slice(-40); d.records[idx] = r; }
        return { ok: true, record: r };
      }, o => `측정 기록 ${src.id ? '수정' : '추가'}: ${o.record ? o.record.title.slice(0, 40) : ''} (${author})`);
      return res.status(out.error ? out.status : 200).json(out);
    }
    if (b.action === 'version') {
      const key = s(b.key, 30); if (!/^GTM-[A-Z0-9]+:\d+$/.test(key)) return res.status(400).json({ error: '어느 버전인지 알 수 없습니다.' });
      const out = await mutate(d => { d.gtmNotes[key] = { requester: s(b.requester, 40), worker: s(b.worker, 40), note: s(b.note, 1000), by: author, date: today() }; return { ok: true, note: d.gtmNotes[key] }; }, () => `GTM 버전 메모: ${key} (${author})`);
      return res.status(out.error ? out.status : 200).json(out);
    }
    return res.status(400).json({ error: '알 수 없는 요청입니다.' });
  } catch (e) {
    if (e.code === 400) return res.status(400).json({ error: e.message });
    return res.status(500).json({ error: L.ghError(e) });
  }
};
