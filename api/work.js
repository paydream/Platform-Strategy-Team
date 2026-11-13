// 주요 업무 — 핀 꽂은 프로젝트 목록. data/work.json { pins: [{ id, at }] } (최근에 꽂은 것이 앞)
// 이 파일만 바뀐 커밋은 재배포 안 함(vercel.json ignoreCommand). 화면은 이 API로 GitHub에서 바로 읽음.
// GET                                 → { pins }
// POST { action: 'pin'|'unpin', project } → 사이트 비밀번호로 로그인한 쿠키(siteOk)만 있으면 누구나
const L = require('./_lib');
const FILE = 'data/work.json';

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!L.configured()) return res.status(503).json({ error: '저장 기능이 아직 설정되지 않았습니다.' });
  try {
    if (req.method === 'GET') {
      const { data } = await L.readJson(FILE, { pins: [] });
      return res.status(200).json({ pins: Array.isArray(data.pins) ? data.pins : [] });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
    if (!L.siteOk(req)) return res.status(401).json({ error: '사이트 비밀번호로 다시 로그인해 주세요.' });
    let b; try { b = L.body(req); } catch { return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' }); }
    const id = typeof b.project === 'string' ? b.project.slice(0, 120) : '';
    const on = b.action === 'pin' ? true : b.action === 'unpin' ? false : null;
    if (!id || on === null) return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' });
    if (on) {
      const { data: pj } = await L.readJson('projects.json', { projects: [] });
      if (!(pj.projects || []).some(p => p.id === id)) return res.status(404).json({ error: '없는 프로젝트입니다.' });
    }
    for (let attempt = 0; attempt < 3; attempt++) {
      const cur = await L.readJson(FILE, { pins: [] });
      const pins = Array.isArray(cur.data.pins) ? cur.data.pins : [];
      const has = pins.some(x => x.id === id);
      if (on === has) return res.status(200).json({ pins }); // 이미 그 상태
      const next = on ? [{ id, at: new Date().toISOString() }, ...pins] : pins.filter(x => x.id !== id);
      try {
        await L.writeJson(FILE, { pins: next }, cur.sha, `주요 업무 ${on ? '추가' : '해제'}: ${id}`);
        return res.status(200).json({ pins: next });
      } catch (e) { if (e.status !== 409 && e.status !== 422) throw e; }
    }
    return res.status(409).json({ error: '동시에 저장이 몰렸습니다. 다시 눌러 주세요.' });
  } catch (e) {
    return res.status(500).json({ error: L.ghError(e) });
  }
};
