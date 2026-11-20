/* 예스폼싸인 2차 고도화 — 프로토타입 바로가기 바 (2026-11-12)
   모든 화면 맨 위(헤더 위)에 고정되는 검정 바 · 디자인 화면이 아니라 시안 확인용
   · 흐름별 탭 — 누르면 아래로 그 흐름의 첫 화면 목록이 열림
     템플릿 관리   : 생성한 템플릿이 없는 경우(index.html?empty) · 템플릿이 있는 경우(index.html)
     템플릿 만들기 : 일반 계약 · 대량 전송 (문서 업로드 화면, flow=tpl)
                     + 단계 화면 바로 보기 — 2단계 역할 설정 · 일반 계약 (participants-normal.html) · 대량 전송 (participants.html)
                       · 3단계 서명 조건 설정 (signing.html?flow=tpl) · 4단계 검토 (review.html) · 미리보기 모달 (?preview=1)
     (계약 시작하기 탭은 2026-11-20 에 뺌 — 왼쪽 메뉴 [계약 시작하기] · 템플릿 관리 표의 행 [계약 시작하기]로 들어감)
     잔여 건수 없음 : 결제 안내 모달 01 · 02 (index.html?quota=0&modal=1|2 — [계약 시작하기]를 누르면 뜨는 모달)
     대량 전송 1~4단계 (2026-11-20 · 예전 [대량 전송 01] 탭을 단계별 탭 4개로 나눔) — 메뉴는 일반(직접 입력) / 엑셀 묶음
       1단계 입력 방식 설정 : 일반 입력 방식 선택 · 직접 입력 / 엑셀 입력 방식 선택 · 엑셀 업로드 · 엑셀 업로드 화면 (bulk-send.html)
       2단계 참여자 설정   : 일반 빈 표 / 엑셀 불러옴 · 데이터 오류 항목 (bulk-recipients.html)
       3단계 전송 설정     : 일반 받는 사람 5명 / 엑셀 12명 (bulk-settings.html?src=…&sample=1)
       4단계 검토          : 일반 · 엑셀 각각 검토 · 발송 진행 (bulk-review.html · bulk-progress.html)
       화면에서 [다음]으로 넘어가도 그 단계 탭이 켜짐 · 일반 / 엑셀은 주소의 src=excel 로 구분 (bulk-common.js 가 다음 화면에 이어 붙임)
     (대량 전송 목록 · 상세는 탭 없음 — 왼쪽 메뉴 [대량 전송]으로 들어감)
   · 항목에 group 이 있으면 그 앞에 작은 묶음 이름이 붙음 · 흐름에 items 대신 href 가 있으면 메뉴 없이 바로 그 주소로 감
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

  var FLOWS = [
    { key: 'home', name: '템플릿 관리', items: [
      { key: 'empty', name: '생성한 템플릿이 없는 경우', href: root + 'index.html?empty' },
      { key: 'list', name: '템플릿이 있는 경우', href: root + 'index.html' }
    ] },
    { key: 'tpl', name: '템플릿 만들기', items: [
      { key: 'normal', name: '일반 계약', href: root + 'pages/upload.html?type=normal&flow=tpl' },
      { key: 'bulk', name: '대량 전송', href: root + 'pages/upload.html?type=bulk&flow=tpl' },
      { key: 'step2-normal', group: '단계 화면 바로 보기', name: '2단계 역할 설정 · 일반 계약', href: root + 'pages/participants-normal.html?type=normal&flow=tpl' },
      { key: 'step2-bulk', name: '2단계 역할 설정 · 대량 전송', href: root + 'pages/participants.html?type=bulk&flow=tpl' },
      { key: 'signing', name: '3단계 서명 조건 설정', href: root + 'pages/signing.html?flow=tpl' },
      { key: 'review', name: '4단계 검토', href: root + 'pages/review.html?flow=tpl' },
      { key: 'preview', name: '4단계 검토 · 계약 화면 미리보기 모달', href: root + 'pages/review.html?flow=tpl&preview=1' }
    ] },
    { key: 'quota', name: '잔여 건수 없음', items: [
      { key: '1', name: '결제 안내 모달 01', href: root + 'index.html?quota=0&modal=1' },
      { key: '2', name: '결제 안내 모달 02', href: root + 'index.html?quota=0&modal=2' }
    ] },
    // 대량 전송 — 단계마다 탭 하나 · 메뉴는 일반(직접 입력) / 엑셀로 나눔 (2026-11-20)
    { key: 'bulk1', name: '대량 전송 1단계', items: [
      { key: 'direct', group: '일반', name: '입력 방식 선택 · 직접 입력', href: root + 'pages/bulk-send.html' },
      { key: 'excel', group: '엑셀', name: '입력 방식 선택 · 엑셀 업로드', href: root + 'pages/bulk-send.html?method=excel' },
      { key: 'upload', name: '엑셀 업로드 화면', href: root + 'pages/bulk-send.html?view=excel' }
    ] },
    { key: 'bulk2', name: '대량 전송 2단계', items: [
      { key: 'direct', group: '일반', name: '참여자 설정 · 빈 표', href: root + 'pages/bulk-recipients.html' },
      { key: 'excel', group: '엑셀', name: '참여자 설정 · 엑셀 불러옴', href: root + 'pages/bulk-recipients.html?src=excel' },
      { key: 'errors', name: '데이터 오류 항목', href: root + 'pages/bulk-recipients.html?src=excel&errors=1' }
    ] },
    { key: 'bulk3', name: '대량 전송 3단계', items: [
      { key: 'direct', group: '일반', name: '전송 설정 · 받는 사람 5명', href: root + 'pages/bulk-settings.html?src=direct&sample=1' },
      { key: 'excel', group: '엑셀', name: '전송 설정 · 받는 사람 12명', href: root + 'pages/bulk-settings.html?src=excel&sample=1' }
    ] },
    { key: 'bulk4', name: '대량 전송 4단계', items: [
      { key: 'direct', group: '일반', name: '검토 · 받는 사람 5명', href: root + 'pages/bulk-review.html?src=direct&sample=1' },
      { key: 'direct-progress', name: '발송 진행', href: root + 'pages/bulk-progress.html?src=direct&sample=1' },
      { key: 'excel', group: '엑셀', name: '검토 · 받는 사람 12명', href: root + 'pages/bulk-review.html?src=excel&sample=1' },
      { key: 'excel-progress', name: '발송 진행', href: root + 'pages/bulk-progress.html?src=excel&sample=1' }
    ] }
  ];

  // 지금 화면이 어느 흐름 · 어느 항목인지
  function current() {
    if (!inPages && /[?&]quota=0(&|$)/.test(q)) return { flow: 'quota', item: param('modal') === '2' ? '2' : '1' };
    if (!inPages) return { flow: 'home', item: /[?&]empty(=|&|$)/.test(q) ? 'empty' : 'list' };
    // 대량 전송 — 화면으로 단계 탭 · 주소(method · view · src · errors)로 일반 / 엑셀 항목
    var ex = param('src') === 'excel';
    if (page === 'bulk-send.html') return { flow: 'bulk1', item: param('view') === 'excel' ? 'upload' : param('method') === 'excel' ? 'excel' : 'direct' };
    if (page === 'bulk-recipients.html') return { flow: 'bulk2', item: ex ? (/[?&]errors=1(&|$)/.test(q) ? 'errors' : 'excel') : 'direct' };
    if (page === 'bulk-settings.html') return { flow: 'bulk3', item: ex ? 'excel' : 'direct' };
    if (page === 'bulk-review.html') return { flow: 'bulk4', item: ex ? 'excel' : 'direct' };
    if (page === 'bulk-progress.html') return { flow: 'bulk4', item: ex ? 'excel-progress' : 'direct-progress' };
    if (page === 'participants-normal.html') return { flow: 'tpl', item: 'step2-normal' }; // 템플릿 만들기 2단계 역할 설정 (일반 계약)
    if (page === 'participants.html') return { flow: 'tpl', item: 'step2-bulk' }; // 템플릿 만들기 2단계 역할 설정 (대량 전송)
    if (page === 'signing.html' && param('flow') !== 'send') return { flow: 'tpl', item: 'signing' }; // 템플릿 만들기 3단계 서명 조건 설정
    if (page === 'review.html') return { flow: 'tpl', item: /[?&]preview=1(&|$)/.test(q) ? 'preview' : 'review' }; // 템플릿 만들기 4단계 검토
    var type = param('type');
    if (!type) {
      try { type = (JSON.parse(param('d') || '{}').type) || null; } catch (e) { type = null; }
    }
    if (!type && page === 'participants.html') type = 'bulk';
    if (!type && page === 'participants-normal.html') type = 'normal';
    if (page === 'upload.html' && param('tab') === 'sample') return { flow: 'send', item: '' }; // 왼쪽 메뉴 [계약 시작하기] → 문서 업로드 (샘플 문서 탭 먼저)
    if (page === 'upload.html' && param('flow') === 'send' && !param('tpl')) return { flow: 'send', item: '' }; // 왼쪽 메뉴 [계약 시작하기] → 계약하기 1단계 문서 업로드
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
  bar.innerHTML = '<span class="proto__label">시안 바로가기</span>' + FLOWS.filter(function (f) { return !f.hidden; }).map(function (f, i) {
    var on = now.flow === f.key;
    if (f.href) return '<div class="proto__tab"><a class="proto__btn proto__btn--link' + (on ? ' is-on' : '') + '" href="' + f.href + '">' + f.name + '</a></div>';
    return '<div class="proto__tab">' +
      '<button class="proto__btn' + (on ? ' is-on' : '') + '" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="proto-menu-' + i + '">' + f.name + '</button>' +
      '<ul class="proto__menu" id="proto-menu-' + i + '" hidden>' + f.items.map(function (it) {
        var cur = on && now.item === it.key;
        return (it.group ? '<li class="proto__group" role="presentation">' + it.group + '</li>' : '') +
          '<li><a class="proto__item' + (cur ? ' is-on' : '') + '" href="' + it.href + '"' + (cur ? ' aria-current="page"' : '') + '>' + it.name + '</a></li>';
      }).join('') + '</ul></div>';
  }).join('');
  document.body.insertBefore(bar, document.body.firstChild);
  document.documentElement.classList.add('has-proto');

  // 탭을 누르면 그 탭 메뉴만 열림 · 바깥을 누르거나 Esc 로 닫힘
  var tabs = [].slice.call(bar.querySelectorAll('.proto__tab')).filter(function (t) { return t.querySelector('.proto__menu'); });
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
