// 통계 메뉴(stats.html) 데이터 — 통계 비밀번호를 맞혀야 내려준다.
// Vercel 환경변수: STATS_PASSWORD(통계 비밀번호), STATS_DATA(통계 JSON). 저장소가 공개라 비밀번호·수치는 코드에 두지 않는다.
const crypto = require('crypto');

function same(given, secret) {
  if (!secret || typeof given !== 'string') return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(secret).digest();
  return crypto.timingSafeEqual(a, b);
}
const body = req => (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}));
const wait = ms => new Promise(r => setTimeout(r, ms));

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
  if (!process.env.STATS_PASSWORD) return res.status(503).json({ error: '통계 비밀번호가 아직 설정되지 않았습니다.' });
  let b;
  try { b = body(req); } catch { return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' }); }
  if (!same(String(b.password ?? ''), process.env.STATS_PASSWORD)) {
    await wait(800); // 무작위 대입을 느리게
    return res.status(401).json({ error: '비밀번호가 맞지 않습니다.' });
  }
  let data = null;
  try { data = JSON.parse(process.env.STATS_DATA || 'null'); } catch { data = null; }
  if (!data) return res.status(503).json({ error: '통계 데이터가 아직 없습니다.' });
  return res.status(200).json(data);
};
