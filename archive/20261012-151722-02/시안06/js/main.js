/* =========================================================
   예스폼 메인 — 카드 렌더링 + 인터랙션
   시안 06 스크립트 — 시안 01(../시안01-1/js/main.js)을 복사해서 프롬프트 탭 카드만 바꿈 (테스트2 Figma 56:13346 · 카드 71:1418 · 71:1454)
   · AI로 초안 생성하기 탭 (처음 열리는 탭) → ../assets/js/prompt-data.js 의 데이터로 라인01 · 라인02 카드 렌더링
   · 예스폼 추천 콘텐츠 등 나머지 탭 → CARDS (썸네일 카드, 1920에서 1행 7개)
   · 예전 프롬프트 카드(카드01)는 _보관/카드01 로 옮김
   카드 내용은 두 배열만 고치면 됩니다.
   ========================================================= */

const TITLE = '해외 구매대행 매출관리 엑셀 프로그램(매매기준율 자동표시, 구매대행 소명자료 자동작성)';
const IMG = '../assets/images/';

/**
 * grade : 'premium' | 'member' | 'free'
 * tag   : null | { type: 'ai' | 'update' | 'update-light', label }
 * review: null | { count, isNew }   (isNew=true면 N 배지 표시)
 * wide  : true면 max-width 400 (Figma 2행 카드)
 */
const CARDS = [
  // ---- 1행 (Figma 5594:5621) ----
  { img: 'thumb-finance-excel.png',         title: TITLE, grade: 'premium', views: 932, tag: { type: 'ai', label: 'AI 템플릿' },           review: { count: '152', isNew: true } },
  { img: 'thumb-medical-certificate.png',   title: TITLE, grade: 'premium', views: 932, tag: { type: 'ai', label: 'AI 생성·전문가 검수' }, review: { count: '152', isNew: true } },
  { img: 'thumb-standard-contract.png',     title: TITLE, grade: 'member',  views: 932, tag: null,                                        review: null },
  { img: 'thumb-medical-certificate.png',   title: TITLE, grade: 'member',  views: 932, tag: null,                                        review: null },
  { img: 'thumb-purchase-sales.png',        title: TITLE, grade: 'free',    views: 932, tag: { type: 'update', label: 'Update' },        review: { count: '152', isNew: true } },
  { img: 'thumb-medical-certificate.png',   title: TITLE, grade: 'free',    views: 932, tag: null,                                        review: { count: '152', isNew: true } },
  { img: 'thumb-inventory-excel.png',       title: TITLE, grade: 'free',    views: 932, tag: { type: 'update-light', label: 'Update' },  review: null },
  { img: 'thumb-medical-certificate.png',   title: TITLE, grade: 'premium', views: 932, tag: { type: 'update-light', label: 'Update' },  review: { count: '99+', isNew: false } },

  // ---- 2행 (Figma 5594:5925) ----
  { img: 'thumb-payroll.png',               title: TITLE, grade: 'premium', views: 932, tag: null, review: { count: '152', isNew: true }, wide: true },
  { img: 'thumb-medical-detail.png',        title: TITLE, grade: 'premium', views: 932, tag: null, review: null, wide: true },
  { img: 'thumb-org-chart-ppt.png',         title: TITLE, grade: 'premium', views: 932, tag: null, review: null, wide: true },
  { img: 'thumb-resignation-pledge.png',    title: TITLE, grade: 'premium', views: 932, tag: null, review: null, wide: true },
  { img: 'thumb-annual-leave.png',          title: TITLE, grade: 'premium', views: 932, tag: null, review: null, wide: true },
  { img: 'thumb-production-log.png',        title: TITLE, grade: 'premium', views: 932, tag: null, review: null, wide: true },
  { img: 'thumb-transaction-statement.png', title: TITLE, grade: 'premium', views: 932, tag: null, review: null, wide: true },
  { img: 'thumb-payroll.png',               title: TITLE, grade: 'premium', views: 932, tag: null, review: null, wide: true },
];

/* 시안 01의 패키지 카드 데이터(PACKAGE_CARDS)·아이콘 목록은 시안 06에서 안 써서 뺌 — 프롬프트 데이터는 ../assets/js/prompt-data.js */

