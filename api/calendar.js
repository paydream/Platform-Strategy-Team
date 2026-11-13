// 캘린더 — 팀원(유영경·심현지·박채은) 업무 저장본 + 화면에서 직접 추가한 주요 일정.
// 저장(공개 저장소라 암호화, api/_statsfile.js 재사용, 이 파일들만 바뀐 커밋은 재배포 안 함):
//   data/stats/calendar.enc.json        업무 저장본. POST { key, data } (STATS_UPDATE_KEY, Aside 루틴이 보낸다)
//   data/stats/calendar-manual.enc.json 직접 추가한 일정 { items: [...] }
// GET: 업무 저장본 + manual(직접 추가 일정) 함께.
// POST { action:'save', item }   일정 추가·수정 (item.id 없으면 추가)  — 사이트 로그인 쿠키(siteOk) 또는 팀 비밀번호
// POST { action:'delete', id }   일정 삭제                              — 같은 권한
const crypto = require('crypto');
const L = require('./_lib');
const F = require('./_statsfile');

const ID = 'calendar';
const MID = 'calendar-manual';
const PEOPLE = ['유영경', '심현지', '박채은'];
const STATES = ['예정', '진행 중', '완료'];
function same(given, secret) {
  if (!secret || typeof given !== 'string') return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(secret).digest();
  return crypto.timingSafeEqual(a, b);
}
const wait = ms => new Promise(r => setTimeout(r, ms));
const s = (v, n) => String(v ?? '').trim().slice(0, n);
const bad = m => Object.assign(new Error(m), { code: 400 });
const nowKst = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 16).replace('T', ' ');

// 직접 추가 일정: 캐시 없이 GitHub에서 바로 읽는다(추가 직후 바로 보이게)
async function readManual() {
  const r = await L.readJson(F.pathOf(MID), null);
  return { sha: r.sha, items: r.data ? (F.open(r.data).items || []) : [] };
}
function clean(src, prev) {
  const x = { ...(prev || {}) };
  x.title = s(src.title, 100); if (!x.title) throw bad('일정 이름을 넣어 주세요.');
  x.start = s(src.start, 10); if (!/^\d{4}-\d\d-\d\d$/.test(x.start)) throw bad('시작일을 넣어 주세요.');
  x.end = s(src.end, 10); if (!/^\d{4}-\d\d-\d\d$/.test(x.end) || x.end < x.start) x.end = x.start;
  x.team = [...new Set((Array.isArray(src.team) ? src.team : []).filter(n => PEOPLE.includes(n)))];
  if (!x.team.length) throw bad('담당자를 한 명 이상 골라 주세요.');
  x.st = STATES.includes(src.st) ? src.st : '예정';
  x.memo = s(src.memo, 1000);
  const link = s(src.link, 500); x.link = /^https?:\/\//i.test(link) ? link : '';
  return x;
}
async function mutate(fn, msg) {
  for (let a = 0; a < 3; a++) {
    const cur = await readManual();
    const out = fn(cur.items);
    if (out.error) return out;
    try {
      await L.writeJson(F.pathOf(MID), F.seal({ items: cur.items }, { updated: nowKst().slice(0, 10), count: cur.items.length }), cur.sha, msg(out));
      return out;
    } catch (e) { if (a === 2 || (e.status !== 409 && e.status !== 422)) throw e; }
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    try {
      const [data, man] = await Promise.all([F.readData(ID).catch(() => null), readManual().catch(() => null)]);
      if (!data && !man) return res.status(404).json({ error: '아직 저장된 일정이 없습니다.' });
      return res.status(200).json({ ...(data || {}), manual: man ? man.items : [] });
    } catch (e) { return res.status(500).json({ error: L.ghError(e) }); }
  }
  if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
  let b;
  try { b = L.body(req); } catch { return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' }); }

  // 화면에서 직접 추가·수정·삭제
  if (b.action === 'save' || b.action === 'delete') {
    if (!process.env.GITHUB_TOKEN || !process.env.STATS_UPDATE_KEY) return res.status(503).json({ error: '저장 기능이 아직 설정되지 않았습니다.' });
    if (!L.siteOk(req) && !L.teamOk(b.password)) { await wait(800); return res.status(401).json({ error: '사이트에 다시 로그인해 주세요.' }); }
    try {
      if (b.action === 'delete') {
        const id = s(b.id, 20);
        const out = await mutate(items => { const i = items.findIndex(x => x.id === id); if (i < 0) return { error: '이미 지워진 일정입니다.', status: 404 }; const [x] = items.splice(i, 1); return { ok: true, item: x }; },
          o => `캘린더 일정 삭제: ${o.item.title.slice(0, 40)}`);
        return res.status(out.error ? out.status : 200).json(out);
      }
      const src = b.item || {};
      const out = await mutate(items => {
        const i = src.id ? items.findIndex(x => x.id === src.id) : -1;
        if (src.id && i < 0) return { error: '그 사이 지워진 일정입니다. 새로고침해 주세요.', status: 404 };
        const x = clean(src, i >= 0 ? items[i] : null);
        if (i < 0) { x.id = 'm' + crypto.randomBytes(4).toString('hex'); x.created = nowKst(); items.push(x); }
        else { x.updated = nowKst(); items[i] = x; }
        return { ok: true, item: x };
      }, o => `캘린더 일정 ${src.id ? '수정' : '추가'}: ${o.item.title.slice(0, 40)}`);
      return res.status(out.error ? out.status : 200).json(out);
    } catch (e) {
      if (e.code === 400) return res.status(400).json({ error: e.message });
      return res.status(500).json({ error: L.ghError(e) });
    }
  }

  // Aside 루틴: 업무 저장본 통째 갱신
  if (!process.env.STATS_UPDATE_KEY || !process.env.GITHUB_TOKEN) return res.status(503).json({ error: '자동 갱신이 아직 설정되지 않았습니다.' });
  if (!same(String(b.key ?? ''), process.env.STATS_UPDATE_KEY)) { await wait(800); return res.status(401).json({ error: '갱신 키가 맞지 않습니다.' }); }
  const d = b.data;
  if (!d || typeof d !== 'object' || !/^\d{4}-\d{2}-\d{2}$/.test(d.updated || '')
      || !d.flow || !Array.isArray(d.flow.items))
    return res.status(400).json({ error: '데이터 형식이 올바르지 않습니다.' });
  if (JSON.stringify(d).length > 900000) return res.status(413).json({ error: '데이터가 너무 큽니다.' });
  const meta = { updated: d.updated, updatedAt: d.updatedAt || new Date().toISOString(), range: d.flow.range || { start: d.updated, end: d.updated } };
  try {
    const sha = await F.writeData(ID, d, meta);
    return res.status(200).json({ ok: true, id: ID, meta, sha });
  } catch (e) { return res.status(500).json({ error: L.ghError(e) }); }
};
