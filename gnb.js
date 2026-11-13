/* 플랫폼전략팀 공통 GNB 메뉴. 메뉴 추가·순서 변경은 이 파일의 MENU만 고치면 모든 화면에 반영된다. kw는 GNB 검색용 추가 검색어. side: true인 메뉴(관리자)는 맨 오른쪽에 따로 붙는다.
   각 화면 마크업은 그대로 두고, 스크립트가 nav를 로고와 .gnb-util 사이로 옮겨 한 줄(60px)로 만든다.
   각 화면: <nav class="wrap gnb-nav" data-current="메뉴id"></nav><script src="gnb.js"></script> */
(function () {
  var S = ' fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  var F = ' fill="currentColor" fill-opacity=".2"';
  var MENU = [
    { id: 'archive', href: './', label: '업무 아카이브', fg: '#2f6bff', bg: '#eaf1ff',
      svg: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"' + F + '/><path d="M3 10.5h18"/>' },
    { id: 'work', href: 'work.html', label: '주요 업무', fg: '#0d9488', bg: '#e1f5f2',
      svg: '<rect x="3" y="7" width="18" height="13" rx="2.5"' + F + '/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M3 12.5h18"/><path d="M12 11.5v2.5" stroke-width="2.4"/>' },
    { id: 'metrics', href: 'stats.html', label: '에디터/싸인 지표', kw: '통계 지표 매출 결제', fg: '#0f9d58', bg: '#e4f6ec', title: '매일 자동 갱신',
      svg: '<rect x="4" y="12" width="3.6" height="8" rx="1"' + F + '/><rect x="10.2" y="8" width="3.6" height="12" rx="1"' + F + '/><rect x="16.4" y="4" width="3.6" height="16" rx="1" fill="currentColor"/>' },
    { id: 'wbs', href: 'wbs.html', label: '팀 WBS', kw: '일정 휴가', fg: '#7c4dff', bg: '#f0eaff',
      svg: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"' + F + '/><path d="M3 9.5h18M8 3v3M16 3v3"/><path d="M7 13.2h6M10 16.8h7" stroke-width="2.6"/>' },
    { id: 'calendar', href: 'calendar.html', label: '캘린더', kw: '일정 업데이트', fg: '#0284c7', bg: '#e0f2fe', title: '캘린더',
      svg: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"' + F + '/><path d="M3 9.5h18M8 3v3M16 3v3"/><path d="m12 11.4 1.2 2.4 2.6.4-1.9 1.8.45 2.6L12 17.4l-2.35 1.2.45-2.6-1.9-1.8 2.6-.4z" fill="currentColor" stroke-width="1.2"/>' },
    { id: 'tracking', href: 'tracking.html', label: 'GA', title: 'GA4·GTM 측정 관리', kw: '측정 관리 GA4 GTM 이벤트', fg: '#f07800', bg: '#fff1e0',
      svg: '<circle cx="12" cy="12" r="9"' + F + '/><circle cx="12" cy="12" r="5.2"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/>' },
    { id: 'stats', href: 'stats-age.html', label: '데이터', kw: '연령 해상도 통계', fg: '#e5457a', bg: '#fdeaf1',
      svg: '<path d="M11 4.5a8.5 8.5 0 1 0 8.5 8.5H11z"' + F + '/><path d="M14 2.5a7.5 7.5 0 0 1 7.5 7.5H14z" fill="currentColor"/>' },
    { id: 'admin', href: 'admin/', label: '관리자', fg: '#4e5968', bg: '#eef0f3', side: true,
      svg: '<path d="M4 7h9M18 7h2M4 17h3M12 17h8"/><circle cx="15.5" cy="7" r="2.4"' + F + '/><circle cx="9.5" cy="17" r="2.4"' + F + '/>' }
  ];
  // GNB 검색: 메뉴 + 업무 아카이브 프로젝트(projects.json). Enter는 선택 항목으로, 선택이 없으면 업무 아카이브 검색 결과로 간다.
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function initSearch(top) {
    var box = document.createElement('div'); box.className = 'gnb-search'; box.setAttribute('role', 'search');
    box.innerHTML = '<svg class="gnb-sic" viewBox="0 0 24 24"' + S + ' aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>' +
      '<input type="search" placeholder="검색" aria-label="검색" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="gnbSearchList">' +
      '<div class="gnb-sres" id="gnbSearchList" role="listbox" hidden></div>';
    top.insertBefore(box, top.querySelector('.gnb-util'));
    var input = box.querySelector('input'), list = box.querySelector('.gnb-sres'), P = null, loading = null, rows = [], act = -1;
    var TEAM = { design: '디자인', planning: '기획' };
    function load() {
      if (P || loading) return loading;
      loading = fetch('projects.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
        P = (d.projects || []).filter(function (p) { return !p.hidden && (p.versions || []).some(function (v) { return !v.hidden; }); });
      }).catch(function () { P = []; }).then(function () { loading = null; if (input.value.trim()) run(); });
      return loading;
    }
    function hit(text, words) { text = text.toLowerCase(); return words.every(function (w) { return text.indexOf(w) >= 0; }); }
    function run() {
      var q = input.value.trim(), words = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) { close(); return; }
      var menus = MENU.filter(function (m) { return hit(m.label + ' ' + (m.kw || ''), words); }).map(function (m) {
        return { href: m.href, title: m.label, sub: m.title && m.title !== m.label ? m.title : '', fg: m.fg, bg: m.bg, svg: m.svg };
      });
      var projs = (P || []).filter(function (p) {
        var vs = (p.versions || []).filter(function (v) { return !v.hidden; });
        return hit([p.title, p.desc, p.category, TEAM[p.team]].concat(vs.map(function (v) { return v.label + ' ' + (v.title || ''); })).join(' '), words);
      }).slice(0, 8).map(function (p) {
        return { href: 'project.html?id=' + encodeURIComponent(p.id), title: p.title, sub: [TEAM[p.team] || '디자인', p.category].filter(Boolean).join(' · ') };
      });
      rows = menus.concat(projs); act = -1;
      var html = '';
      if (menus.length) html += '<div class="gnb-sh">메뉴</div>' + menus.map(function (r, i) { return row(r, i); }).join('');
      if (projs.length) html += '<div class="gnb-sh">업무 아카이브</div>' + projs.map(function (r, i) { return row(r, i + menus.length); }).join('');
      if (!rows.length) html = '<div class="gnb-sempty">' + (P ? '검색 결과가 없어요' : '불러오는 중…') + '</div>';
      html += '<a class="gnb-sall" href="./?q=' + encodeURIComponent(q) + '">업무 아카이브에서 「' + esc(q) + '」 전체 보기</a>';
      list.innerHTML = html; list.hidden = false; input.setAttribute('aria-expanded', 'true');
    }
    function row(r, i) {
      var ic = r.svg ? '<span class="gnb-sri" style="--gfg:' + r.fg + ';--gbg:' + r.bg + '"><svg viewBox="0 0 24 24"' + S + '>' + r.svg + '</svg></span>'
        : '<span class="gnb-sri doc"><svg viewBox="0 0 24 24"' + S + '><path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4M9.5 12h6M9.5 15.5h6"/></svg></span>';
      return '<a class="gnb-sr" role="option" id="gnbsr' + i + '" data-i="' + i + '" href="' + esc(r.href) + '">' + ic + '<span class="gnb-srt"><b>' + esc(r.title) + '</b><small>' + esc(r.sub) + '</small></span></a>';
    }
    function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); act = -1; }
    function mark() {
      var els = list.querySelectorAll('.gnb-sr');
      for (var i = 0; i < els.length; i++) els[i].classList.toggle('act', +els[i].getAttribute('data-i') === act);
      if (act >= 0) { input.setAttribute('aria-activedescendant', 'gnbsr' + act); var a = list.querySelector('#gnbsr' + act); if (a && a.scrollIntoView) a.scrollIntoView({ block: 'nearest' }); }
    }
    input.addEventListener('focus', function () { load(); if (input.value.trim()) run(); });
    input.addEventListener('input', function () { load(); run(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (list.hidden || !rows.length) return; e.preventDefault();
        act = e.key === 'ArrowDown' ? (act + 1) % rows.length : (act <= 0 ? rows.length - 1 : act - 1); mark();
      } else if (e.key === 'Enter') {
        var q = input.value.trim(); if (!q) return; e.preventDefault();
        location.href = act >= 0 && rows[act] ? rows[act].href : './?q=' + encodeURIComponent(q);
      } else if (e.key === 'Escape') { close(); input.blur(); }
    });
    document.addEventListener('mousedown', function (e) { if (!box.contains(e.target)) close(); });
    // 단축키: / 를 누르면 검색창으로
    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
      e.preventDefault(); input.focus();
    });
  }
  var LOCK = '<svg viewBox="0 0 24 24"' + S.replace('1.8', '2.6') + '><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  var navs = document.querySelectorAll('nav.gnb-nav');
  for (var n = 0; n < navs.length; n++) {
    var nav = navs[n], cur = nav.getAttribute('data-current') || '';
    if (nav.getAttribute('data-done')) continue;
    if (!nav.getAttribute('aria-label')) nav.setAttribute('aria-label', '주요 메뉴');
    var item = function (m) {
      var on = m.id === cur;
      var href = m.href;
      return '<a class="gnb-item' + (on ? ' on' : '') + '" href="' + href + '"' + (on ? ' aria-current="page"' : '') +
        (m.title ? ' title="' + m.title + '"' : '') + ' style="--gfg:' + m.fg + ';--gbg:' + m.bg + '">' +
        '<span class="gnb-ic" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24"' + S + '>' + m.svg + '</svg>' + (m.lock ? '<span class="gnb-lock">' + LOCK + '</span>' : '') + '</span>' +
        '<span class="gnb-label">' + m.label + '</span>' + (m.badge ? '<span class="gnb-badge">' + m.badge + '</span>' : '') + '</a>';
    };
    nav.innerHTML = MENU.filter(function (m) { return !m.side; }).map(item).join('');
    var top = nav.parentNode && nav.parentNode.querySelector('.gnb-top');
    if (top) {
      nav.classList.remove('wrap'); top.insertBefore(nav, top.querySelector('.gnb-util'));
      // 관리자는 다른 메뉴와 헷갈리지 않게 맨 오른쪽에 따로 둔다
      var side = document.createElement('div'); side.className = 'gnb-side';
      side.innerHTML = MENU.filter(function (m) { return m.side; }).map(item).join('');
      top.appendChild(side);
      initSearch(top);
    }
    nav.setAttribute('data-done', '1');
  }
})();
