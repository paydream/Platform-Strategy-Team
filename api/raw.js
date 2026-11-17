// 아직 배포되지 않은 시안 파일(archive/…)을 GitHub에서 바로 읽어 줌
// vercel.json rewrite: 배포된 정적 파일이 없을 때만 /archive/* → /api/raw?p=archive/*
// (커밋은 자동 배포되지 않으므로, 올린 직후 배포 전에도 시안이 열리게 하기 위함)
const L = require('./_lib');
const TYPES = { html: 'text/html; charset=utf-8', htm: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  webp: 'image/webp', ico: 'image/x-icon', woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf', mp4: 'video/mp4', pdf: 'application/pdf', txt: 'text/plain; charset=utf-8' };

module.exports = async (req, res) => {
  try {
    let p = (req.query && req.query.p) || '';
    if (Array.isArray(p)) p = p.join('/');
    try { p = decodeURIComponent(p); } catch {}
    p = p.normalize('NFC').replace(/^\/+/, '');
    if (!p.startsWith('archive/') || p.includes('..') || p.includes('\0')) return res.status(404).send('Not found');
    if (p.endsWith('/')) p += 'index.html';
    const r = await fetch(`https://api.github.com/repos/${L.REPO}/contents/${L.enc(p)}?ref=${encodeURIComponent(L.BRANCH)}`, {
      headers: { Accept: 'application/vnd.github.raw', Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'design-archive' },
    });
    if (!r.ok) return res.status(r.status === 404 ? 404 : 502).send(r.status === 404 ? 'Not found' : 'GitHub error');
    const ext = (p.split('.').pop() || '').toLowerCase();
    res.setHeader('Content-Type', TYPES[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'private, max-age=60');
    return res.status(200).send(Buffer.from(await r.arrayBuffer()));
  } catch (e) { return res.status(500).send('Error'); }
};
