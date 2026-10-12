/* =========================================================
   카드01 — 프롬프트 카드 (보관용)
   메인 js/main.js에서 빼낸 코드. 이 페이지에서만 따로 동작합니다.
   ========================================================= */

/* 업무분야 → 칩 컬러 (메인 main.js의 FIELD_TONE과 같음) */
const FIELD_TONE = {
  'HR관리': 'hr', '회계': 'accounting', '현장': 'site', '법무': 'legal', '총무': 'admin',
  'AI': 'ai', '생산': 'scm', '공공행정': 'public', '영업': 'sales',
};
const fieldKey = (field) => field.replace(/\s/g, '').split('·')[0];
const toneForField = (field) => FIELD_TONE[fieldKey(field)] || 'hr';

/**
 * 카드01 데이터 (예스폼 에디터 Figma 5451:53036)
 * industry: 업종 → 상단 이름 + 아이콘 (INDUSTRY_ICON)
 * field   : 업무분야 → 컬러톤 칩 (FIELD_TONE)
 * Figma 시안 예시 문구를 8개 복사해 둠 — 실제 데이터로 교체하세요.
 */
const INDUSTRY_ICON = {
  '의료': '../../assets/icons/ind-medical.svg', // 의료·바이오·헬스케어 (시안에 있는 업종 아이콘은 이것 하나)
};
const INDUSTRY_ICON_DEFAULT = '../../assets/icons/ind-medical.svg';

const PROMPT_SAMPLE = {
  industry: '의료·바이오·헬스케어',
  field: '총무·경영지원·일반사무',
  title: '하계 휴양소 이용 신청서 입니다',
  desc: '임직원 휴양 시설 이용 하계 휴양소 이용 신청서 양식을 작성해주세요. 임직원 휴양 시설 이용 하계 휴양소 이용 신청서 양식을 작성해주세요.임직원 휴양 시설 이용 하계 휴양소 이용 신청서 양식을 작성해주세요.임직원 휴양 시설 이용 하계 휴양소 이용 신청서 양식을 작성해주세요.',
  views: 12456,
  href: '#',
};
const PROMPT_CARDS = Array.from({ length: 8 }, () => ({ ...PROMPT_SAMPLE }));

/* ---------- 카드01 렌더링 ---------- */
function renderPromptCards() {
  const grid = document.getElementById('prompt-grid');
  const tpl = document.getElementById('prompt-card-template');
  const frag = document.createDocumentFragment();

  PROMPT_CARDS.forEach((data) => {
    const card = tpl.content.firstElementChild.cloneNode(true);
    card.querySelector('.prompt-card__cat-icon img').src = INDUSTRY_ICON[fieldKey(data.industry)] || INDUSTRY_ICON_DEFAULT;
    card.querySelector('.prompt-card__cat-name').textContent = data.industry;

    const chip = card.querySelector('.prompt-card__chip');
    chip.textContent = data.field;
    chip.classList.add(`tone--${toneForField(data.field)}`);

    const title = card.querySelector('.prompt-card__title');
    title.textContent = data.title;
    title.title = data.title;
    card.querySelector('.prompt-card__desc').textContent = data.desc;

    card.querySelector('.prompt-card__views-count').textContent = data.views.toLocaleString('ko-KR');
    card.querySelector('.prompt-card__cta').href = data.href || '#';
    card.querySelector('.prompt-card__copy').dataset.copy = `${data.title}\n${data.desc}`;

    frag.appendChild(card);
  });

  grid.appendChild(frag);
}

/* 찜·복사 */
document.addEventListener('click', (e) => {
  const fav = e.target.closest('.prompt-card__fav');
  if (fav) {
    const on = fav.getAttribute('aria-pressed') !== 'true';
    fav.setAttribute('aria-pressed', String(on));
    fav.setAttribute('aria-label', on ? '찜 해제' : '찜하기');
  }
  const copy = e.target.closest('.prompt-card__copy');
  if (copy && navigator.clipboard) navigator.clipboard.writeText(copy.dataset.copy || '').catch(() => {});
});

document.addEventListener('DOMContentLoaded', renderPromptCards);
