// 새 시안 올리기 API — 관리자 페이지에서 GitHub 토큰 없이 관리자 비밀번호만으로 올릴 때 씀
// 파일은 한 개씩 보내고(action: 'blob'), 마지막에 한 번에 커밋(action: 'commit')
// 덮어쓰기 금지: 새 폴더(archive/YYYYMMDD-HHMMSS-이름)에만 쓰고, 그 폴더가 이미 있으면 멈춤
// Vercel 환경변수: GITHUB_TOKEN, ADMIN_PASSWORD (선택: GITHUB_REPO, GITHUB_BRANCH)
const crypto = require('crypto');

const REPO = process.env.GITHUB_REPO || 'paydream/Platform-Strategy-Team';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TOKEN = process.env.GITHUB_TOKEN;
const PASSWORD = process.env.ADMIN_PASSWORD;
const FOLDER_RE = /^archive\/\d{8}-\d{6}-[a-z0-9-]{1,60}$/;

async function gh(path, opts = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'design-archive-admin',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (res.status === 404 && opts.allow404) return null;
  const text = await res.text();
  if (!res.ok) { const e = new Error(`GitHub ${res.status}`); e.status = res.status; throw e; }
  return text ? JSON.parse(text) : null;
}

function passwordOk(given) {
  if (!PASSWORD || typeof given !== 'string') return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

const enc = p => p.split('/').map(encodeURIComponent).join('/');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
  if (!(TOKEN && PASSWORD)) return res.status(503).json({ error: '서버 업로드가 아직 설정되지 않았습니다.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (!passwordOk(body.password)) return res.status(401).json({ error: '관리자 비밀번호가 맞지 않습니다.' });
    if (body.action === 'check') return res.status(200).json({ ok: true });

    if (body.action === 'start') {
      if (!FOLDER_RE.test(body.folder || '')) return res.status(400).json({ error: '폴더 이름 형식이 올바르지 않습니다.' });
      const exists = await gh(`/repos/${REPO}/contents/${enc(body.folder)}?ref=${encodeURIComponent(BRANCH)}`, { allow404: true });
      if (exists) return res.status(409).json({ error: `${body.folder} 폴더가 이미 있습니다. 덮어쓰지 않고 멈췄습니다.` });
      return res.status(200).json({ ok: true });
    }

    if (body.action === 'blob') {
      if (typeof body.b64 !== 'string' || !body.b64) return res.status(400).json({ error: '파일 내용이 비었습니다.' });
      const blob = await gh(`/repos/${REPO}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: body.b64, encoding: 'base64' }) });
      return res.status(200).json({ sha: blob.sha });
    }

    if (body.action === 'commit') {
      const { folder, files, entry, title } = body;
      if (!FOLDER_RE.test(folder || '')) return res.status(400).json({ error: '폴더 이름 형식이 올바르지 않습니다.' });
      if (!Array.isArray(files) || !files.length) return res.status(400).json({ error: '올릴 파일이 없습니다.' });
      for (const f of files) {
        if (typeof f.path !== 'string' || !f.path.startsWith(folder + '/') || f.path.includes('..') || !/^[0-9a-f]{40}$/.test(f.sha || ''))
          return res.status(400).json({ error: '파일 경로가 올바르지 않습니다.' });
      }
      // 커밋 직전에 한 번 더: 폴더가 이미 있으면 멈춤
      const exists = await gh(`/repos/${REPO}/contents/${enc(folder)}?ref=${encodeURIComponent(BRANCH)}`, { allow404: true });
      if (exists) return res.status(409).json({ error: `${folder} 폴더가 이미 있습니다. 덮어쓰지 않고 멈췄습니다.` });

      // 목록 항목은 서버에서 경로를 다시 맞춰 만듦
      const id = folder.slice('archive/'.length);
      const str = (v, n) => (typeof v === 'string' ? v : '').slice(0, n);
      const vers = (Array.isArray(entry && entry.versions) ? entry.versions : [])
        .filter(v => v && typeof v.href === 'string' && v.href.startsWith(folder + '/'))
        .map(v => ({ label: str(v.label, 100) || '시안', href: v.href }));
      if (!vers.length) return res.status(400).json({ error: '시안 버튼이 하나도 없습니다.' });
      const preview = typeof entry.preview === 'string' && entry.preview.startsWith(folder + '/') ? entry.preview : vers[0].href;

      for (let attempt = 0; attempt < 3; attempt++) {
        const ref = await gh(`/repos/${REPO}/git/ref/heads/${encodeURIComponent(BRANCH)}`);
        const head = await gh(`/repos/${REPO}/git/commits/${ref.object.sha}`);
        const pj = await gh(`/repos/${REPO}/contents/projects.json?ref=${ref.object.sha}`);
        const data = JSON.parse(Buffer.from(pj.content, 'base64').toString('utf8'));
        if ([...data.projects, ...(data.trash || [])].some(p => p.id === id)) return res.status(409).json({ error: '같은 ID 항목이 이미 있습니다.' });
        const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10).replace(/-/g, '.');
        data.projects.unshift({
          id, title: str(entry.title, 200) || '제목 없음', desc: str(entry.desc, 2000), category: str(entry.category, 50) || '기타',
          created: str(entry.created, 20) || today, updated: today, hidden: false, folder, preview, versions: vers,
        });
        const pjBlob = await gh(`/repos/${REPO}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64'), encoding: 'base64' }) });
        const tree = files.map(f => ({ path: f.path, mode: '100644', type: 'blob', sha: f.sha }));
        tree.push({ path: 'projects.json', mode: '100644', type: 'blob', sha: pjBlob.sha });
        const newTree = await gh(`/repos/${REPO}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: head.tree.sha, tree }) });
        const commit = await gh(`/repos/${REPO}/git/commits`, { method: 'POST', body: JSON.stringify({ message: `아카이브 추가: ${str(title || entry.title, 100)} (관리자 페이지)`, tree: newTree.sha, parents: [ref.object.sha] }) });
        try {
          await gh(`/repos/${REPO}/git/refs/heads/${encodeURIComponent(BRANCH)}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha }) });
          return res.status(200).json({ ok: true, commit: commit.sha });
        } catch (e) {
          if (e.status !== 422) throw e; // 그사이 다른 저장이 끼어듦 → 최신 상태로 다시
        }
      }
      return res.status(409).json({ error: '다른 저장과 겹쳤습니다. 잠시 뒤 다시 올려 주세요.' });
    }

    return res.status(400).json({ error: '알 수 없는 요청입니다.' });
  } catch (e) {
    const msg = e.status === 401 ? '서버의 GitHub 토큰이 맞지 않거나 만료됐습니다.'
      : e.status === 403 ? '서버의 GitHub 토큰에 쓰기 권한이 없습니다.'
      : e.status === 413 ? '파일이 너무 큽니다.'
      : '올리는 중 오류가 났습니다.';
    return res.status(500).json({ error: msg });
  }
};
