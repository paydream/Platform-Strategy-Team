// 코멘트 — data/comments.json 한 파일에 모아 저장 (이 파일만 바뀐 커밋은 재배포 안 함: vercel.json ignoreCommand)
// GET  ?project=ID      → 그 프로젝트 코멘트 전부
// GET  ?summary=1       → 프로젝트별 코멘트 수
// POST {action:'add', password(팀), project, version, href, author, text}
// POST {action:'delete', password(관리자), id}
const crypto = require('crypto');
const L = require('./_lib');
const FILE = 'data/comments.json';
const MAX_TEXT = 500, MAX_NAME = 30;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!L.configured()) return res.status(503).json({ error: '코멘트 기능이 아직 설정되지 않았습니다.' });
  try {
    if (req.method === 'GET') {
      const { data } = await L.readJson(FILE, { comments: [] });
      const q = req.query || {};
      if (q.summary) {
        const counts = {};
        for (const c of data.comments) counts[c.project] = (counts[c.project] || 0) + 1;
        return res.status(200).json({ counts });
      }
      return res.status(200).json({ comments: data.comments.filter(c => c.project === q.project) });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
    const b = L.body(req);

    if (b.action === 'add') {
      if (!L.teamOk(b.password)) return res.status(401).json({ error: '팀 비밀번호가 맞지 않습니다.' });
      const author = String(b.author || '').trim(), text = String(b.text || '').trim();
      if (!author) return res.status(400).json({ error: '작성자 이름을 넣어 주세요.' });
      if (author.length > MAX_NAME) return res.status(400).json({ error: `이름은 ${MAX_NAME}자까지 쓸 수 있습니다.` });
      if (!text) return res.status(400).json({ error: '코멘트 내용을 넣어 주세요.' });
      if ([...text].length > MAX_TEXT) return res.status(400).json({ error: `코멘트는 ${MAX_TEXT}자까지 쓸 수 있습니다.` });
      if (!b.project || !b.version || typeof b.href !== 'string') return res.status(400).json({ error: '어느 화면의 코멘트인지 알 수 없습니다.' });
      const c = { id: crypto.randomBytes(6).toString('hex'), project: String(b.project), version: String(b.version), href: b.href.slice(0, 500),
                  author, text, created: new Date().toISOString() };
      for (let i = 0; i < 3; i++) {
        const cur = await L.readJson(FILE, { comments: [] });
        cur.data.comments.push(c);
        try { await L.writeJson(FILE, cur.data, cur.sha, `코멘트: ${author}`); return res.status(200).json({ ok: true, comment: c }); }
        catch (e) { if (e.status !== 409 && e.status !== 422) throw e; }
      }
      return res.status(409).json({ error: '동시에 코멘트가 몰렸습니다. 다시 눌러 주세요.' });
    }

    if (b.action === 'delete') {
      if (!L.adminOk(b.password)) return res.status(401).json({ error: '관리자 비밀번호가 맞지 않습니다.' });
      for (let i = 0; i < 3; i++) {
        const cur = await L.readJson(FILE, { comments: [] });
        const n = cur.data.comments.length;
        cur.data.comments = cur.data.comments.filter(c => c.id !== b.id);
        if (cur.data.comments.length === n) return res.status(404).json({ error: '이미 지워진 코멘트입니다.' });
        try { await L.writeJson(FILE, cur.data, cur.sha, '코멘트 삭제'); return res.status(200).json({ ok: true }); }
        catch (e) { if (e.status !== 409 && e.status !== 422) throw e; }
      }
      return res.status(409).json({ error: '다시 시도해 주세요.' });
    }
    return res.status(400).json({ error: '알 수 없는 요청입니다.' });
  } catch (e) { return res.status(500).json({ error: L.ghError(e) }); }
};
