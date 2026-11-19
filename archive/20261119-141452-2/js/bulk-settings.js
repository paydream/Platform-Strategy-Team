/* 예스폼싸인 2차 고도화 — 대량 전송 3단계 전송 설정 (pages/bulk-settings.html)
   Figma 54548:42675

   · 서명 유효기간 — 숫자만 받음 (1~365) · 비었거나 0 이면 [다음]이 흐림
   · 주소에 days · label 이 있으면 (검토에서 돌아왔을 때) 그 값으로 채움
   · [다음] → bulk-review.html?…&days=14&label=… */
(function () {
  var B = window.bulk;
  var days = document.querySelector('[data-days]');
  var label = document.querySelector('[data-label]');
  var next = document.querySelector('[data-next]');
  var MAX = 365;

  var d0 = B.param('days');
  if (d0 && /^\d+$/.test(d0)) days.value = d0;
  var l0 = B.param('label');
  if (l0) { label.textContent = l0; label.title = l0; }

  function value() { return parseInt(days.value, 10) || 0; }
  function sync() { next.disabled = value() < 1; }

  days.addEventListener('input', function () {
    var v = days.value.replace(/\D/g, '');
    if (v && parseInt(v, 10) > MAX) v = String(MAX);
    if (v !== days.value) days.value = v;
    sync();
  });
  days.addEventListener('blur', function () { if (days.value) days.value = String(value()); });

  next.addEventListener('click', function () {
    if (next.disabled) return;
    location.href = B.url('bulk-review.html', 'days=' + value() + '&label=' + encodeURIComponent(label.textContent.trim()));
  });

  sync();
})();
