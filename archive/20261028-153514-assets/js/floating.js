/* 플로팅_싸인 등장 (2026-10-28) — 위쪽 검은 바의 탭으로 시안을 고름 (검토용)
   시안01  페이지에 들어오면 폼 타일 · 도장 → 말풍선 순서로 한 번 등장 (css/floating.css 의 data-enter)
           · 그림 2장을 다 불러온 뒤 시작 (늦어도 1.5초 뒤에는 시작)
           · "등장 다시 보기" 버튼을 누르면 처음부터 다시
   시안02  스크롤을 SHOW_AT(100px) 넘게 내리면 아래에서 위로 등장 · 맨 위로 올리면 다시 숨음 (data-scroll)
   · 마지막으로 본 탭 기억 · 주소 뒤 #sian2 처럼 붙이면 그 탭으로 열림
   · 움직임 줄이기 설정이면 시안01 은 처음부터 그대로 보이고, 시안02 는 움직임 없이 나타나고 숨음 */
(function () {
  var KEY = 'yesform-main-floating-sian';
  var SHOW_AT = 100; // 시안02 — 이만큼(px) 넘게 내리면 나타남

  var badge = document.querySelector('.floating-sign');
  if (!badge) return;
  var tabs = [].slice.call(document.querySelectorAll('[data-sian-tab]'));
  var replay = document.querySelector('[data-replay="floating-sign"]');
  var replaySep = document.querySelector('.version-switch__sep');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var sian = '';
  var ready = false; // 그림 2장을 다 불러왔는지

  /* 시안01 — 처음부터 다시 등장 */
  function enter() {
    if (reduce) { badge.setAttribute('data-enter', 'done'); return; }
    badge.setAttribute('data-enter', 'wait');
    if (!ready) return; // 그림을 다 불러오면 그때 시작
    void badge.offsetWidth; // 움직임을 처음부터 다시 시작하게 함
    badge.setAttribute('data-enter', 'play');
  }

  /* 시안02 — 스크롤 위치에 맞춰 보이기 / 숨기기 */
  function syncScroll() {
    if (sian !== '2') return;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    badge.setAttribute('data-scroll', y > SHOW_AT ? 'shown' : 'hidden');
  }

  function show(n) {
    if (n !== '1' && n !== '2') n = '1';
    sian = n;
    badge.setAttribute('data-sian', n);
    tabs.forEach(function (b) {
      var on = b.getAttribute('data-sian-tab') === n;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (replay) replay.hidden = n !== '1';
    if (replaySep) replaySep.hidden = n !== '1';

    if (n === '1') {
      badge.removeAttribute('data-scroll');
      enter();
    } else {
      badge.removeAttribute('data-enter');
      // 숨김 상태로 바로 바꾼 뒤, 이미 내려와 있으면 아래에서 위로 등장
      badge.classList.add('is-instant');
      badge.setAttribute('data-scroll', 'hidden');
      void badge.offsetWidth;
      badge.classList.remove('is-instant');
      requestAnimationFrame(syncScroll);
    }
    try { localStorage.setItem(KEY, n); } catch (e) {}
    if (location.hash !== '#sian' + n) history.replaceState(null, '', '#sian' + n);
  }

  // 그림 불러오기 — 시안01 은 다 불러온 뒤 시작
  function onReady() {
    if (ready) return;
    ready = true;
    if (sian === '1') requestAnimationFrame(enter);
  }
  var imgs = [].slice.call(badge.querySelectorAll('img'));
  var left = imgs.length;
  function loaded() { if (--left <= 0) onReady(); }
  imgs.forEach(function (im) {
    if (im.complete) loaded();
    else {
      im.addEventListener('load', loaded);
      im.addEventListener('error', loaded);
    }
  });
  if (!imgs.length) onReady();
  setTimeout(onReady, 1500);

  // 스크롤 — 한 프레임에 한 번만 확인
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; syncScroll(); });
  }, { passive: true });

  tabs.forEach(function (b) {
    b.addEventListener('click', function () { show(b.getAttribute('data-sian-tab')); });
  });
  if (replay) replay.addEventListener('click', function () { if (sian === '1') enter(); });
  window.addEventListener('hashchange', function () {
    var h = location.hash.replace('#sian', '');
    if (h !== sian) show(h);
  });

  var start = location.hash.replace('#sian', '');
  if (start !== '1' && start !== '2') { try { start = localStorage.getItem(KEY) || '1'; } catch (e) { start = '1'; } }
  show(start);
})();
