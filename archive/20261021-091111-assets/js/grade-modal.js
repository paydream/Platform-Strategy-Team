/* =========================================================
   등급 모달 — 템플릿 화면 위에 띄움 (시안 01 · 시안 02 탭)
   · 화면을 열면 모달이 떠 있음 (처음엔 시안 01, 그다음부터는 마지막에 고른 탭)
   · 화면 위 가운데 탭으로 시안 01(디자인1) ↔ 시안 02(디자인2) 바꿔 보기
     — 모달을 닫은 상태에서 탭을 누르면 그 시안으로 다시 열림
   · 오른쪽 위 X를 누르면 닫힘
   · 딤드(검정 배경)를 누르거나 ESC를 눌러도 닫히지 않음 (메인_편집 · 메인_의견안내 모달과 같은 규칙)
   · 닫은 뒤 템플릿 카드(제목 · 바로 편집하기)를 누르면 지금 고른 시안으로 다시 열림
   · "예스폼 프리미엄 구독하기"는 화면 확인용이라 실제 이동 없음
   ========================================================= */

(function () {
  const dim = document.getElementById('gm-dim');
  const modals = { 1: document.getElementById('gm-d1'), 2: document.getElementById('gm-d2') };
  const tabs = [...document.querySelectorAll('.gm-tabs [role="tab"]')];
  const back = [...document.querySelectorAll('body > nav, body > main')]; // 뒤 화면 (메뉴 · 템플릿 목록)
  const KEY = 'grade-modal-tab';
  let cur = '1';
  let opener = null;

  /* 탭 고르기 — 고른 시안 모달만 보이게 · 다음에 열 때도 기억 */
  function select(t) {
    cur = t;
    tabs.forEach((b) => {
      const on = b.dataset.t === t;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    Object.keys(modals).forEach((k) => { modals[k].hidden = k !== t; });
    try { localStorage.setItem(KEY, t); } catch (e) { /* 저장 안 돼도 화면은 그대로 */ }
  }

  function open(from) {
    opener = from || null;
    dim.hidden = false;
    back.forEach((el) => { el.inert = true; }); // 뒤 화면은 눌리지 않고 초점도 안 감
    document.body.classList.add('gm-open');
    show();
  }

  /* 고른 시안 모달에 초점 · 맨 위부터 보이게 (화면이 낮을 때 모달이 시안 탭 밑으로 밀려 올라가지 않게) */
  function show() {
    modals[cur].focus({ preventScroll: true });
    dim.scrollTop = 0;
  }

  function close() {
    dim.hidden = true;
    back.forEach((el) => { el.inert = false; });
    document.body.classList.remove('gm-open');
    if (opener) opener.focus(); // 열었던 카드 · 탭으로 초점을 돌려줌
  }

  dim.querySelectorAll('.gm__close').forEach((b) => b.addEventListener('click', close));

  /* 탭 누르기 — 시안 바꾸기 (닫혀 있으면 다시 열기) */
  tabs.forEach((b) => b.addEventListener('click', () => {
    select(b.dataset.t);
    if (dim.hidden) open(b);
    else show();
  }));

  /* 탭에서 ← → 키로 옆 탭 고르기 */
  document.querySelector('.gm-tabs').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const i = tabs.findIndex((b) => b.dataset.t === cur);
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    e.preventDefault();
    select(next.dataset.t);
    if (dim.hidden) open(next);
    dim.scrollTop = 0;
    next.focus(); // 키보드로 고를 때는 초점을 탭에 둠
  });

  /* 딤드 클릭 — 아무 동작 없음 */
  dim.addEventListener('click', (e) => {
    if (e.target === dim) e.stopPropagation();
  });

  /* 템플릿 카드 누르면 다시 열림 */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.thumb-card__link, .thumb-card__btn, .list-card__link');
    if (!link || !dim.hidden) return;
    e.preventDefault();
    open(link);
  });

  /* 키보드 Tab 이동을 모달 안에서만 돌게 */
  dim.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const modal = modals[cur];
    const items = [...modal.querySelectorAll('button, [href]')];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === modal)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* 처음 — 마지막에 고른 탭(없으면 시안 01)으로 열어 둠 */
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* 무시 */ }
  select(modals[saved] ? saved : '1');
  open();
})();
