/* 예스폼싸인 · 전자서명 만들기 · 싸인 그리기 — 그리기 칸 동작
   · 마우스 · 펜 · 손가락으로 그림 (선 #1D1F20 · 두께 3) — 시안에 없어 새로 정함
   · 한 번이라도 그리면 안내 문구가 사라지고 [만들기]가 켜짐
   · 오른쪽 위 둥근 버튼(다시 그리기)을 누르면 칸을 비우고 [만들기]를 다시 끔 */
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
