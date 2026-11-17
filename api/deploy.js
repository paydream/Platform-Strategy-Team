// 사이트 배포 바로 시작 — 관리자 비밀번호로. 아카이브 업로드·목록 저장 뒤 훅 호출이 실패했거나, 관리자 화면 「지금 배포」 버튼에서 부른다.
const L = require('./_lib');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청입니다.' });
  let b; try { b = L.body(req); } catch { return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' }); }
  if (!L.adminOk(b.password)) return res.status(401).json({ error: '관리자 비밀번호가 맞지 않습니다.' });
  const deployed = await L.deploy('admin deploy button');
  return deployed ? res.status(200).json({ ok: true, deployed }) : res.status(502).json({ error: '배포 요청이 실패했습니다. 잠시 뒤 다시 눌러 주세요.' });
};
