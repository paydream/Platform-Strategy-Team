/* 예스폼싸인 메인 261030 — 모바일 (2026-10-30) */

/* 화면 폭 맞추기 — 360 으로 만든 화면을 폰(500 이하)에서는 화면 폭만큼 늘리고, PC 에서는 360 그대로 가운데에 둠 */
(function () {
  var page = document.getElementById('page');
  function fit() {
    var w = document.documentElement.clientWidth;
    var phone = w <= 500;
    page.style.zoom = phone ? String(w / 360) : '';
    document.body.classList.toggle('is-phone', phone);
  }
  fit();
  window.addEventListener('resize', fit);
})();

/* 히어로 영상 — 소리 없이 자동 재생 · 반복 (PC 261028 과 같음)
   · 영상을 누르면 멈춤 / 다시 재생, 멈춰 있을 때만 가운데 재생 버튼이 보임
   · 움직임 줄이기 설정이면 자동 재생하지 않음 · 브라우저가 자동 재생을 막으면 재생 버튼이 보임 */
(function () {
  var wrap = document.querySelector('.m-hero__media');
  if (!wrap) return;
  var video = wrap.querySelector('video');
  var play = wrap.querySelector('.m-hero__play');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function sync() { wrap.classList.toggle('is-paused', video.paused); }
  function start() { var p = video.play(); if (p && p.catch) p.catch(sync); }
  video.muted = true;
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  video.addEventListener('click', function () { if (video.paused) start(); else video.pause(); });
  play.addEventListener('click', start);
  if (reduce) { video.removeAttribute('autoplay'); video.pause(); } else start();
  sync();
})();

/* 계약서 분류 버튼 — 누른 버튼만 파랑 (카드 목록은 그대로) */
(function () {
  var chips = [].slice.call(document.querySelectorAll('.m-chip'));
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      chips.forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); });
    });
  });
})();

/* "무료로 시작하세요" 숫자 세기 — 숫자가 화면 아래 20% 선 위로 올라오면 0 → 100 · 240 · 120 (세 숫자 동시에 1.6초, 끝으로 갈수록 천천히)
   · 페이지를 연 뒤 한 번만 · 움직임 줄이기 설정이면 바로 최종 숫자 */
(function () {
  var box = document.querySelector('[data-count]');
  if (!box) return;
  var nums = [].slice.call(box.querySelectorAll('[data-to]'));
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  var DURATION = 1600;
  nums.forEach(function (n) { n.textContent = '0'; });
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function run() {
    var t0 = null;
    function frame(now) {
      if (t0 === null) t0 = now;
      var p = Math.min(1, (now - t0) / DURATION);
      nums.forEach(function (n) { n.textContent = String(Math.round(ease(p) * Number(n.getAttribute('data-to')))); });
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var io = new IntersectionObserver(function (entries) {
    if (!entries.some(function (e) { return e.isIntersecting; })) return;
    io.disconnect();
    run();
  }, { rootMargin: '0px 0px -20% 0px' });
  io.observe(box);
})();
