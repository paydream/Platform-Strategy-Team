// 비밀번호 문서(기획 계획안)의 팀별 일정 — 화면에서 직접 추가·수정·삭제한다.
// 저장: data/stats/<doc>-schedule.enc.json (공개 저장소라 암호화, api/_statsfile.js 재사용, 이 파일만 바뀐 커밋은 재배포 안 함)
// 권한: 사이트 로그인 쿠키(siteOk) 또는 통계 비밀번호(STATS_PASSWORD, 문서 열람 비밀번호와 같음) 또는 팀 비밀번호
// POST { doc, password, action:'get' }            → { rows, updated }
// POST { doc, password, action:'save', row }      → 일정 추가·수정 (row.id 없으면 추가)
// POST { doc, password, action:'delete', id }     → 일정 삭제
const crypto = require('crypto');
const L = require('./_lib');
const F = require('./_statsfile');

const DOCS = ['membership-plan']; // 일정 편집을 허용하는 문서
const TEAMS = ['플랫폼전략팀', '콘텐츠팀', '개발팀', '관리팀', '공통'];
const STATES = ['예정', '진행 중', '완료', '지연'];
const KINDS = ['task', 'milestone'];

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
const fid = doc => `${doc}-schedule`;

async function readRows(doc) {
  const r = await L.readJson(F.pathOf(fid(doc)), null);
  const d = r.data ? F.open(r.data) : null;
  return { sha: r.sha, rows: d ? d.rows || [] : [], updated: d ? d.updated || '' : '' };
}
function clean(src, prev) {
  const x = { ...(prev || {}) };
  x.team = TEAMS.includes(src.team) ? src.team : '';
  if (!x.team) throw bad('팀을 골라 주세요.');
  x.task = s(src.task, 80); if (!x.task) throw bad('업무 이름을 넣어 주세요.');
  x.kind = KINDS.includes(src.kind) ? src.kind : 'task';
  x.start = s(src.start, 10); if (!/^\d{4}-\d\d-\d\d$/.test(x.start)) throw bad('시작일을 넣어 주세요.');
  x.end = s(src.end, 10); if (x.kind === 'milestone' || !/^\d{4}-\d\d-\d\d$/.test(x.end) || x.end < x.start) x.end = x.start;
  x.st = STATES.includes(src.st) ? src.st : '예정';
  x.note = s(src.note, 200);
  return x;
}
async function mutate(doc, fn, msg) {
  for (let a = 0; a < 3; a++) {
    const cur = await readRows(doc);
    const out = fn(cur.rows);
    if (out.error) return out;
    const updated = nowKst();
    try {
      await L.writeJson(F.pathOf(fid(doc)), F.seal({ rows: cur.rows, updated }, { updated: updated.slice(0, 10), count: cur.rows.length }), cur.sha, msg(out));
      return { ...out, updated };
    } catch (e) { if (a === 2 || (e.status !== 409 && e.status !== 422)) throw e; }
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
  if (!process.env.GITHUB_TOKEN || !process.env.STATS_UPDATE_KEY) return res.status(503).json({ error: '저장 기능이 아직 설정되지 않았습니다.' });
  let b;
  try { b = L.body(req); } catch { return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' }); }
  const doc = s(b.doc, 40);
  if (!DOCS.includes(doc)) return res.status(404).json({ error: '없는 문서입니다.' });
  const pw = String(b.password ?? '');
  if (!L.siteOk(req) && !same(pw, process.env.STATS_PASSWORD) && !L.teamOk(pw)) { await wait(800); return res.status(401).json({ error: '비밀번호가 맞지 않습니다.' }); }
  try {
    if (b.action === 'get') { const cur = await readRows(doc); return res.status(200).json({ rows: cur.rows, updated: cur.updated }); }
    if (b.action === 'delete') {
      const id = s(b.id, 20);
      const out = await mutate(doc, rows => { const i = rows.findIndex(x => x.id === id); if (i < 0) return { error: '이미 지워진 일정입니다.', status: 404 }; const [x] = rows.splice(i, 1); return { ok: true, row: x }; },
        o => `계획안 일정 삭제: ${o.row.team} ${o.row.task.slice(0, 40)}`);
      return res.status(out.error ? out.status : 200).json(out);
    }
    if (b.action === 'save') {
      const src = b.row || {};
      const out = await mutate(doc, rows => {
        const i = src.id ? rows.findIndex(x => x.id === src.id) : -1;
        if (src.id && i < 0) return { error: '그 사이 지워진 일정입니다. 새로고침해 주세요.', status: 404 };
        const x = clean(src, i >= 0 ? rows[i] : null);
        if (i < 0) { x.id = 'r' + crypto.randomBytes(4).toString('hex'); x.created = nowKst(); rows.push(x); }
        else { x.edited = nowKst(); rows[i] = x; }
        return { ok: true, row: x };
      }, o => `계획안 일정 ${src.id ? '수정' : '추가'}: ${o.row.team} ${o.row.task.slice(0, 40)}`);
      return res.status(out.error ? out.status : 200).json(out);
    }
    return res.status(400).json({ error: '알 수 없는 요청입니다.' });
  } catch (e) {
    if (e.code === 400) return res.status(400).json({ error: e.message });
    return res.status(500).json({ error: L.ghError(e) });
  }
};
