/* 씽크존 261105 시안 비교 (2026-11-05)
   시안 전환 — 탭을 누르면 그 시안 그림만 보임
   · ←/→ 키 · 주소 뒤 #1 / #2 로 바로 열기 · 마지막으로 본 시안 기억 */
(function () {
  var KEY = 'thinkzone-261105-sian';
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
