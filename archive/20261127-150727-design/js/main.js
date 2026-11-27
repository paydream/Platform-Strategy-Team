/* 예스폼싸인 · 전자서명 만들기 — 탭 · 그리기 · 싸인/도장 만들기 · 업로드 동작
   (시안에 없는 동작은 "새로 정함"이라고 적어 둠) */

/* ---------- 탭 — 누르면 화면 바꾸기 · 주소 뒤 #draw · #sign · #stamp · #corp · #upload ---------- */
(function () {
  var tabs = [].slice.call(document.querySelectorAll('[data-tab]'));
  var panels = [].slice.call(document.querySelectorAll('[data-panel]'));
  if (!tabs.length) return;

  function show(name, push) {
    if (!panels.some(function (p) { return p.getAttribute('data-panel') === name; })) name = 'draw';
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    panels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== name; });
    if (push) { try { history.replaceState(null, '', '#' + name); } catch (e) { location.hash = name; } }
    window.dispatchEvent(new Event('resize'));        /* 그리기 칸 크기 다시 맞춤 */
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { show(t.getAttribute('data-tab'), true); });
  });
  window.addEventListener('hashchange', function () { show(location.hash.slice(1), false); });
  show(location.hash.slice(1) || 'draw', false);
})();

/* ---------- ① 싸인 그리기 — 그리기 칸
   · 마우스 · 펜 · 손가락으로 그림 (선 #1D1F20 · 두께 3) — 새로 정함
   · 한 번이라도 그리면 안내 문구가 사라지고 [만들기]가 켜짐
   · [다시 그리기]를 누르면 칸을 비우고 [만들기]를 다시 끔 ---------- */
(function () {
  var pad = document.querySelector('[data-pad]');
  if (!pad) return;
  var canvas = pad.querySelector('[data-pad-canvas]');
  var reset = pad.querySelector('[data-pad-reset]');
  var make = document.querySelector('[data-pad-make]');
  var ctx = canvas.getContext('2d');
  var drawing = false, last = null, drawn = false;

  function fit() {
    var r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    if (!r.width || !r.height) return;                 /* 다른 탭이 열려 있으면 건너뜀 */
    var w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (canvas.width === w && canvas.height === h) return;
    var keep = drawn ? canvas.toDataURL() : null;
    canvas.width = w; canvas.height = h;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1D1F20'; ctx.lineWidth = 3;
    if (keep) { var img = new Image(); img.onload = function () { ctx.drawImage(img, 0, 0, r.width, r.height); }; img.src = keep; }
  }
  function pos(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function setDrawn(on) {
    drawn = on;
    pad.classList.toggle('is-drawn', on);
    if (make) make.disabled = !on;
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    fit();
    drawing = true; last = pos(e);
    canvas.setPointerCapture(e.pointerId);
    ctx.beginPath(); ctx.arc(last.x, last.y, ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fillStyle = ctx.strokeStyle; ctx.fill();
    if (!drawn) setDrawn(true);
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!drawing) return;
    var p = pos(e), mid = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 };
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.quadraticCurveTo(last.x, last.y, mid.x, mid.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last = p;
  });
  function stop() { drawing = false; last = null; }
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);

  reset.addEventListener('click', function () {
    var r = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, r.width, r.height);
    setDrawn(false);
  });

  fit();
  window.addEventListener('resize', fit);
})();

/* ---------- ② 싸인 만들기 · ③ 일반 도장 · ④ 법인 도장
   · 이름을 넣고 [싸인 만들기]/[도장 만들기] (또는 Enter) → 만들어진 목록이 열리고 버튼 글자가 [다시 만들기]로 바뀜
   · 이름을 넣기 전에는 [싸인 만들기]/[도장 만들기]가 꺼져 있음 (button_primary disabled) — 글자를 넣으면 켜짐
   · 카드를 하나 고르면 체크가 켜지고 [저장하기]가 켜짐 (한 개만 고름)
   · 카드 그림은 시안 예시 그림 그대로 (입력한 이름으로 바뀌지 않음)
   · [저장하기] 다음 화면은 시안에 없어 동작 없음 ---------- */
