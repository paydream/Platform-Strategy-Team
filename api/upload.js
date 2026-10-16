// 새 시안 올리기 — 관리자 비밀번호로. 파일은 하나씩(blob), 마지막에 한 번에 커밋(commit)
// 덮어쓰기 금지: 새 폴더(archive/YYYYMMDD-HHMMSS-이름)에만 쓰고 이미 있으면 멈춤
const L = require('./_lib');
const M = require('../admin/model.js');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
  if (!L.configured()) return res.status(503).json({ error: '서버 업로드가 아직 설정되지 않았습니다.' });
  try {
    const b = L.body(req);
    if (!L.adminOk(b.password)) return res.status(401).json({ error: '관리자 비밀번호가 맞지 않습니다.' });
    const folderFree = async f => !(await L.gh(`/repos/${L.REPO}/contents/${L.enc(f)}?ref=${encodeURIComponent(L.BRANCH)}`, { allow404: true }));

    if (b.action === 'check') return res.status(200).json({ ok: true });
    if (b.action === 'start') {
      if (!M.FOLDER_RE.test(b.folder || '')) return res.status(400).json({ error: '폴더 이름 형식이 올바르지 않습니다.' });
      if (!(await folderFree(b.folder))) return res.status(409).json({ error: `${b.folder} 폴더가 이미 있습니다. 덮어쓰지 않고 멈췄습니다.` });
      return res.status(200).json({ ok: true });
    }
    if (b.action === 'blob') {
      if (typeof b.b64 !== 'string' || !b.b64) return res.status(400).json({ error: '파일 내용이 비었습니다.' });
      const blob = await L.gh(`/repos/${L.REPO}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: b.b64, encoding: 'base64' }) });
      return res.status(200).json({ sha: blob.sha });
    }
    if (b.action === 'commit') {
      const { upload, files } = b;
      if (!upload || !M.FOLDER_RE.test(upload.folder || '')) return res.status(400).json({ error: '폴더 이름 형식이 올바르지 않습니다.' });
      if (!Array.isArray(files) || !files.length) return res.status(400).json({ error: '올릴 파일이 없습니다.' });
      for (const f of files)
        if (typeof f.path !== 'string' || !f.path.startsWith(upload.folder + '/') || f.path.includes('..') || !/^[0-9a-f]{40}$/.test(f.sha || ''))
          return res.status(400).json({ error: '파일 경로가 올바르지 않습니다.' });
      if (!(await folderFree(upload.folder))) return res.status(409).json({ error: `${upload.folder} 폴더가 이미 있습니다. 덮어쓰지 않고 멈췄습니다.` });

      for (let attempt = 0; attempt < 3; attempt++) {
        const ref = await L.gh(`/repos/${L.REPO}/git/ref/heads/${encodeURIComponent(L.BRANCH)}`);
        const head = await L.gh(`/repos/${L.REPO}/git/commits/${ref.object.sha}`);
        const pj = await L.gh(`/repos/${L.REPO}/contents/projects.json?ref=${ref.object.sha}`);
        const data = JSON.parse(Buffer.from(pj.content, 'base64').toString('utf8'));
        try { M.addUpload(data, upload); } catch (e) { return res.status(400).json({ error: e.message }); }
        const pjBlob = await L.gh(`/repos/${L.REPO}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64'), encoding: 'base64' }) });
        const tree = files.map(f => ({ path: f.path, mode: '100644', type: 'blob', sha: f.sha }));
        tree.push({ path: 'projects.json', mode: '100644', type: 'blob', sha: pjBlob.sha });
        const newTree = await L.gh(`/repos/${L.REPO}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: head.tree.sha, tree }) });
        const title = (upload.version && upload.version.title) || (upload.project && upload.project.title) || '';
        const commit = await L.gh(`/repos/${L.REPO}/git/commits`, { method: 'POST', body: JSON.stringify({ message: `아카이브 추가: ${String(title).slice(0, 100)} (관리자 페이지)`, tree: newTree.sha, parents: [ref.object.sha] }) });
        try {
          await L.gh(`/repos/${L.REPO}/git/refs/heads/${encodeURIComponent(L.BRANCH)}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha }) });
          return res.status(200).json({ ok: true, commit: commit.sha });
        } catch (e) { if (e.status !== 422) throw e; }
      }
      return res.status(409).json({ error: '다른 저장과 겹쳤습니다. 잠시 뒤 다시 올려 주세요.' });
    }
    return res.status(400).json({ error: '알 수 없는 요청입니다.' });
  } catch (e) { return res.status(500).json({ error: e.status === 413 ? '파일이 너무 큽니다.' : L.ghError(e) }); }
};
