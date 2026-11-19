/* 예스폼싸인 2차 고도화 — 왼쪽 메뉴 [계약 시작하기] (2026-11-17 · 2026-11-19 모달 없앰)

   · 왼쪽 메뉴가 있는 화면(index.html · pages/bulk-list.html · pages/bulk-detail.html) 모두 같음
   · 누르면 "어떤 계약을 시작할까요?" 모달 없이 바로 1단계 문서 업로드로 이동
     Figma 02_01_템플릿 만들기_템플릿이 없는 경우 (54192:37523) — 샘플 문서 탭이 먼저 열린 화면
     → pages/upload.html?type=normal&flow=tpl&tab=sample
       (위쪽 단계 문서 업로드 · 역할 설정 · 서명 조건 설정 · 검토 — 시안 그대로 · [다음] → 역할 설정 participants-normal.html)
   · 잔여 건수가 0건이면(index.html?quota=0) 이동하지 않고 결제 안내 모달 (js/main.js 의 window.signNoQuota)
   · 파일 이름은 예전 그대로 (각 HTML 이 이 파일을 불러옴) */
(function () {
  var start = document.querySelector('[data-start]');
  if (!start) return;
  var inPages = /\/pages\//.test(location.pathname.replace(/\\/g, '/'));
  var root = inPages ? '../' : '';
  var URL = root + 'pages/upload.html?type=normal&flow=tpl&tab=sample';

  start.addEventListener('click', function () {
    if (window.signNoQuota) return; // 잔여 건수 0 — 결제 안내 모달이 대신 뜸
    location.href = URL;
  });
})();
