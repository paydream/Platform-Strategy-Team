/* 예스폼싸인 2차 고도화 — 왼쪽 메뉴 [계약 시작하기] (2026-11-17 · 2026-11-19 모달 없앰)

   · 왼쪽 메뉴가 있는 화면(index.html · pages/bulk-list.html · pages/bulk-detail.html) 모두 같음
   · 누르면 "어떤 계약을 시작할까요?" 모달 없이 바로 계약하기 1단계 문서 업로드로 이동 (2026-11-20)
     Figma 계약하기 1단계 문서 업로드 (53689:17339) — "계약에 사용할 문서를" · 아래 "샘플 문서로 시작하기" 카드
     → pages/upload.html?type=normal&flow=send
       (위쪽 단계 문서 업로드 · 참여자 설정 · 서명 조건 설정 · 검토 · [다음] → 참여자 설정 participants-send.html)
   · 잔여 건수가 0건이면(index.html?quota=0) 이동하지 않고 결제 안내 모달 (js/main.js 의 window.signNoQuota)
   · 파일 이름은 예전 그대로 (각 HTML 이 이 파일을 불러옴) */
(function () {
  var start = document.querySelector('[data-start]');
  if (!start) return;
  var inPages = /\/pages\//.test(location.pathname.replace(/\\/g, '/'));
  var root = inPages ? '../' : '';
  var URL = root + 'pages/upload.html?type=normal&flow=send';

  start.addEventListener('click', function () {
    if (window.signNoQuota) return; // 잔여 건수 0 — 결제 안내 모달이 대신 뜸
    location.href = URL;
  });
})();
