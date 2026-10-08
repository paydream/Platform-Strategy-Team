/* =========================================================
   예스폼 메인 — 카드 렌더링 + 인터랙션
   시안 04 스크립트 — 시안 01(../v01/js/main.js)을 복사해서 프롬프트 탭 카드만 바꿈 (테스트2 Figma 52:1823)
   · AI로 문서 생성하기 탭 (처음 열리는 탭) → ../assets/js/prompt-data.js 의 데이터로 렌더링 (아이콘: ../assets/js/field-icon-set.js)
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

/* 시안 01의 패키지 카드 데이터(PACKAGE_CARDS)·아이콘 목록은 시안 04에서 안 써서 뺌 — 프롬프트 데이터는 ../assets/js/prompt-data.js */

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
   --card-bg 연한 배경 · --card-main 메인 색 · --card-light 연한 색(팔레트 2번째 열) · --card-line 라인 아이콘 색 */
function setFieldColors(node, key) {
  node.dataset.tone = key;
  node.style.setProperty('--card-bg', `var(--field-${key}-bg)`);
  node.style.setProperty('--card-main', `var(--field-${key}-text)`);
  node.style.setProperty('--card-light', `var(--field-${key}-light)`);
  node.style.setProperty('--card-line', FIELD_LINE_COLOR[key] || `var(--field-${key}-text)`);
}

/* ---------- 시안 04 관심분야 묶음 카드 (테스트2 Figma 52:1823) ----------
   PACKAGE_BUNDLES 순서대로 10장 (1920에서 1줄 5장 × 2줄)
   목록 1번째 줄 아이콘 = 분야 대표 아이콘(cat-*.svg) · 2~5번째 줄 = FIELD_LIST_ICONS[분야] 4개 */
function renderBundles() {
  const grid = document.getElementById('bundle-grid');
  const tpl = document.getElementById('bundle-card-template');
  const itemTpl = document.getElementById('bundle-item-template');
  const frag = document.createDocumentFragment();

  PACKAGE_BUNDLES.forEach((b) => {
    const meta = FIELD_META[b.field];
    const card = tpl.content.firstElementChild.cloneNode(true);
    setFieldColors(card, b.field);

    card.querySelector('.bundle-card__field').textContent = meta.name;
    card.querySelector('.bundle-card__title').append(b.head[0], document.createElement('br'), b.head[1]);
    card.querySelector('.bundle-card__industry').textContent = b.industry;
    // 오른쪽 큰 아이콘 — 회계는 Figma 52:409 그대로(선 굵기 4), 나머지 분야는 아이콘 시트의 라인 아이콘
    card.querySelector('.bundle-card__deco').innerHTML = b.field === 'accounting'
      ? svgWrap(ACC_HEADER_ICON, '0 0 67 67')
      : svgWrap(FIELD_LINE_ICONS[b.field]);

    const list = card.querySelector('.bundle-card__list');
    FIELD_PROMPTS[b.field].slice(b.from, b.from + 5).forEach((item, i) => {
      const li = itemTpl.content.firstElementChild.cloneNode(true);
      const icon = li.querySelector('.bundle-item__icon');
      if (i === 0) {
        const img = el('img');
        img.src = meta.icon; img.width = 24; img.height = 24; img.alt = '';
        icon.appendChild(img);
      } else {
        icon.innerHTML = svgWrap(FIELD_LIST_ICONS[b.field][i - 1]);
      }
      const link = li.querySelector('.bundle-item__link');
      link.textContent = item.title;
      link.title = `${item.title} — ${item.desc}`;
      link.href = '#';
      list.appendChild(li);
    });

    frag.appendChild(card);
  });
  grid.appendChild(frag);
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
  renderBundles();
  renderCards();
  bindSearchMode();
  bindMenuTab();
  bindFavorite();
});