(function () {
  [].forEach.call(document.querySelectorAll('[data-gen]'), function (panel) {
    var input = panel.querySelector('[data-gen-input]');
    var make = panel.querySelector('[data-gen-make]');
    var result = panel.querySelector('[data-gen-result]');
    var grid = panel.querySelector('[data-pick-grid]');
    var save = panel.querySelector('[data-gen-save]');

    function build() {
      var n = +grid.getAttribute('data-count'), src = grid.getAttribute('data-img');
      var w = grid.getAttribute('data-w'), h = grid.getAttribute('data-h'), alt = grid.getAttribute('data-alt');
      var html = '';
      for (var i = 1; i <= n; i++) {
        html += '<button class="pick" type="button" aria-pressed="false" aria-label="' + alt + ' ' + i + '">' +
          '<img class="pick__check" src="images/ic-check-circle-off-24.svg" width="24" height="24" alt="">' +
          '<img class="pick__img" src="' + src + '" width="' + w + '" height="' + h + '" alt="">' +
          '</button>';
      }
      grid.innerHTML = html;
      save.disabled = true;
    }
    function sync() { make.disabled = !input.value.trim(); }   /* 입력값 없으면 버튼 꺼짐 */
    function run() {
      if (!input.value.trim()) return;
      build();
      result.hidden = false;
      make.textContent = '다시 만들기';
    }
    make.addEventListener('click', run);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
    input.addEventListener('input', sync);
    sync();

    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.pick');
      if (!card) return;
      [].forEach.call(grid.querySelectorAll('.pick'), function (c) {
        var on = c === card;
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
        c.querySelector('.pick__check').src = on ? 'images/ic-check-circle-on-24.svg' : 'images/ic-check-circle-off-24.svg';
      });
      save.disabled = false;
    });
  });
})();

/* ---------- ⑤ 업로드 — 시안에 없어 새로 정함
   · 칸을 누르거나 파일을 끌어다 놓으면 이미지를 고름 (jpg · jpeg · png · svg · 2MB 이하)
   · 맞는 파일이면 칸 안에 미리보기 + [이미지 업로드]가 켜짐 · 오른쪽 위 둥근 버튼으로 지우기
   · 맞지 않으면 안내 문구가 빨간색으로 바뀜 ---------- */
(function () {
  var box = document.querySelector('[data-up]');
  if (!box) return;
  var file = box.querySelector('[data-up-file]');
  var msg = box.querySelector('[data-up-msg]');
  var preview = box.querySelector('[data-up-preview]');
  var reset = box.querySelector('[data-up-reset]');
  var submit = document.querySelector('[data-up-submit]');
  var MSG = msg.textContent, MAX = 2 * 1024 * 1024, url = null;

  function clear() {
    if (url) { URL.revokeObjectURL(url); url = null; }
    preview.removeAttribute('src'); preview.hidden = true; reset.hidden = true;
    box.classList.remove('has-file'); submit.disabled = true; file.value = '';
  }
  function error(text) { clear(); msg.textContent = text; msg.classList.add('is-error'); }
  function take(f) {
    if (!f) return;
    var ok = /\.(jpe?g|png|svg)$/i.test(f.name);
    if (!ok) return error('jpg, jpeg, png, svg 파일만 올릴 수 있습니다. 다른 파일을 선택해 주세요.');
    if (f.size > MAX) return error('2MB 이하 파일만 올릴 수 있습니다. 다른 파일을 선택해 주세요.');
    clear();
    msg.textContent = MSG; msg.classList.remove('is-error');
    url = URL.createObjectURL(f);
    preview.src = url; preview.hidden = false; reset.hidden = false;
    box.classList.add('has-file'); submit.disabled = false;
  }

  /* 파일 칸이 상자 안에 있어서 file.click() 이 상자 click 으로 다시 올라옴 — 파일 칸에서 온 click 은 무시 */
  file.addEventListener('click', function (e) { e.stopPropagation(); });
  box.addEventListener('click', function (e) {
    if (e.target === file || e.target.closest('[data-up-reset]') || box.classList.contains('has-file')) return;
    file.click();
  });
  box.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && !box.classList.contains('has-file')) { e.preventDefault(); file.click(); } });
  file.addEventListener('change', function () { take(file.files[0]); });
  reset.addEventListener('click', function (e) { e.stopPropagation(); clear(); msg.textContent = MSG; msg.classList.remove('is-error'); });
  ['dragenter', 'dragover'].forEach(function (t) { box.addEventListener(t, function (e) { e.preventDefault(); box.classList.add('is-over'); }); });
  ['dragleave', 'drop'].forEach(function (t) { box.addEventListener(t, function (e) { e.preventDefault(); box.classList.remove('is-over'); }); });
  box.addEventListener('drop', function (e) { take(e.dataTransfer && e.dataTransfer.files[0]); });
})();
