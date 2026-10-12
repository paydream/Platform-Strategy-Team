// 아카이브 목록(projects.json) 읽기·저장 API — 관리자 페이지에서 GitHub 토큰 없이 저장할 때 씀
// Vercel 환경변수 필요:
//   GITHUB_TOKEN    : paydream/Platform-Strategy-Team 저장소 Contents Read and write 권한 토큰
//   ADMIN_PASSWORD  : 관리자 페이지 비밀번호
// 선택: GITHUB_REPO (기본 paydream/Platform-Strategy-Team), GITHUB_BRANCH (기본 main)
const crypto = require('crypto');

const REPO = process.env.GITHUB_REPO || 'paydream/Platform-Strategy-Team';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TOKEN = process.env.GITHUB_TOKEN;
const PASSWORD = process.env.ADMIN_PASSWORD;

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
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`GitHub ${res.status}`);
    err.status = res.status; err.detail = text.slice(0, 300);
    throw err;
  }
  return text ? JSON.parse(text) : null;
}

function passwordOk(given) {
  if (!PASSWORD || typeof given !== 'string') return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

async function readCurrent() {
  const f = await gh(`/repos/${REPO}/contents/projects.json?ref=${encodeURIComponent(BRANCH)}`);
  return { sha: f.sha, data: JSON.parse(Buffer.from(f.content, 'base64').toString('utf8')) };
}

// 덮어쓰기 방지: 이미 있는 항목의 폴더·경로는 못 바꾸고, 항목을 지울 수도 없음(숨기기만 가능)
function checkNoOverwrite(oldData, newData) {
  if (!newData || !Array.isArray(newData.projects)) return '목록 형식이 올바르지 않습니다.';
  const byId = new Map(newData.projects.map(p => [p.id, p]));
  if (byId.size !== newData.projects.length) return '같은 ID 항목이 두 번 들어 있습니다.';
  for (const old of oldData.projects) {
    const p = byId.get(old.id);
    if (!p) return `"${old.title}" 항목을 지울 수 없습니다. 숨기기를 써 주세요.`;
    if (p.folder !== old.folder || p.preview !== old.preview) return `"${old.title}" 항목의 폴더·경로는 바꿀 수 없습니다.`;
    const oh = (old.versions || []).map(v => v.href).join('\n');
    const nh = (p.versions || []).map(v => v.href).join('\n');
    if (oh !== nh) return `"${old.title}" 항목의 시안 경로는 바꿀 수 없습니다.`;
  }
  if (newData.projects.length !== oldData.projects.length) return '여기서는 항목을 새로 만들 수 없습니다. 새 시안은 2번에서 올려 주세요.';
  for (const p of newData.projects) {
    for (const k of ['title', 'desc', 'category', 'created', 'updated']) {
      if (p[k] != null && typeof p[k] !== 'string') return '글자 항목 형식이 올바르지 않습니다.';
      if (typeof p[k] === 'string' && p[k].length > 2000) return '글자가 너무 깁니다.';
    }
  }
  return null;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const enabled = Boolean(TOKEN && PASSWORD);
  try {
    if (req.method === 'GET') {
      if (!enabled) return res.status(200).json({ enabled: false });
      const cur = await readCurrent();
      return res.status(200).json({ enabled: true, sha: cur.sha, data: cur.data });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
    if (!enabled) return res.status(503).json({ error: '서버 저장이 아직 설정되지 않았습니다.' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (!passwordOk(body.password)) return res.status(401).json({ error: '관리자 비밀번호가 맞지 않습니다.' });
    if (body.check) return res.status(200).json({ ok: true });

    const cur = await readCurrent();
    if (body.sha !== cur.sha) return res.status(409).json({ error: '그사이 다른 곳에서 목록이 바뀌었습니다. 새로고침 후 다시 해주세요.' });
    const problem = checkNoOverwrite(cur.data, body.data);
    if (problem) return res.status(400).json({ error: problem });

    const content = Buffer.from(JSON.stringify(body.data, null, 2) + '\n', 'utf8').toString('base64');
    const r = await gh(`/repos/${REPO}/contents/projects.json`, {
      method: 'PUT',
      body: JSON.stringify({ message: '아카이브 목록 수정 (관리자 페이지)', content, sha: cur.sha, branch: BRANCH }),
    });
    return res.status(200).json({ ok: true, sha: r.content.sha });
  } catch (e) {
    const msg = e.status === 401 ? '서버의 GitHub 토큰이 맞지 않거나 만료됐습니다.'
      : e.status === 403 ? '서버의 GitHub 토큰에 쓰기 권한이 없습니다.'
      : e.status === 409 ? '그사이 다른 곳에서 목록이 바뀌었습니다. 새로고침 후 다시 해주세요.'
      : '저장 중 오류가 났습니다.';
    return res.status(500).json({ error: msg });
  }
};
