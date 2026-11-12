// 통계 데이터 — 목록(GET)은 누구나 볼 수 있고, 데이터(POST)는 통계 비밀번호를 맞혀야 내려준다.
// Vercel 환경변수: STATS_PASSWORD(통계 비밀번호), 데이터별 JSON(아래 LIST의 env).
// 저장소가 공개라 비밀번호·수치는 코드에 두지 않는다. 목록(제목·기간·출처)만 여기 둔다.
const crypto = require('crypto');

// 메인 오른쪽 사이드바 "통계 데이터" 목록. 새 통계를 올리면 맨 앞에 추가하고, 데이터는 env에 넣는다.
const LIST = [
  {
    id: 'yesform-age',
    title: '예스폼 한국 사용자 연령·해상도',
    desc: '연령대별 사용자 추이 · 연령별 기기·해상도 분포 · 많이 쓰는 해상도',
    product: '예스폼',
    period: '2022.09 ~ 2026.10 (4년 2개월)',
    source: 'GA4',
    updated: '2026-11-12',
    href: 'stats-age.html',
    env: 'STATS_DATA_YESFORM_AGE',
  },
  {
    id: 'marketing',
    title: '에디터·싸인 마케팅 성과',
    desc: '방문·가입·결제 흐름 · 채널별 성과 · 일별/주별/월별 추이',
    product: '에디터 · 예스폼싸인',
    period: '2026.08 ~ 2026.11.10',
    source: 'GA4 · 싸인 관리자',
    updated: '2026-11-11',
    href: 'stats.html',
    env: 'STATS_DATA',
  },
];

function same(given, secret) {
  if (!secret || typeof given !== 'string') return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(secret).digest();
  return crypto.timingSafeEqual(a, b);
}
const body = req => (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}));
const wait = ms => new Promise(r => setTimeout(r, ms));
const pub = ({ env, ...rest }) => rest;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return res.status(200).json({ list: LIST.map(pub) });
  if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
  if (!process.env.STATS_PASSWORD) return res.status(503).json({ error: '통계 비밀번호가 아직 설정되지 않았습니다.' });
  let b;
  try { b = body(req); } catch { return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' }); }
  if (!same(String(b.password ?? ''), process.env.STATS_PASSWORD)) {
    await wait(800); // 무작위 대입을 느리게
    return res.status(401).json({ error: '비밀번호가 맞지 않습니다.' });
  }
  if (b.check) return res.status(200).json({ ok: true }); // 사이드바에서 비밀번호만 확인
  const item = LIST.find(x => x.id === (b.id || 'marketing'));
  if (!item) return res.status(404).json({ error: '없는 통계입니다.' });
  let data = null;
  try { data = JSON.parse(process.env[item.env] || 'null'); } catch { data = null; }
  if (!data) return res.status(503).json({ error: '통계 데이터가 아직 없습니다.' });
  return res.status(200).json(data);
};
