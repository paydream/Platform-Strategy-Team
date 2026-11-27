/* 예스폼싸인 · 고객센터 — 세 화면(FAQ · 공지사항 · 문의하기) 공용
   · 링크 자리(href="#")는 연결할 화면이 없어서, 눌러도 화면이 맨 위로 튀지 않게만 막음 */
document.addEventListener('click', function (e) {
  if (e.target.closest('a[href="#"]')) e.preventDefault();
});
