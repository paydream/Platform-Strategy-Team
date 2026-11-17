/* 예스폼싸인 2차 고도화 — 왼쪽 메뉴 [계약 시작하기] → 계약 유형 고르기 모달 (2026-11-17)

   · 왼쪽 메뉴가 있는 화면(index.html · pages/bulk-list.html · pages/bulk-detail.html) 모두 같은 모달
     모달 모양은 템플릿 유형 선택 모달(Figma 01_04 · 54268:34098)과 같은 틀 — 이 모달 전용 Figma 는 아직 없음
   · 일반 계약 → 문서 업로드(pages/upload.html?type=normal&flow=send) → 참여자 설정(participants-send.html)
     대량 전송 → 대량 전송 1단계 입력 방식 설정(pages/bulk-send.html)
   · 열 때마다 일반 계약이 골라진 상태 (초점 테두리 없이 열림) · 취소 · 바깥 · Esc 로 닫힘
   · 잔여 건수가 0건이면(index.html?quota=0) 이 모달 대신 결제 안내 모달 (js/main.js 의 window.signNoQuota)
   · 주소에 ?start=1 이 있으면 열자마자 모달을 띄움 (시안 바로가기용) */
(function () {
  var start = document.querySelector('[data-start]');
  if (!start) return;
  var inPages = /\/pages\//.test(location.pathname.replace(/\\/g, '/'));
  var root = inPages ? '../' : '';

  var dim = document.createElement('div');
  dim.className = 'dim';
  dim.id = 'start-type';
  dim.hidden = true;
  dim.innerHTML =
    '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="start-type-title" aria-describedby="start-type-desc" tabindex="-1">' +
      '<div class="modal__top">' +
        '<h2 class="modal__title" id="start-type-title">어떤 계약을 시작할까요?</h2>' +
        '<p class="modal__desc" id="start-type-desc">보낼 방식을 선택해 주세요.</p>' +
      '</div>' +
      '<div class="modal__body" role="radiogroup" aria-labelledby="start-type-title">' +
        '<label class="opt"><input type="radio" name="start-type" value="normal" checked><span class="opt__check" aria-hidden="true"></span>' +
          '<span class="opt__text"><span class="opt__title">일반 계약</span>' +
          '<span class="opt__desc">서명 참여자가 여러 명인 계약을 보냅니다.</span>' +
          '<span class="opt__list">서명 참여자 최대 10명<br>서명 순서 정하기 가능</span></span></label>' +
        '<label class="opt"><input type="radio" name="start-type" value="bulk"><span class="opt__check" aria-hidden="true"></span>' +
          '<span class="opt__text"><span class="opt__title">대량 전송</span>' +
          '<span class="opt__desc">같은 계약서를 여러 명에게 한 번에 보냅니다.</span>' +
          '<span class="opt__list">최대 100명에게 전송<br>직접 입력 또는 엑셀 업로드</span></span></label>' +
      '</div>' +
      '<div class="modal__btns">' +
        '<button class="modal__btn" type="button" data-start-close>취소</button>' +
        '<button class="modal__btn modal__btn--primary" type="button" data-start-next>다음</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(dim);

  var radios = [].slice.call(dim.querySelectorAll('input[type="radio"]'));
  function open() {
    radios[0].checked = true;
    dim.hidden = false;
    document.body.style.overflow = 'hidden';
    dim.querySelector('.modal').focus({ preventScroll: true }); // 모달 자체에 초점 — 일반 계약 카드에 초점 테두리가 생기지 않게 (Tab 을 누르면 카드부터)
  }
  function close() {
    dim.hidden = true;
    document.body.style.overflow = '';
    start.focus({ preventScroll: true });
  }

  start.addEventListener('click', function () {
    if (window.signNoQuota) return; // 잔여 건수 0 — 결제 안내 모달이 대신 뜸
    open();
  });
  dim.addEventListener('click', function (e) {
    if (e.target.closest('[data-start-next]')) {
      var bulk = radios[1].checked;
      location.href = root + (bulk ? 'pages/bulk-send.html' : 'pages/upload.html?type=normal&flow=send');
      return;
    }
    if (e.target === dim || e.target.closest('[data-start-close]')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (dim.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    // Tab 이 모달 밖으로 나가지 않게 (고른 카드 → 취소 → 다음 → 처음)
    var items = [dim.querySelector('input[type="radio"]:checked')].concat([].slice.call(dim.querySelectorAll('.modal__btn')));
    var i = items.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
    else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    else if (i === -1) { e.preventDefault(); items[0].focus(); }
  });

  if (/[?&]start=1(&|$)/.test(location.search) && !window.signNoQuota) open();
})();
