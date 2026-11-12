// GA4·GTM 측정 관리 — data/tracking.json 한 파일에 모아 저장 (이 파일만 바뀐 커밋은 재배포 안 함: vercel.json ignoreCommand)
// GET                                   → 측정 항목 전체 (GitHub에서 바로 읽음)
// POST {action:'check', password}       → 팀 비밀번호 확인
// POST {action:'save', password(팀), author, item, originalId?} → 추가·수정 (상태가 바뀌면 이력에 자동 기록)
// POST {action:'log', password(팀), author, id, text}            → 이력 한 줄 추가
// POST {action:'delete', password(관리자), id}                    → 삭제
// GTM·GA4 스냅샷(data/tracking-snapshot.json)은 정적 파일이라 여기서 쓰지 않는다.
const L = require('./_lib');
const FILE = 'data/tracking.json';
const STATUS = ['plan', 'gtm', 'dev', 'verify', 'live', 'done', 'hold'];
const PRODUCTS = ['yesform', 'sign', 'editor'];
const KINDS = ['new', 'fix', 'existing'];
const TEXT = { title: 200, event: 120, eventType: 40, funnel: 30, impl: 30, owner: 30, due: 10, metrics: 1500, fire: 800, dedupe: 600,
  how: 800, note: 1500, location: 200, problem: 800, fix: 800, precondition: 600, verify: 600, action: 20, paramsText: 600 };
const wait = ms => new Promise(r => setTimeout(r, ms));
const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const LABEL = { plan: '계획', gtm: 'GTM 작업 중', dev: '개발 요청', verify: '검증 필요', live: '수집 중', done: '완료', hold: '보류' };

