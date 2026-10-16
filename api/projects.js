// 아카이브 목록(projects.json) 읽기·저장 — 관리자 비밀번호로 저장
const L = require('./_lib');
const M = require('../admin/model.js');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      if (!L.configured()) return res.status(200).json({ enabled: false });
      const cur = await L.readJson('projects.json', { projects: [] });
      return res.status(200).json({ enabled: true, sha: cur.sha, data: cur.data });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
    if (!L.configured()) return res.status(503).json({ error: '서버 저장이 아직 설정되지 않았습니다.' });
    const b = L.body(req);
    if (!L.adminOk(b.password)) return res.status(401).json({ error: '관리자 비밀번호가 맞지 않습니다.' });
    if (b.check) return res.status(200).json({ ok: true });

    const cur = await L.readJson('projects.json', { projects: [] });
    if (b.sha !== cur.sha && JSON.stringify(cur.data) !== JSON.stringify(b.base))
      return res.status(409).json({ error: '그사이 다른 사람이 목록을 바꿨습니다. 새로고침해서 최신 목록을 불러온 뒤 다시 고쳐 주세요.' });
    const problem = M.checkSave(cur.data, b.data);
    if (problem) return res.status(400).json({ error: problem });
    const sha = await L.writeJson('projects.json', b.data, cur.sha, '아카이브 목록 수정 (관리자 페이지)');
    return res.status(200).json({ ok: true, sha });
  } catch (e) { return res.status(500).json({ error: L.ghError(e) }); }
};
