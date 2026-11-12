// 통계 데이터 자동 갱신 — 매일 수집기(Aside 루틴)가 GA4·싸인 관리자에서 뽑은 데이터를 보낸다.
// 인증: Vercel 환경변수 STATS_UPDATE_KEY. 저장: data/stats/<id>.enc.json (암호화, 이 파일만 바뀐 커밋은 재배포 안 함)
const crypto = require('crypto');
const L = require('./_lib');
const F = require('./_statsfile');

const IDS = ['marketing']; // 자동 갱신을 받는 통계
function same(given, secret) {
  if (!secret || typeof given !== 'string') return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(secret).digest();
  return crypto.timingSafeEqual(a, b);
}
const wait = ms => new Promise(r => setTimeout(r, ms));

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
  if (!process.env.STATS_UPDATE_KEY || !process.env.GITHUB_TOKEN) return res.status(503).json({ error: '자동 갱신이 아직 설정되지 않았습니다.' });
  let b;
  try { b = L.body(req); } catch { return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' }); }
  if (!same(String(b.key ?? ''), process.env.STATS_UPDATE_KEY)) { await wait(800); return res.status(401).json({ error: '갱신 키가 맞지 않습니다.' }); }
  const id = String(b.id || '');
  if (!IDS.includes(id)) return res.status(404).json({ error: '없는 통계입니다.' });
  const d = b.data;
  if (!d || typeof d !== 'object' || !Array.isArray(d.months) || !d.months.length || !d.range || !/^\d{4}-\d{2}-\d{2}$/.test(d.range.end || ''))
    return res.status(400).json({ error: '데이터 형식이 올바르지 않습니다.' });
  if (JSON.stringify(d).length > 700000) return res.status(413).json({ error: '데이터가 너무 큽니다.' });
  const meta = { updated: String(d.updated || '').slice(0, 10), updatedAt: d.updatedAt || new Date().toISOString(), range: { start: d.range.start, end: d.range.end } };
  try {
    const sha = await F.writeData(id, d, meta);
    return res.status(200).json({ ok: true, id, meta, sha });
  } catch (e) { return res.status(500).json({ error: L.ghError(e) }); }
};
