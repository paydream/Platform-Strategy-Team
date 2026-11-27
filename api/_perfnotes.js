// 성과 측정 상세 「주간 인사이트」·「추천 액션플랜」 직접 수정 저장 (2026-11-27 사용자 요청)
// Vercel Hobby 서버 함수 12개 제한 때문에 따로 함수로 두지 않고 api/stats.js 가 ?notes=perf 요청을 이 파일로 넘긴다(밑줄 파일은 함수로 안 셈).
// GET  /api/stats?notes=perf                       → { weeks: { '<항목 id>|<그 주 월요일 YYYY-MM-DD>': { ins, act, at } } }
// POST /api/stats?notes=perf { k, ins?, act? }     → 그 키 값만 바꿔 저장 후 { ok, weeks }
//   ins·act: 문자열(줄바꿈 = 한 줄씩, **굵게** 가능). 빈 문자열이면 그 칸은 자동 내용으로 되돌림.
// 인증: api/stats.js 에서 사이트 비밀번호 + 성과 측정 비밀번호(pst_perf)를 확인한 뒤 넘긴다.
// 저장: data/stats/perf-notes.enc.json (저장소가 공개라 암호화, 재배포 없음)
const L = require('./_lib');
const F = require('./_statsfile');
const ID = 'perf-notes';
const clip = (s, n) => String(s == null ? '' : s).replace(/\r/g, '').slice(0, n);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      let d = null; try { d = await F.readData(ID); } catch { d = null; }
      return res.status(200).json(d && d.weeks ? d : { weeks: {} });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
    let b; try { b = L.body(req); } catch { return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' }); }
    const k = String(b.k || '');
    if (!/^[a-z0-9-]{1,60}\|\d{4}-\d{2}-\d{2}$/.test(k)) return res.status(400).json({ error: '키 값이 올바르지 않습니다.' });
    let d = null; try { d = await F.readData(ID); } catch { d = null; }
    d = d && d.weeks ? d : { weeks: {} };
    const cur = { ...(d.weeks[k] || {}) };
    if (b.ins !== undefined) cur.ins = clip(b.ins, 4000);
    if (b.act !== undefined) cur.act = clip(b.act, 4000);
    cur.at = new Date().toISOString();
    if (!(cur.ins || '').trim() && !(cur.act || '').trim()) delete d.weeks[k]; else d.weeks[k] = cur;
    await F.writeData(ID, d, { updated: cur.at.slice(0, 10) });
    return res.status(200).json({ ok: true, weeks: d.weeks });
  } catch (e) { return res.status(500).json({ error: L.ghError(e) }); }
};
