/* 예스폼 서식 상세페이지 — 포맷_HTML (2026-11-02) */

/* 미리보기 — 왼쪽 썸네일을 누르면 큰 화면 · 쪽 번호가 바뀜 · 위/아래 버튼으로 썸네일 목록을 한 칸씩 넘김 */
(function () {
  var list = document.getElementById('thumbs');
  var big = document.getElementById('viewer-img');
  var now = document.getElementById('page-now');
  if (!list || !big) return;
  var thumbs = [].slice.call(list.querySelectorAll('.thumb'));

  // 세로로 긴 쪽(1쪽)은 Figma 처럼 341 × 480 으로 꽉 차게, 가로로 긴 쪽은 화면 안에 다 보이게
  function fitShape() {
    var portrait = big.naturalHeight >= big.naturalWidth;
    big.classList.toggle('is-portrait', portrait);
    big.classList.toggle('is-landscape', !portrait);
  }
  big.addEventListener('load', fitShape);
  if (big.complete && big.naturalWidth) fitShape();

  function show(t) {
    thumbs.forEach(function (x) { x.classList.toggle('is-on', x === t); x.setAttribute('aria-current', x === t ? 'true' : 'false'); });
    var page = t.getAttribute('data-page');
    big.src = t.querySelector('img').getAttribute('src');
    big.alt = '폭염 대응 안전 관리 계획 ' + page + '페이지 미리보기';
    now.textContent = page;
    // 고른 썸네일이 목록 밖이면 보이게
    var top = t.parentNode.offsetTop - list.offsetTop;
    if (top < list.scrollTop || top + t.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = top;
  }
  thumbs.forEach(function (t) { t.addEventListener('click', function () { show(t); }); });

  var STEP = 110; // 썸네일 106 + 간격 4
  document.querySelectorAll('[data-thumbs]').forEach(function (b) {
    b.addEventListener('click', function () {
      list.scrollTop += b.getAttribute('data-thumbs') === 'up' ? -STEP : STEP;
    });
  });
})();

/* 찜 버튼 — 누를 때마다 켜짐 / 꺼짐 */
(function () {
  document.querySelectorAll('.like').forEach(function (b) {
    b.addEventListener('click', function () {
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });
})();

/* 함께 많이 확인한 서식 — 좌우 버튼으로 카드 한 장씩 넘김 (카드가 4장보다 많을 때만 움직임) */
(function () {
  var list = document.getElementById('related');
  if (!list) return;
  var prev = document.querySelector('.related__arrow--prev');
  var next = document.querySelector('.related__arrow--next');
  function step() { var c = list.querySelector('.card'); return c ? c.offsetWidth + 33 : 253; }
  function sync() {
    var max = list.scrollWidth - list.clientWidth;
    prev.disabled = list.scrollLeft <= 0;
    next.disabled = max > 0 && list.scrollLeft >= max - 1;
  }
  prev.addEventListener('click', function () { list.scrollBy({ left: -step(), behavior: 'smooth' }); });
  next.addEventListener('click', function () { list.scrollBy({ left: step(), behavior: 'smooth' }); });
  list.addEventListener('scroll', sync);
  sync();
})();

/* PPT 사용법 안내 탭 — 누른 탭만 주황색 */
(function () {
  var tabs = [].slice.call(document.querySelectorAll('.gtab'));
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { var on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); });
    });
  });
})();
