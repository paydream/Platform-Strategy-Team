/* =========================================================
   예스폼 메인 — 카드 렌더링 + 인터랙션
   시안 05 스크립트 — 시안 01(../시안01-1/js/main.js)을 복사해서 프롬프트 탭 카드만 바꿈 (테스트2 Figma 56:6065)
   · AI로 초안 생성하기 탭 (처음 열리는 탭) → ../assets/js/prompt-data.js 의 데이터로 렌더링 (아이콘: ../assets/js/field-icon-set.js)
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

/* 시안 01의 패키지 카드 데이터(PACKAGE_CARDS)·아이콘 목록은 시안 05에서 안 써서 뺌 — 프롬프트 데이터는 ../assets/js/prompt-data.js */

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

/* 카드에 관심분야 색 넣기
   --card-bg 카드 배경 = 교정한 연한 색(tokens.css --pick-tint-*) · --card-main 관심분야 칩 배경 = 메인 색(--field-*-text)
   --card-ink 가장 진한 색(--field-*-dark) — 지금은 안 씀 (바로 전 알약 칩 카드의 관심분야 글자색)
   --card-soft · --card-soft-ink 회색 배경 묶음 관심분야 칩 = 파스텔 배경 + 진한 글자 (tokens.css --pick-soft-* · 2026-10-12) */
function setFieldColors(node, key) {
  node.dataset.tone = key;
  node.style.setProperty('--card-bg', `var(--pick-tint-${key})`);
  node.style.setProperty('--card-main', `var(--field-${key}-text)`);
  node.style.setProperty('--card-ink', `var(--field-${key}-dark)`); // 가장 진한 색 (지금은 안 씀)
  node.style.setProperty('--card-chip', `var(--pick-chip-${key})`); // 관심분야 색 배경 묶음 칩 배경 — 흰 글자 대비 4.5:1 이상으로 교정한 색
  node.style.setProperty('--card-soft', `var(--pick-soft-${key})`); // 회색 배경 묶음 칩 배경 — 파스텔
  node.style.setProperty('--card-soft-ink', `var(--pick-soft-ink-${key})`); // 회색 배경 묶음 칩 글자 — 진한 색
}

/* ---------- 시안 05 프롬프트 카드 (카드 = 테스트2 Figma 71:1503) ----------
   섹션 제목·섹션 나눔은 지우고 카드만 카드 영역 전체에 1줄 7장
   배경 비교 2묶음 (PICK_BLOCKS): 관심분야 색 배경 3줄 + 회색 배경(gray-lt-01) 3줄
   두 묶음은 같은 카드 21장을 같은 순서로 넣어서 위아래로 비교하기 쉽게 함
   새로고침할 때마다 랜덤
   · 줄마다 9개 분야 중 랜덤 7개를 뽑아서 섞음 (한 줄 안에 같은 분야 없음)
   · 분야마다 FIELD_PROMPTS에서 아직 안 쓴 프롬프트를 1개씩 → 21장 안에서 같은 카드 없음
   카드 = 맨 위 관심분야 칩 · 제목 · 설명 · 맨 아래 업종
   · 관심분야 색 배경 묶음 = Figma 78:1539 (위 관심분야 색 칸에 분야 색 칩 · 제목 17px · 설명 / 아래 흰 칸에 업종 + 원형 이동 버튼)
   · 회색 배경 묶음 = Figma 71:1503 (분야 색 네모 칩 + 흰 글자 · 업종은 글자만) */
const PICK_BLOCKS = [
  { bg: 'field', label: '관심분야 색 배경', variant: 'pill' }, // 카드 = Figma 78:1539 (위 관심분야 색 칸 + 아래 흰 칸[업종 · 이동 버튼] · 높이 190)
  { bg: 'gray',  label: '회색 배경 (gray-lt-01 #f9fafb)' },     // 카드 = Figma 71:1503 (네모 칩 · 높이 189)
];
const PICK_ROW_COUNT = 3;   // 묶음 하나에 들어가는 줄 수
const PICK_PER_ROW = 7;     // 한 줄 카드 수

function pickCards() {
  const keys = Object.keys(FIELD_META);
  const pool = {};
  keys.forEach((k) => { pool[k] = shuffle([...FIELD_PROMPTS[k]]); });
  const picks = [];
  for (let r = 0; r < PICK_ROW_COUNT; r += 1) {
    shuffle(keys.filter((k) => pool[k].length)).slice(0, PICK_PER_ROW)
      .forEach((key) => picks.push({ key, item: pool[key].pop() }));
  }
  return picks;
}

function createPickCard(tpl, block, { key, item }) {
  const card = tpl.content.firstElementChild.cloneNode(true);
  setFieldColors(card, key);
  if (block.bg === 'gray') card.classList.add('pick-card--gray');
  if (block.variant) card.classList.add(`pick-card--${block.variant}`);
  const link = card.querySelector('.pick-card__link');
  link.textContent = item.title;
  link.title = item.title;
  link.href = '#';
  card.querySelector('.pick-card__desc').textContent = item.desc;
  card.querySelector('.pick-chip').textContent = FIELD_META[key].name; // 칩이 혼자 한 줄이라 전체 이름이 들어감
  const industry = card.querySelector('.pick-card__industry');
  industry.textContent = item.industry;
  industry.title = item.industry;
  return card;
}

function renderPickBlocks() {
  const wrap = document.getElementById('pick-blocks');
  const tpl = document.getElementById('pick-card-template');
  const picks = pickCards();

  PICK_BLOCKS.forEach((block) => {
    const section = el('div', 'pick-block');
    section.appendChild(el('p', 'pick-block__label', block.label)); // 묶음 이름표
    const grid = el('ul', 'pick-grid');
    picks.forEach((pick) => grid.appendChild(createPickCard(tpl, block, pick)));
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
  renderPickBlocks();
  renderCards();
  bindSearchMode();
  bindMenuTab();
  bindFavorite();
});
