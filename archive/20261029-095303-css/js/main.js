/* 예스폼싸인 문서/계약 자료실 (2026-10-29) */

/* 시안02 표 — Figma 프레임 "02" 의 10줄 그대로 (분류 · 문서명 · 표시)
   표시 그림: images/1.png(N) · 2.png(NEW) · Frame 444444500.png(접힌 종이 N) — 올려 주신 그림 그대로 */
(function () {
  var ROWS = [
    ['취업/고용', 'n'], ['취업/고용', 'new'], ['건설/공사', 'doc'], ['부동산'], ['금전거래'],
    ['물건거래'], ['하청/용역'], ['회사운영'], ['기타문서'], ['기타문서']
  ];
  var NAME = '매니지먼트 전속계약서(연예 스포츠).pdf';
  var BADGE = {
    n: '<img class="badge" src="images/1.png" width="16" height="16" alt="N">',
    new: '<img class="badge" src="images/2.png" width="35" height="16" alt="NEW">',
    doc: '<img class="badge" src="images/Frame%20444444500.png" width="14" height="18" alt="N">'
  };
  var DOWN = ['hwp', 'word', 'pdf'].map(function (k) {
    return '<img src="images/ic-format-' + k + '.svg" width="29" height="29" alt="' + k.toUpperCase() + ' 다운로드">';
  }).join('');
  var body = document.getElementById('list-body');
  if (!body) return;
  body.innerHTML = ROWS.map(function (r) {
    return '<tr><td class="c-type">' + r[0] + '</td><td class="c-name"><span class="name">' + NAME + (r[1] ? BADGE[r[1]] : '') +
      '</span></td><td class="c-down"><span class="down">' + DOWN + '</span></td></tr>';
  }).join('');
})();

/* 화면이 1920 보다 좁으면 프레임 전체가 보이게 줄임 */
(function () {
  var frame = document.getElementById('frame');
  function fit() { frame.style.zoom = Math.min(1, document.documentElement.clientWidth / 1920); }
  fit();
  window.addEventListener('resize', fit);
})();

/* 시안 전환 — ←/→ 키 · 주소 뒤 #1 / #2 · 마지막으로 본 시안 기억 */
(function () {
  var KEY = 'yesform-sign-doc-archive-sian';
  var tabs = [].slice.call(document.querySelectorAll('.tab'));
  function panel(id) { return document.getElementById('panel-' + id); }
  function select(id, focus) {
    if (!panel(id)) id = '1';
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-sian') === id;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      panel(t.getAttribute('data-sian')).hidden = !on;
      if (on && focus) t.focus();
    });
    try { localStorage.setItem(KEY, id); } catch (e) {}
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t.getAttribute('data-sian')); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      if (n !== null) { e.preventDefault(); select(tabs[n].getAttribute('data-sian'), true); }
    });
  });
  window.addEventListener('hashchange', function () { var h = location.hash.replace('#', ''); if (panel(h)) select(h); });
  var start = (location.hash || '').replace('#', '');
  if (!panel(start)) { try { start = localStorage.getItem(KEY) || '1'; } catch (e) { start = '1'; } }
  select(start);
})();
