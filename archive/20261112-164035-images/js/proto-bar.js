/* 예스폼싸인 2차 고도화 — 프로토타입 바로가기 바 (2026-11-12)
   모든 화면 맨 위(헤더 위)에 고정되는 검정 바 · 디자인 화면이 아니라 시안 확인용
   · 흐름별 탭 3개 — 누르면 아래로 그 흐름의 첫 화면 목록이 열림
     템플릿 관리   : 생성한 템플릿이 없는 경우(index.html?empty) · 템플릿이 있는 경우(index.html)
     템플릿 만들기 : 일반 계약 · 대량 전송 (문서 업로드 화면, flow=tpl)
     계약 시작하기 : 대량 전송 템플릿 · 일반 계약 템플릿 (템플릿 관리 표 1 · 2번째 행의 [계약 시작하기]와 같은 주소)
   · 지금 보고 있는 화면의 흐름 탭과 항목이 파랗게 표시됨
   · 바 높이만큼(40) 헤더와 본문이 아래로 내려감 — css/style.css "프로토타입 바로가기 바"
   · index.html 은 js/proto-bar.js, pages/ 안 화면은 ../js/proto-bar.js 로 불러옴 */
(function () {
  var inPages = /\/pages\//.test(location.pathname.replace(/\\/g, '/'));
  var root = inPages ? '../' : '';
  var page = (location.pathname.split(/[\\/]/).pop() || 'index.html').toLowerCase();
  var q = location.search;
  function param(k) {
    var m = q.match(new RegExp('[?&]' + k + '=([^&]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  // 계약 시작하기 — 템플릿 관리 표의 행과 같은 역할 데이터 (index.html 1 · 2번째 행)
  function sendUrl(type, tpl, roles) {
    return root + 'pages/upload.html?type=' + type + '&tpl=' + encodeURIComponent(tpl) + '&roles=' + encodeURIComponent(JSON.stringify(roles));
  }
  var FLOWS = [
    { key: 'home', name: '템플릿 관리', items: [
      { key: 'empty', name: '생성한 템플릿이 없는 경우', href: root + 'index.html?empty' },
      { key: 'list', name: '템플릿이 있는 경우', href: root + 'index.html' }
    ] },
    { key: 'tpl', name: '템플릿 만들기', items: [
      { key: 'normal', name: '일반 계약', href: root + 'pages/upload.html?type=normal&flow=tpl' },
      { key: 'bulk', name: '대량 전송', href: root + 'pages/upload.html?type=bulk&flow=tpl' }
    ] },
    { key: 'send', name: '계약 시작하기', items: [
      { key: 'bulk', name: '대량 전송 템플릿', href: sendUrl('bulk', '부동산 매매 계약서(특약사항 포함)', [
        { role: '계약자', name: '홍길동', contact: '010-1234-1234', preset: true, auth: ['접근 암호 인증', '휴대폰 번호 인증'], self: true },
        { role: '매수인', name: '', contact: '', preset: false, auth: [], self: false }]) },
      { key: 'normal', name: '일반 계약 템플릿', href: sendUrl('normal', '계약서명 정규직 근로계약서', [
        { role: '근로자', name: '김민준', contact: '010-2345-6789', preset: true, auth: [], self: false }]) }
    ] }
  ];

  // 지금 화면이 어느 흐름 · 어느 항목인지
  function current() {
    if (!inPages) return { flow: 'home', item: /[?&]empty(=|&|$)/.test(q) ? 'empty' : 'list' };
    var type = param('type');
    if (!type) {
      try { type = (JSON.parse(param('d') || '{}').type) || null; } catch (e) { type = null; }
    }
    if (!type && page === 'participants.html') type = 'bulk';
    if (!type && page === 'participants-normal.html') type = 'normal';
    var flow = param('flow');
    if (!flow) {
      if (param('tpl') || page === 'participants-send.html') flow = 'send';
      else if (page === 'participants.html' || page === 'participants-normal.html' || param('from') === 'upload') flow = 'tpl';
    }
    return { flow: flow, item: type };
  }
  var now = current();

  var bar = document.createElement('div');
  bar.className = 'proto';
  bar.setAttribute('role', 'navigation');
  bar.setAttribute('aria-label', '시안 화면 바로가기');
  bar.innerHTML = '<span class="proto__label">시안 바로가기</span>' + FLOWS.map(function (f, i) {
    var on = now.flow === f.key;
    return '<div class="proto__tab">' +
      '<button class="proto__btn' + (on ? ' is-on' : '') + '" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="proto-menu-' + i + '">' + f.name + '</button>' +
      '<ul class="proto__menu" id="proto-menu-' + i + '" hidden>' + f.items.map(function (it) {
        var cur = on && now.item === it.key;
        return '<li><a class="proto__item' + (cur ? ' is-on' : '') + '" href="' + it.href + '"' + (cur ? ' aria-current="page"' : '') + '>' + it.name + '</a></li>';
      }).join('') + '</ul></div>';
  }).join('');
  document.body.insertBefore(bar, document.body.firstChild);
  document.documentElement.classList.add('has-proto');

  // 탭을 누르면 그 탭 메뉴만 열림 · 바깥을 누르거나 Esc 로 닫힘
  var tabs = [].slice.call(bar.querySelectorAll('.proto__tab'));
  function closeAll(except) {
    tabs.forEach(function (t) {
      if (t === except) return;
      t.querySelector('.proto__menu').hidden = true;
      t.querySelector('.proto__btn').setAttribute('aria-expanded', 'false');
    });
  }
  tabs.forEach(function (t) {
    var btn = t.querySelector('.proto__btn');
    var menu = t.querySelector('.proto__menu');
    btn.addEventListener('click', function () {
      var open = menu.hidden;
      closeAll(t);
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) menu.querySelector('.proto__item').focus();
    });
  });
  document.addEventListener('click', function (e) { if (!bar.contains(e.target)) closeAll(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var openTab = tabs.filter(function (t) { return !t.querySelector('.proto__menu').hidden; })[0];
    if (!openTab) return;
    closeAll();
    openTab.querySelector('.proto__btn').focus();
  });
})();
