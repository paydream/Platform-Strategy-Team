// 예스폼 주요 업데이트 캘린더 — 플로우 게시판 업무(작업자 = 유영경·심현지·박채은) 저장본.
// 저장: data/stats/calendar.enc.json (공개 저장소라 암호화, api/_statsfile.js 재사용). 이 파일만 바뀐 커밋은 재배포 안 함.
// GET: 저장본 읽기. POST { key, data }: STATS_UPDATE_KEY (Aside가 플로우에서 모아 보낸다).
const crypto = require('crypto');
const L = require('./_lib');
const F = require('./_statsfile');

const ID = 'calendar';
function same(given, secret) {
  if (!secret || typeof given !== 'string') return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(secret).digest();
  return crypto.timingSafeEqual(a, b);
}
const wait = ms => new Promise(r => setTimeout(r, ms));

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    try {
      const data = await F.readData(ID);
      if (!data) return res.status(404).json({ error: '아직 저장된 일정이 없습니다.' });
      return res.status(200).json(data);
    } catch (e) { return res.status(500).json({ error: L.ghError(e) }); }
  }
  if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
  if (!process.env.STATS_UPDATE_KEY || !process.env.GITHUB_TOKEN) return res.status(503).json({ error: '자동 갱신이 아직 설정되지 않았습니다.' });
  let b;
  try { b = L.body(req); } catch { return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' }); }
  if (!same(String(b.key ?? ''), process.env.STATS_UPDATE_KEY)) { await wait(800); return res.status(401).json({ error: '갱신 키가 맞지 않습니다.' }); }
  const d = b.data;
  if (!d || typeof d !== 'object' || !/^\d{4}-\d{2}-\d{2}$/.test(d.updated || '')
      || !d.flow || !Array.isArray(d.flow.items))
    return res.status(400).json({ error: '데이터 형식이 올바르지 않습니다.' });
  if (JSON.stringify(d).length > 900000) return res.status(413).json({ error: '데이터가 너무 큽니다.' });
  const meta = { updated: d.updated, updatedAt: d.updatedAt || new Date().toISOString(), range: d.flow.range || { start: d.updated, end: d.updated } };
  try {
    const sha = await F.writeData(ID, d, meta);
    return res.status(200).json({ ok: true, id: ID, meta, sha });
  } catch (e) { return res.status(500).json({ error: L.ghError(e) }); }
};
