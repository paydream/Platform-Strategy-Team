/* 예스폼싸인 메인 261030 PC (2026-10-30) */

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

/* 계약서 서식 — 분류 탭 · 좌우 버튼
   · 탭을 누르거나 좌우 버튼을 누르면 그 분류로 바뀜 → 제목의 분류 이름 · 설명(탭의 data-desc)만 바로 바뀜
     (제목의 " 계약서로" · "시작하는 전자계약" 은 HTML 그대로 고정 · 글자 움직임 없음)
   · 고른 탭은 항상 탭 줄 맨 앞(1번째)에 옴 — 탭 줄이 옆으로 밀리고, 앞으로 지나간 탭은 맨 뒤로 붙음
   · 끝없이 돎(loop): 마지막 분류에서 오른쪽 → 첫 분류, 첫 분류에서 왼쪽 → 마지막 분류
   · 탭 순서는 CSS order 로만 바꿈 (HTML 순서 · 화면 읽기 프로그램 순서는 그대로)
   · 탭에 초점이 있을 때 키보드 ← → 로도 바꿀 수 있음 · 움직임 줄이기 설정이면 밀리는 움직임 없이 바로 바뀜 */
(function () {
  var root = document.querySelector('[data-tpl]');
  if (!root) return;
  var tabs = [].slice.call(root.querySelectorAll('[role="tab"]'));
  var track = root.querySelector('.pc-tpl__tabs');
  var head = root.querySelector('.pc-tpl__head');
  var nameEl = root.querySelector('[data-tpl-name]');
  var descEl = root.querySelector('[data-tpl-desc]');
  var prev = root.querySelector('[data-tpl-prev]');
  var next = root.querySelector('[data-tpl-next]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var n = tabs.length;
  var DURATION = 400; // 탭 줄이 밀리는 시간
  var cur = 0;
  var timer = null;

  // tabs[first] 가 맨 앞에 오도록 화면 순서만 바꿈
  function place(first) {
    tabs.forEach(function (t, k) { t.style.order = String((k - first + n) % n); });
  }
  function shift(x, animate) {
    track.style.transition = animate ? 'transform ' + DURATION + 'ms cubic-bezier(.22,.61,.36,1)' : 'none';
    track.style.transform = x ? 'translateX(' + x + 'px)' : '';
  }
  // 밀리는 중에 또 누르면 지금 움직임을 바로 끝내고 다음 움직임 시작
  function settle() {
    if (!timer) return;
    clearTimeout(timer); timer = null;
    place(cur); shift(0, false);
  }

  // step: +1 다음 · -1 이전 · 그 밖의 수는 그만큼 앞(+) / 뒤(-)로
  function go(step, focus) {
    settle();
    var to = ((cur + step) % n + n) % n;
    if (to === cur) return;
    var from = cur;
    cur = to;

    tabs.forEach(function (t, k) {
      var on = k === to;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    head.setAttribute('aria-labelledby', tabs[to].id);
    nameEl.textContent = tabs[to].textContent.trim();
    descEl.textContent = tabs[to].getAttribute('data-desc');
    if (focus) tabs[to].focus({ preventScroll: true });

    if (reduce) { place(to); shift(0, false); return; }
    if (step > 0) {
      // 앞으로: 고른 탭이 맨 앞에 올 때까지 왼쪽으로 민 뒤, 지나간 탭을 맨 뒤로 옮기고 제자리
      shift(-tabs[to].offsetLeft, true);
      timer = setTimeout(function () { timer = null; place(to); shift(0, false); }, DURATION);
    } else {
      // 뒤로: 고른 탭을 맨 앞으로 옮기되 화면은 그대로 둔 채, 오른쪽으로 밀어 제자리
      place(to);
      shift(-tabs[from].offsetLeft, false);
      void track.offsetWidth;
      shift(0, true);
      timer = setTimeout(function () { timer = null; shift(0, false); }, DURATION);
    }
  }

  tabs.forEach(function (t, k) {
    // 눌린 탭은 항상 지금 탭보다 오른쪽에 있으므로 앞으로 밂
    t.addEventListener('click', function () { go((k - cur + n) % n); });
    t.addEventListener('keydown', function (e) {
      var step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (!step) return;
      e.preventDefault();
      go(step, true);
    });
  });
  prev.addEventListener('click', function () { go(-1); });
  next.addEventListener('click', function () { go(1); });
  place(0);
})();

/* "무료로 시작하세요" 숫자 세기 — 숫자 줄이 화면 아래 20% 선 위로 올라오면 0 → 100 · 240 · 120
   (세 숫자 동시에 1.6초, 끝으로 갈수록 천천히) · 페이지를 연 뒤 한 번만 · 움직임 줄이기 설정이면 바로 최종 숫자 */
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
