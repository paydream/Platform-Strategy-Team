// 서버 API 공용: GitHub 호출, 비밀번호 확인
// Vercel 환경변수: GITHUB_TOKEN, ADMIN_PASSWORD, TEAM_PASSWORD(코멘트용, 없으면 ADMIN_PASSWORD 사용)
const crypto = require('crypto');
const REPO = process.env.GITHUB_REPO || 'paydream/Platform-Strategy-Team';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TOKEN = process.env.GITHUB_TOKEN;

async function gh(path, opts = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Accept: 'application/vnd.github+json', Authorization: `Bearer ${TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'design-archive',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (res.status === 404 && opts.allow404) return null;
  const text = await res.text();
  if (!res.ok) { const e = new Error(`GitHub ${res.status}`); e.status = res.status; throw e; }
  return text ? JSON.parse(text) : null;
}
const enc = p => p.split('/').map(encodeURIComponent).join('/');

async function readJson(path, fallback) {
  const f = await gh(`/repos/${REPO}/contents/${enc(path)}?ref=${encodeURIComponent(BRANCH)}`, { allow404: true });
  if (!f) return { sha: null, data: fallback };
  return { sha: f.sha, data: JSON.parse(Buffer.from(f.content, 'base64').toString('utf8')) };
}
async function writeJson(path, data, sha, message) {
  const body = { message, content: Buffer.from(JSON.stringify(data, null, 2) + '\n', 'utf8').toString('base64'), branch: BRANCH };
  if (sha) body.sha = sha;
  const r = await gh(`/repos/${REPO}/contents/${enc(path)}`, { method: 'PUT', body: JSON.stringify(body) });
  return r.content.sha;
}

function same(given, secret) {
  if (!secret || typeof given !== 'string') return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(secret).digest();
  return crypto.timingSafeEqual(a, b);
}
const adminOk = pw => same(pw, process.env.ADMIN_PASSWORD);
const teamOk = pw => same(pw, process.env.TEAM_PASSWORD || process.env.ADMIN_PASSWORD) || adminOk(pw);
const configured = () => Boolean(TOKEN && process.env.ADMIN_PASSWORD);

function body(req) { return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); }
function ghError(e) {
  return e.status === 401 ? '서버의 GitHub 토큰이 맞지 않거나 만료됐습니다.'
    : e.status === 403 ? '서버의 GitHub 토큰에 쓰기 권한이 없습니다.'
    : e.status === 409 ? '다른 저장과 겹쳤습니다. 잠시 뒤 다시 해 주세요.'
    : e.message && !e.status ? e.message : '처리 중 오류가 났습니다.';
}

module.exports = { REPO, BRANCH, gh, enc, readJson, writeJson, adminOk, teamOk, configured, body, ghError };
