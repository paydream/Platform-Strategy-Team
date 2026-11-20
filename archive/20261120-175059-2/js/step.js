/* 예스폼싸인 2차 고도화 — 계약 단계 화면 공통 (upload · participants · participants-normal · participants-send · signing)

   위쪽 2단계 이름 — 템플릿 만들기 "역할 설정" (Figma 54361:34379) · [계약하기] "참여자 설정"
   · 주소에 flow=tpl 이면 "역할 설정", flow=send 면 "참여자 설정"으로 바꿈
     (템플릿 관리 모달 [다음] → upload.html?…&flow=tpl → participants(-normal).html → signing.html?flow=tpl&d=…)
     ([계약하기] → upload.html?…&tpl=… → participants-send.html → signing.html?flow=send&d=…)
   · HTML 에 적힌 기본값: participants · participants-normal · signing = "역할 설정" / upload · participants-send = "참여자 설정"

   나가기 확인 모달 (Figma 54347:35246)
   · 아래 [나가기]를 누르면 "현재 작성하신 계약이 저장되지 않습니다." 모달
   · 취소 · 바깥(어두운 곳) · Esc 로 닫힘 · 모달의 [나가기] → 템플릿 관리(index.html) */
(function () {
  var dim = document.getElementById('exit-modal');
  var opener = document.querySelector('[data-exit]');
  if (!dim || !opener) return;
  var cancel = dim.querySelector('[data-exit-cancel]');
  var leave = dim.querySelector('.modal__btn--primary');

  function open() {
    dim.hidden = false;
    document.body.style.overflow = 'hidden';
    cancel.focus({ preventScroll: true });
  }
  function close() {
    dim.hidden = true;
    document.body.style.overflow = '';
    opener.focus({ preventScroll: true });
  }
  opener.addEventListener('click', open);
  cancel.addEventListener('click', close);
  dim.addEventListener('click', function (e) { if (e.target === dim) close(); });
  document.addEventListener('keydown', function (e) {
    if (dim.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') { // 취소 ↔ 나가기 사이에서만 돎
      e.preventDefault();
      (document.activeElement === cancel ? leave : cancel).focus();
    }
  });
})();

/* 2단계 이름 — flow=tpl 템플릿 만들기 · flow=send 계약하기 */
(function () {
  var m = location.search.match(/[?&]flow=(tpl|send)(&|$)/);
  if (!m) return;
  var step2 = document.querySelectorAll('.steps__item')[1];
  if (step2) step2.lastChild.nodeValue = m[1] === 'tpl' ? '역할 설정' : '참여자 설정';
})();
