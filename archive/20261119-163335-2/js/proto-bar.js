/* 예스폼싸인 2차 고도화 — 프로토타입 바로가기 바 (2026-11-12)
   모든 화면 맨 위(헤더 위)에 고정되는 검정 바 · 디자인 화면이 아니라 시안 확인용
   · 흐름별 탭 — 누르면 아래로 그 흐름의 첫 화면 목록이 열림
     템플릿 관리   : 생성한 템플릿이 없는 경우(index.html?empty) · 템플릿이 있는 경우(index.html) · 표 글자 크기 시험안 1) 14 (?fs=14) · 2) 15 (?fs=15)
     템플릿 만들기 : 일반 계약 · 대량 전송 (문서 업로드 화면, flow=tpl) · 4단계 검토 (pages/review.html) · 미리보기 모달 (?preview=1)
     계약 시작하기 : 메뉴 없이 누르면 바로 1단계 문서 업로드 · 샘플 문서 탭 먼저 (왼쪽 메뉴 [계약 시작하기]와 같음 · Figma 54192:37523)
                     pages/upload.html?type=normal&flow=tpl&tab=sample
                     — 템플릿으로 시작하는 화면은 템플릿 관리 표의 행 [계약 시작하기]로 들어감
     잔여 건수 없음 : 결제 안내 모달 01 · 02 (index.html?quota=0&modal=1|2 — [계약 시작하기]를 누르면 뜨는 모달)
     대량 전송 01  : 4단계 화면 — 입력 방식 선택(직접 입력 · 엑셀 업로드 고름) · 엑셀 업로드 화면 (pages/bulk-send.html)
     대량 전송 02  : 간편 화면 — 입력 방식 선택 · 엑셀 업로드 고름(카드 안 파일 선택) (pages/bulk-send.html?ux=2)
     대량 전송 01 · 02 의 다음 화면(참여자 설정 → 전송 설정 → 검토 → 발송 진행)은 탭 없이 화면에서 [다음]으로 이어 감
       — 이 화면들에서는 지금 흐름(01 · 02 — 주소 ux=2)의 탭이 켜짐
     (예전 "대량 전송 참여자 설정" · "대량 전송 설정 · 검토" 탭은 hidden: true 로 숨김 — 지우면 다시 보임)
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
      { key: 'list', name: '템플릿이 있는 경우', href: root + 'index.html' },
      { key: 'fs14', name: '템플릿이 있는 경우 1) 14', href: root + 'index.html?fs=14' }, // 표 글자 크기 시험안 (머리 14 · 템플릿명 15 · 라벨 12)
      { key: 'fs15', name: '템플릿이 있는 경우 2) 15', href: root + 'index.html?fs=15' }  // 표 글자 크기 시험안 (머리 15 · 템플릿명 16 · 라벨 12)
    ] },
    { key: 'tpl', name: '템플릿 만들기', items: [
      { key: 'normal', name: '일반 계약', href: root + 'pages/upload.html?type=normal&flow=tpl' },
      { key: 'bulk', name: '대량 전송', href: root + 'pages/upload.html?type=bulk&flow=tpl' },
      { key: 'review', group: '단계 화면 바로 보기', name: '4단계 검토', href: root + 'pages/review.html?flow=tpl' },
      { key: 'preview', name: '4단계 검토 · 계약 화면 미리보기 모달', href: root + 'pages/review.html?flow=tpl&preview=1' }
    ] },
    { key: 'send', name: '계약 시작하기', href: root + 'pages/upload.html?type=normal&flow=tpl&tab=sample' }, // 모달 없이 바로 1단계 문서 업로드 (샘플 문서 탭 먼저)
    { key: 'quota', name: '잔여 건수 없음', items: [
      { key: '1', name: '결제 안내 모달 01', href: root + 'index.html?quota=0&modal=1' },
      { key: '2', name: '결제 안내 모달 02', href: root + 'index.html?quota=0&modal=2' }
    ] },
    { key: 'bulk01', name: '대량 전송 01', items: [
      { key: 'pick', name: '입력 방식 선택 · 직접 입력', href: root + 'pages/bulk-send.html' },
      { key: 'excel', name: '입력 방식 선택 · 엑셀 업로드', href: root + 'pages/bulk-send.html?method=excel' },
      { key: 'upload', name: '엑셀 업로드 화면', href: root + 'pages/bulk-send.html?view=excel' }
    ] },
    { key: 'bulk02', name: '대량 전송 02', items: [
      { key: 'pick', name: '입력 방식 선택 · 직접 입력', href: root + 'pages/bulk-send.html?ux=2' },
      { key: 'excel', name: '입력 방식 선택 · 엑셀 업로드 (바로 파일 선택)', href: root + 'pages/bulk-send.html?ux=2&method=excel' }
    ] },
    { key: 'bulkp', name: '대량 전송 참여자 설정', hidden: true, items: [
      { key: 'excel', name: '엑셀 불러옴', href: root + 'pages/bulk-recipients.html?src=excel' },
      { key: 'error', name: '데이터 오류 항목', href: root + 'pages/bulk-recipients.html?src=excel&errors=1' },
      { key: 'direct', name: '직접 입력 (빈 표)', href: root + 'pages/bulk-recipients.html' }
    ] },
    { key: 'bulkn', name: '대량 전송 설정 · 검토', hidden: true, items: [
      { key: 'settings', name: '전송 설정', href: root + 'pages/bulk-settings.html' },
      { key: 'review', name: '검토', href: root + 'pages/bulk-review.html' },
      { key: 'modal', name: '받는 사람 목록 모달', href: root + 'pages/bulk-review.html?modal=1' },
      { key: 'progress', name: '발송 진행', href: root + 'pages/bulk-progress.html' }
    ] }
  ];

  // 지금 화면이 어느 흐름 · 어느 항목인지
  function current() {
    if (!inPages && /[?&]quota=0(&|$)/.test(q)) return { flow: 'quota', item: param('modal') === '2' ? '2' : '1' };
    if (!inPages) return { flow: 'home', item: /[?&]empty(=|&|$)/.test(q) ? 'empty' : param('fs') === '14' ? 'fs14' : param('fs') === '15' ? 'fs15' : 'list' };
    if (page === 'bulk-send.html') {
      if (param('ux') === '2') return { flow: 'bulk02', item: param('method') === 'excel' ? 'excel' : 'pick' };
      return { flow: 'bulk01', item: param('view') === 'excel' ? 'upload' : param('method') === 'excel' ? 'excel' : 'pick' };
    }
    // 대량 전송 다음 화면들 — 01 · 02 흐름 탭을 켬 (항목은 없음)
    if (/^bulk-(recipients|settings|review|progress)\.html$/.test(page)) return { flow: param('ux') === '2' ? 'bulk02' : 'bulk01', item: '' };
    if (page === 'review.html') return { flow: 'tpl', item: /[?&]preview=1(&|$)/.test(q) ? 'preview' : 'review' }; // 템플릿 만들기 4단계 검토
    var type = param('type');
    if (!type) {
      try { type = (JSON.parse(param('d') || '{}').type) || null; } catch (e) { type = null; }
    }
    if (!type && page === 'participants.html') type = 'bulk';
    if (!type && page === 'participants-normal.html') type = 'normal';
    if (page === 'upload.html' && param('tab') === 'sample') return { flow: 'send', item: '' }; // 왼쪽 메뉴 [계약 시작하기] → 문서 업로드 (샘플 문서 탭 먼저)
    if (page === 'upload.html' && param('flow') === 'send' && !param('tpl')) return { flow: 'send', item: '' }; // 예전 주소 (계약 유형 모달 → 일반 계약)
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
