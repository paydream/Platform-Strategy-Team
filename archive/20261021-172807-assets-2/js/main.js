/* =========================================================
   예스폼 에디터 — 템플릿 화면 (Figma 6422:46352)
   · 키워드별 인기 템플릿 카드 6장(HERO_CARDS) · 전체 템플릿 카드 16장(LIST_CARDS)을 그림
   · 키워드 버튼 · 탭 누르면 선택 표시만 바뀜 (목록 내용은 그대로)
   · 예스폼싸인 띠 X 누르면 닫힘
   ========================================================= */

const IMG = 'assets/images/';

/* 키워드별 인기 템플릿 — Figma 카드 순서 그대로 (image 없으면 "이미지를 준비중입니다" 카드) */
const HERO_CARDS = [
  { cat: '계약서', title: '[2026년] 고용노동부 권장 표준이력서 및 유의사항', image: null },
  { cat: '계약서', title: '[2026년] 고용노동부 권장 표준이력서 및 유의사항', image: 'hero-std-resume.png' },
  { cat: '계약서', title: '이력서(핵심역량)', image: 'hero-resume-core.png' },
  { cat: '계약서', title: '2026년 디자인 경력자 이력서 양식(포트폴리오 포함)', image: 'hero-design-resume.png' },
  { cat: '계약서', title: '무료 이력서 양식 다운로드 | 경력과 역량을 보여주는 무료서식', image: 'hero-free-resume.png' },
  { cat: '계약서', title: '[2026년] 고용노동부 권장 표준이력서 및 유의사항', image: 'hero-std-resume.png' },
];

/* 전체 템플릿 — Figma 카드 16장 순서 그대로
   sign: 전자계약 가능 배지 모양 ('line' 선형 · 'soft' 연한 배경형 · 'solid' 채운형 · 없으면 배지 없음) */
const LABOR = '[2026년] 표준근로계약서 (기간의 정함이 없는 경우)';
const LIST_CARDS = [
  { cat: '계약서', title: LABOR, image: 'list-invoice.png', sign: 'line' },
  { cat: '계약서', title: '재직증명서(사업자등록번호 포함)', image: 'list-diagnosis.png', sign: 'soft' },
  { cat: '회사서식', title: '공사계약서', image: 'list-construction.png', sign: 'solid' },
  { cat: '법률서식', title: '위임장(대리인)', image: 'list-poa.png' },
  { cat: '생활서식', title: '병원 진단서(소견서)', image: 'list-diagnosis.png' },
  { cat: '계약서', title: '[2026년] 표준 이력서', image: 'list-labor-contract.png' },
  { cat: '계약서', title: '[2026년] 인테리어 공사계약서', image: 'list-labor-contract.png' },
  { cat: '계약서', title: '무료 거래명세서 양식 예문과 서식 다운로드', image: 'list-labor-contract.png' },
  ...Array.from({ length: 8 }, () => ({ cat: '계약서', title: LABOR, image: 'list-labor-contract.png' })),
];

function esc(text) {
  return String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/* 키워드 카드 한 장 */
function heroCardHTML(card) {
  const empty = !card.image;
  const thumb = empty
    ? `<div class="thumb-card__empty">
         <span class="thumb-card__empty-icon"><img src="assets/icons/ic-image-placeholder.svg" width="48" height="48" alt="" /></span>
         이미지를 준비중입니다
       </div>`
    : `<img src="${IMG}${card.image}" alt="" loading="lazy" />`;
  const heart = empty ? 'ic-heart-30-gray.svg' : 'ic-heart-30.svg';
  return `
    <article class="thumb-card${empty ? ' thumb-card--empty' : ''}">
      <div class="thumb-card__thumb">
        ${thumb}
        <button type="button" class="thumb-card__heart" aria-label="찜하기"><img src="assets/icons/${heart}" width="30" height="30" alt="" /></button>
      </div>
      <div class="thumb-card__fade"></div>
      <div class="thumb-card__text">
        <div class="thumb-card__words">
          <p class="thumb-card__cat">${esc(card.cat)}</p>
          <p class="thumb-card__title"><a href="#" class="thumb-card__link" title="${esc(card.title)}">${esc(card.title)}</a></p>
        </div>
        <a href="#" class="thumb-card__btn">바로 편집하기</a>
      </div>
    </article>`;
}

/* 전체 템플릿 카드 한 장 */
function listCardHTML(card) {
  const signClass = { line: 'badge--sign', soft: 'badge--sign-soft', solid: 'badge--sign-solid' }[card.sign];
  const signBadge = signClass ? `<span class="badge ${signClass}">전자계약 가능</span>` : '';
  return `
    <article class="list-card">
      <div class="list-card__thumb">
        <img src="${IMG}${card.image}" alt="" loading="lazy" />
        <button type="button" class="list-card__heart" aria-label="찜하기"><img src="assets/icons/ic-heart-24.svg" width="24" height="24" alt="" /></button>
      </div>
      <div class="list-card__info">
        <div class="list-card__words">
          <p class="list-card__cat">${esc(card.cat)}</p>
          <p class="list-card__title"><a href="#" class="list-card__link" title="${esc(card.title)}">${esc(card.title)}</a></p>
        </div>
        <div class="badges"><span class="badge badge--premium">프리미엄</span>${signBadge}</div>
      </div>
    </article>`;
}

document.getElementById('hero-grid').innerHTML = HERO_CARDS.map(heroCardHTML).join('');
document.getElementById('list-grid').innerHTML = LIST_CARDS.map(listCardHTML).join('');

/* 키워드 버튼 · 탭 — 누른 것만 선택 표시 */
function bindSingleSelect(selector) {
  const items = document.querySelectorAll(selector);
  items.forEach((item) => {
    item.addEventListener('click', () => {
      items.forEach((other) => {
        const on = other === item;
        other.classList.toggle('is-active', on);
        other.setAttribute('aria-selected', String(on));
      });
    });
  });
}
bindSingleSelect('.keyword-chip');
bindSingleSelect('.editor-tab');

/* 예스폼싸인 띠 닫기 */
document.getElementById('sign-band-close').addEventListener('click', () => {
  document.getElementById('sign-band').hidden = true;
});
