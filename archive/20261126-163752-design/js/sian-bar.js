/* 시안 확인용 상단 바 (디자인에 포함되지 않음)
   · 높이 40 검정 바(#1D1F20) · 고른 탭 파랑(#2D62FA) · 탭에 마우스를 올리면 시안 설명 한 줄
   · 주소 뒤 #1, #2 로 바로 열기 · 키보드 ←/→ 로 넘기기 · 마지막에 본 시안 기억
   · 이 파일을 불러오는 HTML 맨 아래 한 줄을 지우면 바가 빠지고 시안01 만 보임 */
(function () {
  var SIANS = [
    { name: '시안01', desc: '무료 체험 배너 위 · 멤버십 카드 3개 · 주요 기능' },
    { name: '시안02', desc: '가로형 요금 카드 · 멤버십 펼쳐 보기 · 기능 소개 3구역 · 무료 체험 배너 맨 아래' }
  ];
  var KEY = 'yesformSignPricingSian';
  var pages = [].slice.call(document.querySelectorAll('.sian'));
  if (pages.length < 2) return;

  var css = document.createElement('style');
  css.textContent =
    'body{padding-top:40px}' +
    '.sian-bar{position:fixed;left:0;right:0;top:0;z-index:1000;display:flex;align-items:center;gap:6px;height:40px;padding:0 16px;background:#1D1F20;font-family:inherit}' +
    '.sian-bar__label{margin-right:6px;font-size:12px;line-height:16px;font-weight:600;color:#8A8F94}' +
    '.sian-bar__tab{position:relative;height:28px;padding:0 12px;border:0;border-radius:5px;background:transparent;font:inherit;font-size:13px;line-height:28px;font-weight:600;color:#C9CDD1;cursor:pointer}' +
    '.sian-bar__tab:hover{background:#2E3134;color:#fff}' +
    '.sian-bar__tab.is-on{background:#2D62FA;color:#fff}' +
    '.sian-bar__tip{position:absolute;left:0;top:calc(100% + 6px);padding:4px 8px;border-radius:4px;background:#1D1F20;font-size:12px;line-height:16px;font-weight:500;color:#fff;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s}' +
    '.sian-bar__tab:hover .sian-bar__tip,.sian-bar__tab:focus-visible .sian-bar__tip{opacity:1}' +
    '.sian-bar__tab:focus-visible{outline:2px solid #7DA2FF;outline-offset:1px}';
  document.head.appendChild(css);

  var bar = document.createElement('div');
  bar.className = 'sian-bar';
  bar.setAttribute('role', 'tablist');
  bar.setAttribute('aria-label', '시안 선택');
  bar.innerHTML = '<span class="sian-bar__label">이용요금</span>' + SIANS.map(function (s, i) {
    return '<button class="sian-bar__tab" type="button" role="tab" data-go="' + (i + 1) + '">' + s.name +
      '<span class="sian-bar__tip">' + s.desc + '</span></button>';
  }).join('');
  document.body.insertBefore(bar, document.body.firstChild);
  var tabs = [].slice.call(bar.querySelectorAll('.sian-bar__tab'));

  function save(n) { try { localStorage.setItem(KEY, String(n)); } catch (e) {} }
  function load() { try { return parseInt(localStorage.getItem(KEY), 10) || 0; } catch (e) { return 0; } }

  var cur = 0;
  function show(n, keepScroll) {
    n = Math.max(1, Math.min(pages.length, n));
    if (n === cur) return;
    cur = n;
    pages.forEach(function (p, i) { p.hidden = i !== n - 1; });
    tabs.forEach(function (t, i) {
      var on = i === n - 1;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (location.hash !== '#' + n) history.replaceState(null, '', '#' + n);
    save(n);
    if (!keepScroll) window.scrollTo(0, 0);
    window.dispatchEvent(new Event('sian:change'));
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { show(parseInt(t.getAttribute('data-go'), 10)); });
  });
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'ArrowLeft') show(cur - 1);
  });
  window.addEventListener('hashchange', function () {
    var h = parseInt(location.hash.slice(1), 10);
    if (h) show(h);
  });

  var first = parseInt(location.hash.slice(1), 10) || load() || 1;
  show(first, true);
})();
