/* 예스폼싸인 · 고객센터 공지사항 — 동작 (기존 화면 yesformsign.com 과 같은 흐름)
   · 목록 줄을 누르면 아래에 본문이 열리고 화살표가 위로 돎 · 다른 줄을 열면 앞의 본문은 닫힘
   · 한 쪽에 10건 — [다음 페이지] · ‹ › 로 쪽을 넘김 (지금은 3건이라 1쪽뿐 · 눌러도 그대로) */
(function () {
  var root = document.querySelector('[data-notice]');
  if (!root) return;
  var PER = 10;
  var items = [].slice.call(root.querySelectorAll('.fitem'));
  var total = Math.max(1, Math.ceil(items.length / PER));
  var cur = root.querySelector('[data-page-cur]');
  var cnt = root.querySelector('[data-page-total]');
  var page = 1;

  function closeAll() {
    items.forEach(function (it) {
      it.classList.remove('is-open');
      it.querySelector('.fitem__q').setAttribute('aria-expanded', 'false');
      it.querySelector('.fitem__a').hidden = true;
    });
  }
  function go(n) {
    page = Math.min(Math.max(1, n), total);
    closeAll();
    items.forEach(function (it, i) { it.hidden = Math.floor(i / PER) + 1 !== page; });
    cur.textContent = page;
    cnt.textContent = total;
  }

  root.addEventListener('click', function (e) {
    var q = e.target.closest('.fitem__q');
    if (q) {
      var it = q.parentNode, wasOpen = it.classList.contains('is-open');
      closeAll();
      if (!wasOpen) {
        it.classList.add('is-open');
        q.setAttribute('aria-expanded', 'true');
        it.querySelector('.fitem__a').hidden = false;
      }
      return;
    }
    var b = e.target.closest('[data-page]');
    if (b) go(page + (b.getAttribute('data-page') === 'prev' ? -1 : 1));
  });

  go(1);
})();
