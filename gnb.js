/* 플랫폼전략팀 공통 GNB 메뉴. 메뉴 추가·순서 변경은 이 파일의 MENU만 고치면 모든 화면에 반영된다.
   각 화면: <nav class="wrap gnb-nav" data-current="메뉴id"></nav><script src="gnb.js"></script> */
(function () {
  var S = ' fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  var F = ' fill="currentColor" fill-opacity=".2"';
  var MENU = [
    { id: 'archive', href: './', label: '업무 아카이브', fg: '#2f6bff', bg: '#eaf1ff',
      svg: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"' + F + '/><path d="M3 10.5h18"/>' },
    { id: 'metrics', href: 'stats.html', label: '에디터/싸인 지표', fg: '#0f9d58', bg: '#e4f6ec', badge: '매일', title: '매일 자동 갱신',
      svg: '<rect x="4" y="12" width="3.6" height="8" rx="1"' + F + '/><rect x="10.2" y="8" width="3.6" height="12" rx="1"' + F + '/><rect x="16.4" y="4" width="3.6" height="16" rx="1" fill="currentColor"/>' },
    { id: 'wbs', href: 'wbs.html', label: '팀 WBS', fg: '#7c4dff', bg: '#f0eaff',
      svg: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"' + F + '/><path d="M3 9.5h18M8 3v3M16 3v3"/><path d="M7 13.2h6M10 16.8h7" stroke-width="2.6"/>' },
    { id: 'tracking', href: 'tracking.html', label: '측정 관리', fg: '#f07800', bg: '#fff1e0',
      svg: '<circle cx="12" cy="12" r="9"' + F + '/><circle cx="12" cy="12" r="5.2"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/>' },
    { id: 'stats', href: './#stats', label: '통계', fg: '#e5457a', bg: '#fdeaf1', lock: true, title: '비밀번호로 열람',
      svg: '<path d="M11 4.5a8.5 8.5 0 1 0 8.5 8.5H11z"' + F + '/><path d="M14 2.5a7.5 7.5 0 0 1 7.5 7.5H14z" fill="currentColor"/>' },
    { id: 'admin', href: 'admin/', label: '관리자', fg: '#4e5968', bg: '#eef0f3',
      svg: '<path d="M4 7h9M18 7h2M4 17h3M12 17h8"/><circle cx="15.5" cy="7" r="2.4"' + F + '/><circle cx="9.5" cy="17" r="2.4"' + F + '/>' }
  ];
  var LOCK = '<svg viewBox="0 0 24 24"' + S.replace('1.8', '2.6') + '><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  var navs = document.querySelectorAll('nav.gnb-nav');
  for (var n = 0; n < navs.length; n++) {
    var nav = navs[n], cur = nav.getAttribute('data-current') || '';
    if (nav.getAttribute('data-done')) continue;
    if (!nav.getAttribute('aria-label')) nav.setAttribute('aria-label', '주요 메뉴');
    nav.innerHTML = MENU.map(function (m) {
      var on = m.id === cur;
      var href = (m.id === 'stats' && cur === 'archive') ? '#stats' : m.href;
      return '<a class="gnb-item' + (on ? ' on' : '') + '" href="' + href + '"' + (on ? ' aria-current="page"' : '') +
        (m.title ? ' title="' + m.title + '"' : '') + ' style="--gfg:' + m.fg + ';--gbg:' + m.bg + '">' +
        '<span class="gnb-ic" aria-hidden="true">' + (m.badge ? '<span class="gnb-badge">' + m.badge + '</span>' : '') +
        '<svg viewBox="0 0 24 24"' + S + '>' + m.svg + '</svg>' + (m.lock ? '<span class="gnb-lock">' + LOCK + '</span>' : '') + '</span>' +
        '<span class="gnb-label">' + m.label + '</span></a>';
    }).join('');
    nav.setAttribute('data-done', '1');
  }
})();