const GRADE_LABEL = { premium: '프리미엄', member: '유료', free: '무료' };

const TAG_ICON = {
  'ai': '../assets/icons/ic-ai.svg',
  'update': '../assets/icons/ic-update-white.svg',
  'update-light': '../assets/icons/ic-update-blue.svg',
};

/* ---------- DOM helpers ---------- */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function createTag({ type, label }) {
  const tag = el('span', `tag tag--${type}`);
  const iconWrap = el('span', 'tag__icon');
  const icon = el('img');
  icon.src = TAG_ICON[type];
  icon.alt = '';
  iconWrap.appendChild(icon);
  tag.append(iconWrap, el('span', 'tag__label', label));
  return tag;
}

function createGrade(grade) {
  return el('span', `grade grade--${grade}`, GRADE_LABEL[grade]);
}

function createReview({ count, isNew }) {
  const review = el('span', isNew ? 'review' : 'review review--plain');
  if (isNew) review.appendChild(el('span', 'review__new', 'N'));
  const text = el('span', 'review__text');
  text.append(el('span', null, '후기'), el('span', null, count));
  review.appendChild(text);
  return review;
}

/* ---------- 카드 렌더링 ---------- */
/* 썸네일 카드는 5줄만 보여줌 — 한 줄 최대 8개 × 5줄 = 40장을 만들고,
   화면 폭에 따라 한 줄 개수가 줄면 넘치는 카드는 css(.card-grid nth-child)에서 숨김
   CARDS가 40장보다 적으면 처음부터 반복해서 채움 (시안용 샘플) */
const THUMB_CARD_COUNT = 40;

function renderCards() {
  const grid = document.getElementById('card-grid');
  const tpl = document.getElementById('card-template');
  const frag = document.createDocumentFragment();

  Array.from({ length: THUMB_CARD_COUNT }, (_, i) => CARDS[i % CARDS.length]).forEach((data) => {
    const card = tpl.content.firstElementChild.cloneNode(true);
    if (data.wide) card.classList.add('card--wide');

    const thumb = card.querySelector('.card__thumb img');
    thumb.src = IMG + data.img;
    thumb.alt = data.title;

    if (data.tag) card.querySelector('.card__img-area').appendChild(createTag(data.tag));

    card.querySelector('.card__title').textContent = data.title;
    card.querySelector('.card__link').title = data.title;

    const badges = card.querySelector('.card__badges');
    badges.appendChild(createGrade(data.grade));
    if (data.review) badges.appendChild(createReview(data.review));

    card.querySelector('.card__views-count').textContent = data.views.toLocaleString('ko-KR');

    frag.appendChild(card);
  });

  grid.appendChild(frag);
}

/* ---------- 배열 섞기 (Fisher–Yates) ---------- */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* 카드에 관심분야 색 넣기 (tokens.css --field-*)
   --card-bg 띠 배경 = 시안 05에서 밝기·채도를 맞춘 연한 색(tokens.css --pick-tint-*)
   --card-main 관심분야 글자 · 라인01 위 4px · 라인02 아래 2px 선 = 시안 05 칩에서 대비를 교정한 메인 색(tokens.css --pick-chip-* · 2026-10-12)
   예전 색으로 되돌리려면 --pick-tint- 를 --field-${key}-bg 로, --pick-chip- 를 --field-${key}-text 로 */
function setFieldColors(node, key) {
  node.dataset.tone = key;
  node.style.setProperty('--card-bg', `var(--pick-tint-${key})`);
  node.style.setProperty('--card-main', `var(--pick-chip-${key})`);
}