function clean(src, prev) {
  const it = { ...(prev || {}) };
  const id = String(src.id || '').trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{1,23}$/.test(id)) throw Object.assign(new Error('ID는 영문·숫자·하이픈 2~24자로 넣어 주세요 (예: YF-EX-07).'), { code: 400 });
  it.id = id;
  if (!PRODUCTS.includes(src.product)) throw Object.assign(new Error('제품을 골라 주세요.'), { code: 400 });
  it.product = src.product;
  it.kind = KINDS.includes(src.kind) ? src.kind : 'new';
  it.status = STATUS.includes(src.status) ? src.status : 'plan';
  for (const [k, max] of Object.entries(TEXT)) if (k in src) it[k] = String(src[k] ?? '').trim().slice(0, max);
  if (!it.title) throw Object.assign(new Error('측정 내용을 넣어 주세요.'), { code: 400 });
  if (it.due && !/^\d{4}-\d\d-\d\d$/.test(it.due)) it.due = '';
  for (const k of ['paramsReq', 'paramsOpt']) if (k in src) {
    const arr = Array.isArray(src[k]) ? src[k] : String(src[k] || '').split(/[,\s/]+/);
    it[k] = [...new Set(arr.map(x => String(x).trim()).filter(x => /^[A-Za-z_][A-Za-z0-9_]{0,39}$/.test(x)))].slice(0, 25);
  }
  if ('gtm' in src) {
    const g = src.gtm;
    it.gtm = g && (g.container || g.version || (g.tags || []).length) ? {
      container: String(g.container || '').slice(0, 20),
      version: g.version === '' || g.version == null ? null : Number(g.version) || null,
      tags: (Array.isArray(g.tags) ? g.tags : String(g.tags || '').split('\n')).map(s => String(s).trim()).filter(Boolean).slice(0, 15).map(s => s.slice(0, 120)),
    } : null;
  }
  it.log = Array.isArray(it.log) ? it.log : [];
  return it;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!L.configured()) return res.status(503).json({ error: '저장 기능이 아직 설정되지 않았습니다.' });
  try {
    if (req.method === 'GET') {
      const { data } = await L.readJson(FILE, { items: [] });
      return res.status(200).json(data);
    }
    if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
    let b; try { b = L.body(req); } catch { return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' }); }
    const author = String(b.author || '').trim().slice(0, 30);

    if (b.action === 'check') {
      if (!L.teamOk(b.password)) { await wait(800); return res.status(401).json({ error: '팀 비밀번호가 맞지 않습니다.' }); }
      return res.status(200).json({ ok: true, admin: L.adminOk(b.password) });
    }
    if (b.action === 'save' || b.action === 'log') {
      if (!L.teamOk(b.password)) { await wait(800); return res.status(401).json({ error: '팀 비밀번호가 맞지 않습니다.' }); }
      if (!author) return res.status(400).json({ error: '작성자 이름을 넣어 주세요.' });
      for (let i = 0; i < 3; i++) {
        const cur = await L.readJson(FILE, { items: [] });
        const items = cur.data.items || (cur.data.items = []);
        let saved, msg;
        if (b.action === 'log') {
          saved = items.find(x => x.id === b.id);
          if (!saved) return res.status(404).json({ error: '없는 항목입니다.' });
          const text = String(b.text || '').trim().slice(0, 500);
          if (!text) return res.status(400).json({ error: '내용을 넣어 주세요.' });
          (saved.log = saved.log || []).push({ date: today(), by: author, text });
          saved.updated = today(); msg = `측정 이력: ${saved.id}`;
        } else {
          const origId = String(b.originalId || '');
          const idx = origId ? items.findIndex(x => x.id === origId) : -1;
          if (origId && idx < 0) return res.status(404).json({ error: '그 사이 지워진 항목입니다. 새로고침해 주세요.' });
          const prev = idx >= 0 ? items[idx] : null;
          const it = clean(b.item || {}, prev);
          if (items.some((x, j) => x.id === it.id && j !== idx)) return res.status(409).json({ error: `ID ${it.id}는 이미 있습니다.` });
          if (!prev) it.log = [{ date: today(), by: author, text: `새 측정 등록 (${LABEL[it.status]})` }];
          else if (prev.status !== it.status) it.log.push({ date: today(), by: author, text: `상태 변경: ${LABEL[prev.status] || prev.status} → ${LABEL[it.status]}` });
          else it.log.push({ date: today(), by: author, text: '내용 수정' });
          if (it.log.length > 60) it.log = it.log.slice(-60);
          it.updated = today();
          if (idx >= 0) items[idx] = it; else items.push(it);
          saved = it; msg = `측정 ${prev ? '수정' : '추가'}: ${it.id}`;
        }
        cur.data.updated = today();
        try { await L.writeJson(FILE, cur.data, cur.sha, `${msg} (${author})`); return res.status(200).json({ ok: true, item: saved }); }
        catch (e) { if (e.status !== 409 && e.status !== 422) throw e; }
      }
      return res.status(409).json({ error: '동시에 저장이 몰렸습니다. 다시 눌러 주세요.' });
    }
    if (b.action === 'delete') {
      if (!L.adminOk(b.password)) { await wait(800); return res.status(401).json({ error: '삭제는 관리자 비밀번호가 필요합니다.' }); }
      for (let i = 0; i < 3; i++) {
        const cur = await L.readJson(FILE, { items: [] });
        const n = cur.data.items.length;
        cur.data.items = cur.data.items.filter(x => x.id !== b.id);
        if (cur.data.items.length === n) return res.status(404).json({ error: '이미 지워진 항목입니다.' });
        cur.data.updated = today();
        try { await L.writeJson(FILE, cur.data, cur.sha, `측정 삭제: ${b.id}`); return res.status(200).json({ ok: true }); }
        catch (e) { if (e.status !== 409 && e.status !== 422) throw e; }
      }
      return res.status(409).json({ error: '다시 시도해 주세요.' });
    }
    return res.status(400).json({ error: '알 수 없는 요청입니다.' });
  } catch (e) {
    if (e.code === 400) return res.status(400).json({ error: e.message });
    return res.status(500).json({ error: L.ghError(e) });
  }
};
