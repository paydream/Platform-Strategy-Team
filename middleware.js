// 사이트 전체 비밀번호: 처음 접속하면 비밀번호 화면을 보여주고, 맞히면 30일짜리 쿠키를 준다.
// 비밀번호 = Vercel 환경변수 SITE_PASSWORD (없으면 STATS_PASSWORD). 비밀번호를 바꾸면 기존 쿠키는 모두 무효가 된다.
// 예외: Aside 루틴의 데이터 업로드(POST /api/stats-update, /api/wbs — 자체 키로 보호), x-pst-key 헤더(= STATS_UPDATE_KEY)가 맞는 요청, robots.txt.
// 쿠키 값 계산은 api/_lib.js 의 siteOk 와 같아야 한다.
export const config = { runtime: 'nodejs' };

const COOKIE = 'pst_site';
const MAX_AGE = 60 * 60 * 24 * 30;
const enc = new TextEncoder();

async function token(pw) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('pst-site-v1'));
  return Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('');
}
function eq(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
function getCookie(req, name) {
  const c = req.headers.get('cookie') || '';
  for (const part of c.split(';')) { const i = part.indexOf('='); if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim()); }
  return '';
}
const next = () => new Response(null, { headers: { 'x-middleware-next': '1' } });
const safeTo = t => (typeof t === 'string' && t.startsWith('/') && !t.startsWith('//') && !t.startsWith('/__')) ? t : '/';
const escHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function page(to, err, status) {
  const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>플랫폼전략팀 업무 아카이브</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Pretendard Variable",Pretendard,sans-serif;background:#f6f7f9;color:#191f28;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;-webkit-font-smoothing:antialiased}
form{background:#fff;border:1px solid #e5e8ec;border-radius:16px;padding:36px 28px 26px;width:100%;max-width:360px;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.04)}
.mark{width:44px;height:44px;border-radius:12px;background:#2f6bff;color:#fff;display:grid;place-items:center;margin:0 auto 14px}
h1{font-size:19px}
p{font-size:13px;color:#6b7684;margin-top:4px}
input{margin-top:20px;width:100%;height:48px;border:1px solid #e5e8ec;border-radius:10px;padding:0 14px;font:inherit;font-size:18px;letter-spacing:.3em;text-align:center}
input:focus{outline:none;border-color:#2f6bff;box-shadow:0 0 0 3px rgba(47,107,255,.15)}
button{margin-top:10px;width:100%;height:46px;border:0;border-radius:10px;background:#2f6bff;color:#fff;font:inherit;font-weight:600;font-size:15px;cursor:pointer}
.err{color:#e5484d;font-size:13px;margin-top:10px;min-height:20px}
</style></head><body>
<form method="post" action="/__login" autocomplete="off" onsubmit="try{sessionStorage.setItem('pst_stats_pw','site')}catch(e){}">
  <div class="mark" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3 7.5l9 4.5 9-4.5z" fill="#fff"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/></svg></div>
  <h1>플랫폼전략팀 업무 아카이브</h1>
  <p>비밀번호를 입력해 주세요.</p>
  <input name="password" type="password" inputmode="numeric" maxlength="40" aria-label="비밀번호" autofocus required>
  <input type="hidden" name="to" value="${escHtml(to)}">
  <button type="submit">확인</button>
  <div class="err" role="alert">${err ? escHtml(err) : ''}</div>
</form></body></html>`;
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' } });
}

export default async function middleware(req) {
  const url = new URL(req.url);
  const p = url.pathname;
  if (p === '/robots.txt') return next();
  if (req.method === 'POST' && (p === '/api/stats-update' || p === '/api/wbs')) return next();
  const routineKey = process.env.STATS_UPDATE_KEY;
  if (routineKey && eq(req.headers.get('x-pst-key') || '', routineKey)) return next();

  const pw = process.env.SITE_PASSWORD || process.env.STATS_PASSWORD;
  if (!pw) return new Response('사이트 비밀번호가 설정되지 않았습니다.', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  const tk = await token(pw);

  if (p === '/__logout') {
    return new Response(null, { status: 303, headers: { Location: '/', 'Set-Cookie': `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`, 'cache-control': 'no-store' } });
  }
  if (p === '/__login') {
    if (req.method !== 'POST') return Response.redirect(new URL('/', url), 303);
    let given = '', to = '/';
    try { const f = await req.formData(); given = String(f.get('password') || '').trim(); to = safeTo(String(f.get('to') || '/')); } catch {}
    if (given && eq(await token(given), tk)) {
      return new Response(null, { status: 303, headers: { Location: to, 'Set-Cookie': `${COOKIE}=${tk}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`, 'cache-control': 'no-store' } });
    }
    await new Promise(r => setTimeout(r, 800)); // 무작위 대입을 느리게
    return page(to, '비밀번호가 맞지 않습니다.', 401);
  }

  if (eq(getCookie(req, COOKIE), tk)) return next();

  if (p.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: '사이트 비밀번호가 필요합니다. 페이지를 새로고침해 주세요.' }), { status: 401, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
  }
  return page(safeTo(p + url.search), '', 401);
}
