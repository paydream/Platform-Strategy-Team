/* =========================================================
   예스폼 에디터 — 메인 편집 화면 · 에디터 가이드 모달 4단계
   Figma: 섹션 6514:51221 "261015_에디터 가이드 모달" (261014_모달 · 모달2 · 모달3 · 모달4)
   · 화면을 열면 1/4 모달이 떠 있음
   · 다음 / 이전으로 단계 이동 (1단계는 이전 없음) · 4단계 "에디터 시작하기"를 누르면 닫힘
   · 딤드(검정 배경)를 눌러도 아무 일 없음 — ESC 키로도 닫히지 않음
   · 오른쪽 위 X를 누르면 어느 단계에서든 닫힘
   ========================================================= */

/* 단계별 내용 — 그림 · 제목 · 설명(줄바꿈은 Figma 그대로) · 회색 안내(4단계) · 오른쪽 버튼 글자 */
const GUIDE_STEPS = [
  { // 261014_모달 (6494:29629)
    img: 'assets/images/guide-step1.png',
    title: '예스폼 서식을 나만의 문서로 완성하세요',
    desc: '전문가가 만든 서식의 구성과 예시를 참고해, 내 상황에 맞게 고쳐 쓰세요.<br />이름·날짜·금액 같은 예시 내용은 꼭 실제 정보로 변경하거나 삭제해 주세요.',
    next: '다음',
  },
  { // 261014_모달2 (6501:44030)
    img: 'assets/images/guide-step2.png',
    title: '추천 프롬프트로 초안을 생성하세요',
    desc: '만들고 싶은 문서를 예스폼 AI가 초안으로 만들어 드려요.<br />무엇을 써야 할지 막막하면 추천 프롬프트를 눌러 보세요.',
    next: '다음',
  },
  { // 261014_모달3 (6467:44273) — Figma도 줄바꿈 없이 폭에 맞춰 넘어감
    img: 'assets/images/guide-step3.png',
    title: '예스폼 에디터에서 자유롭게 문서를 작성하세요',
    desc: '에디터 기능으로 내용을 자유롭게 수정·편집해 나만의 문서를 완성해 보세요. 바로 쓸 문서가 필요하면 ‘템플릿’ 페이지를 확인해 보세요.',
    next: '다음',
  },
  { // 261014_모달4 (6503:50905) — 2026-10-15 Figma 문구 업데이트 반영
    img: 'assets/images/guide-step4.png',
    title: '작성한 계약서, 바로 전자계약하세요',
    desc: '계약서 작성부터 전자계약까지 예스폼에서 해결하세요.<br />프리미엄 회원은 예스폼싸인 전자계약 건수를 무료로 받을 수 있어요.',
    note: '문서 용량은 5MB 이하만 가능합니다.',
    next: '에디터 시작하기',
  },
];

(function () {
  const dim = document.getElementById('guide-dim');
  const modal = dim.querySelector('.guide-modal');
  const app = document.getElementById('app');
  const el = {
    img: document.getElementById('guide-img'),
    now: document.getElementById('guide-step-now'),
    total: document.getElementById('guide-step-total'),
    title: document.getElementById('guide-title'),
    desc: document.getElementById('guide-desc'),
    note: document.getElementById('guide-note'),
    prev: document.getElementById('guide-prev'),
    next: document.getElementById('guide-next'),
    close: document.getElementById('guide-close'),
  };
  let step = 0;

  /* 그림 미리 불러오기 — 단계를 넘길 때 그림이 늦게 뜨지 않게 */
  GUIDE_STEPS.forEach((s) => { const im = new Image(); im.src = s.img; });

  /* 단계 그리기 */
  function render() {
    const s = GUIDE_STEPS[step];
    el.img.src = s.img;
    el.now.textContent = step + 1;
    el.total.textContent = GUIDE_STEPS.length;
    el.title.textContent = s.title;
    el.desc.innerHTML = s.desc;
    el.note.textContent = s.note || '';
    el.note.hidden = !s.note;
    el.prev.hidden = step === 0;
    el.next.textContent = s.next;
  }

  /* 모달 닫기 — 딤드를 숨기고 뒤 화면을 다시 쓸 수 있게 */
  function closeGuide() {
    dim.hidden = true;
    app.inert = false;
    document.body.classList.remove('is-modal-open');
  }

  el.next.addEventListener('click', () => {
    if (step < GUIDE_STEPS.length - 1) { step += 1; render(); }
    else closeGuide(); // 마지막 단계 "에디터 시작하기"
  });
  el.prev.addEventListener('click', () => {
    if (step > 0) { step -= 1; render(); }
    if (step === 0) el.next.focus(); // 이전 버튼이 사라지면 초점을 다음 버튼으로
  });
  el.close.addEventListener('click', closeGuide);

  /* 딤드 클릭 — 아무 동작 없음 (모달 바깥을 눌러도 닫히지 않게 일부러 막아 둠) */
  dim.addEventListener('click', (e) => {
    if (e.target === dim) e.stopPropagation();
  });

  /* 키보드 탭 이동을 모달 안에서만 돌게 함 */
  dim.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const items = [...modal.querySelectorAll('button:not([hidden]), [href], input, textarea, [tabindex]:not([tabindex="-1"])')];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* 모달이 떠 있는 동안 뒤 화면은 눌리거나 초점이 가지 않게 */
  app.inert = true;
  render();
  modal.focus();
})();
