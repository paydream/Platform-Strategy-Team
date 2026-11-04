/* 예스폼싸인 메인 261029 (2026-10-29) — 261028 과 같음, 기억 이름만 다름 */

/* 히어로 영상 — 소리 없이 자동 재생 · 반복
   · 영상을 누르면 멈춤 / 다시 재생, 멈춰 있을 때만 가운데 재생 버튼이 보임
   · 움직임 줄이기 설정이면 자동 재생하지 않고 첫 장면(재생 버튼)으로 둠
   · 브라우저가 자동 재생을 막으면 재생 버튼이 보임 */
(function () {
  var wrap = document.querySelector('.ys-hero__media');
  if (!wrap) return;
  var video = wrap.querySelector('video');
  var play = wrap.querySelector('.ys-hero__play');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sync() { wrap.classList.toggle('is-paused', video.paused); }
  function start() {
    var p = video.play();
    if (p && p.catch) p.catch(sync);
  }
  video.muted = true; // 자동 재생은 소리를 끈 영상만 허용됨
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  video.addEventListener('click', function () { if (video.paused) start(); else video.pause(); });
  play.addEventListener('click', start);

  if (reduce) { video.removeAttribute('autoplay'); video.pause(); }
  else start();
  sync();
})();

/* 시안01 마지막 섹션 숫자 세기 — 섹션에 닿으면 0 → 100 · 240 · 120 (세 숫자 동시에, 1.6초, 끝으로 갈수록 천천히)
   · 페이지를 연 뒤 한 번만 — 다시 올라갔다 내려오거나 시안을 바꿔도 다시 세지 않음
   · 숫자 줄이 화면 아래 20% 선 위로 올라오면 시작 (시안02 를 보고 있을 땐 안 셈)
   · 움직임 줄이기 설정이면 바로 최종 숫자 */
(function () {
  var box = document.querySelector('[data-count]');
  if (!box) return;
  var nums = [].slice.call(box.querySelectorAll('[data-to]'));
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return; // HTML 에 적힌 최종 숫자 그대로

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

/* 시안 전환 — 히어로 아래 이미지만 바뀜 (히어로는 두 시안이 같음)
   · ←/→ 키 · 주소 뒤 #1 / #2 로 바로 열기 · 마지막으로 본 시안 기억 */
(function () {
  var KEY = 'yesform-sign-main-261029-sian';
  var tabs = [].slice.call(document.querySelectorAll('.tab'));
  function panel(id) { return document.getElementById('panel-' + id); }
  function select(id, focus, scroll) {
    if (!panel(id)) id = '1';
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-sian') === id;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      panel(t.getAttribute('data-sian')).hidden = !on;
      if (on && focus) t.focus();
    });
    if (scroll) window.scrollTo(0, 0);
    try { localStorage.setItem(KEY, id); } catch (e) {}
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t.getAttribute('data-sian'), false, true); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      if (n !== null) { e.preventDefault(); select(tabs[n].getAttribute('data-sian'), true, true); }
    });
  });
  window.addEventListener('hashchange', function () { var h = location.hash.replace('#', ''); if (panel(h)) select(h, false, true); });
  var start = (location.hash || '').replace('#', '');
  if (!panel(start)) { try { start = localStorage.getItem(KEY) || '1'; } catch (e) { start = '1'; } }
  select(start, false, false);
})();
