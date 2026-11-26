// 예스폼싸인 월 지표(월보고서) 「월간 인사이트」·「액션 플랜」 직접 수정 저장 (2026-11-26 사용자 요청)
// Vercel Hobby 서버 함수 12개 제한 때문에 따로 함수로 두지 않고 api/stats.js 가 ?notes=sign 요청을 이 파일로 넘긴다(밑줄 파일은 함수로 안 셈).
// GET  /api/stats?notes=sign                         → { months: { 'YYYY-MM' | 'q3-YYYY-MM'(최근 3개월, 시작 월): { insight, actions[], at, by } } }
// POST /api/stats?notes=sign { m, insight?, actions?, by? } → 그 달 값만 바꿔 저장 후 { ok, months }
//   insight: 문자열(줄바꿈 = 한 줄씩, 빈 문자열이면 자동 요약으로 되돌림)
//   actions: [{ t(할 일), owner(담당), due(기한), st('todo'|'doing'|'done') }] (최대 20개)
// 인증: 사이트 비밀번호 쿠키(siteOk). 저장: data/stats/sign-notes.enc.json (저장소가 공개라 암호화, 재배포 없음)
const L = require('./_lib');
const F = require('./_statsfile');
const ID = 'sign-notes';
const clip = (s, n) => String(s == null ? '' : s).replace(/\r/g, '').slice(0, n);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!L.siteOk(req)) return res.status(401).json({ error: '사이트 비밀번호가 필요합니다.' });
  try {
    if (req.method === 'GET') {
      let d = null; try { d = await F.readData(ID); } catch { d = null; }
      return res.status(200).json(d && d.months ? d : { months: {} });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
    let b; try { b = L.body(req); } catch { return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' }); }
    const m = String(b.m || '');
    if (!/^(q3-)?\d{4}-\d{2}$/.test(m)) return res.status(400).json({ error: '월 값이 올바르지 않습니다.' });
    let d = null; try { d = await F.readData(ID); } catch { d = null; }
    d = d && d.months ? d : { months: {} };
    const cur = { ...(d.months[m] || {}) };
    if (b.insight !== undefined) cur.insight = clip(b.insight, 4000);
    if (b.actions !== undefined) {
      if (!Array.isArray(b.actions)) return res.status(400).json({ error: '액션 플랜 형식이 올바르지 않습니다.' });
      cur.actions = b.actions.slice(0, 20).map(a => ({ t: clip(a && a.t, 300), owner: clip(a && a.owner, 60), due: clip(a && a.due, 30), st: ['todo', 'doing', 'done'].includes(a && a.st) ? a.st : 'todo' })).filter(a => a.t.trim());
    }
    cur.at = new Date().toISOString();
    if (b.by) cur.by = clip(b.by, 40);
    d.months[m] = cur;
    await F.writeData(ID, d, { updated: cur.at.slice(0, 10) });
    return res.status(200).json({ ok: true, months: d.months });
  } catch (e) { return res.status(500).json({ error: L.ghError(e) }); }
};