/* ---------- 시안 06(전환 바 "시안04") 라인 카드 — 테스트2 Figma 프레임 "라인01" · "라인02" ----------
   라인01 = 71:1418 — 모서리 8 · 띠 36(위 테두리 4px 분야 메인 색) · 높이 170
   라인02 = 71:1454 — 띠 30(아래 선 2px 분야 메인 색) · 높이 164 (Figma 띠 40 · 높이 174에서 띠만 줄임)
   (처음엔 71:1342 · 71:1369 칩 카드 → 라인01 · 02 → 2026-10-12 Figma 수정본에 맞춰 띠 높이를 줄임 · 라인03은 넣었다가 뺌)
   라인마다 1줄 8장 × 2줄 = 16장. 두 라인은 같은 카드 16장을 같은 순서로 넣어서 위아래로 비교하기 쉽게 함
   카드는 새로고침할 때마다 랜덤
   · 줄마다 9개 분야 중 랜덤 8개를 뽑아서 섞음 (한 줄 안에 같은 분야 없음)
   · 분야마다 FIELD_PROMPTS에서 아직 안 쓴 프롬프트를 1개씩 → 16장 안에서 같은 카드 없음
   이름표·순서는 LINE_ROWS에서 바꾸면 됨 */
const LINE_ROWS = [
  { variant: '01', label: '라인01' },
  { variant: '02', label: '라인02' },
  // 라인03(71:1477 · 띠 안에 관심분야 칩 + 업종)은 2026-10-12에 뺌 — css .line-card--03 도 지움
];
const LINE_ROW_COUNT = 2;   // 라인 하나에 들어가는 줄 수
const LINE_PER_ROW = 8;     // 한 줄 카드 수

function pickLineCards() {
  const keys = Object.keys(FIELD_META);
  // 분야별로 프롬프트를 미리 섞어 두고 뒤에서부터 하나씩 꺼내 씀
  const pool = {};
  keys.forEach((k) => { pool[k] = shuffle([...FIELD_PROMPTS[k]]); });

  const picks = [];
  for (let r = 0; r < LINE_ROW_COUNT; r += 1) {
    shuffle(keys.filter((k) => pool[k].length)).slice(0, LINE_PER_ROW)
      .forEach((key) => picks.push({ key, item: pool[key].pop() }));
  }
  return picks;
}

function createLineCard(tpl, variant, { key, item }) {
  const card = tpl.content.firstElementChild.cloneNode(true);
  card.classList.add(`line-card--${variant}`);
  setFieldColors(card, key);

  card.querySelector('.line-card__field').textContent = FIELD_META[key].name;
  const link = card.querySelector('.line-card__link');
  link.textContent = item.title;
  link.title = item.title;
  link.href = '#';
  card.querySelector('.line-card__desc').textContent = item.desc;
  card.querySelector('.line-card__industry').textContent = item.industry;
  return card;
}

function renderLineRows() {
  const wrap = document.getElementById('line-rows');
  const tpl = document.getElementById('line-card-template');
  const picks = pickLineCards();

  LINE_ROWS.forEach((row) => {
    const section = el('div', 'line-row');
    section.appendChild(el('p', 'line-row__label', row.label)); // 라인 이름표
    const grid = el('ul', 'line-grid');
    picks.forEach((pick) => grid.appendChild(createLineCard(tpl, row.variant, pick)));
    section.appendChild(grid);
    wrap.appendChild(section);
  });
}

/* ---------- 인터랙션 ---------- */
function bindSearchMode() {
  const buttons = document.querySelectorAll('.search__mode-btn');
  const form = document.querySelector('.search__form');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      // 'doc' | 'ai' — AI 모드 전용 UI는 Figma에 없어 상태값만 바꿔 둠
      form.dataset.mode = btn.dataset.mode;
    });
  });
}

function bindMenuTab() {
  const tabs = document.querySelectorAll('.menu-tab__item');
  const panels = document.querySelectorAll('.tab-panel');

  const showPanel = (tab) => {
    const target = tab.getAttribute('aria-controls');
    panels.forEach((panel) => { panel.hidden = panel.id !== target; });
    // 썸네일 패널은 탭 종류를 data 속성으로 남겨 둠 (탭별 데이터 연결용)
    document.getElementById('panel-thumb').dataset.tab = tab.dataset.tab;
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      showPanel(tab);
    });
  });

  const active = document.querySelector('.menu-tab__item.is-active');
  if (active) showPanel(active);
}

function bindFavorite() {
  document.querySelector('.contents').addEventListener('click', (e) => {
    const btn = e.target.closest('.card__fav');
    if (!btn) return;
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? '찜 해제' : '찜하기');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderLineRows();
  renderCards();
  bindSearchMode();
  bindMenuTab();
  bindFavorite();
});
