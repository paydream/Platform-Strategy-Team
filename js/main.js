/* =========================================================
   예스폼 메인 — 카드 렌더링 + 인터랙션
   시안 01 스크립트 — 시안 02는 v02/js/main.js 에서 따로 수정
   · 프롬프트 탭 (처음 열리는 탭) → PACKAGE_CARDS (패키지 카드, 2560에서 1행 9개)
   · 예스폼 추천 콘텐츠 등 나머지 탭 → CARDS (썸네일 카드, 1920에서 1행 7개)
   · 예전 프롬프트 카드(카드01)는 _보관/카드01 로 옮김
   카드 내용은 두 배열만 고치면 됩니다.
   ========================================================= */

const TITLE = '해외 구매대행 매출관리 엑셀 프로그램(매매기준율 자동표시, 구매대행 소명자료 자동작성)';
const IMG = 'assets/images/';

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

/**
 * 패키지 카드 (테스트2 Figma 16:241) — 프롬프트 탭
 * no      : 원본 데이터 번호
 * industry: 업종 → 첫 번째 칩
 * field   : 업무분야 → 두 번째 칩 + 아이콘 (FIELD_ICON)
 * title / desc : 제목 1줄, 설명 2줄 (넘치면 말줄임)
 */
/* 업무분야 아이콘 — 예스폼 에디터 Figma 5490:40913 (업무분야 9종)
   업무분야 이름의 첫 단어(· 앞, 공백 제거)로 찾음 → '총무·경영지원·일반사무'와 '총무 · 경영 · 일반사무' 모두 '총무'로 연결 */
const FIELD_ICON = {
  '법무': 'assets/icons/cat-legal-24.svg',     // 법무·계약·지식재산
  '영업': 'assets/icons/cat-sales.svg',        // 영업·마케팅·사업기획
  '공공행정': 'assets/icons/cat-public.svg',   // 공공행정·생활·서비스
  '생산': 'assets/icons/cat-scm.svg',          // 생산·구매·자재·SCM 관리
  'HR관리': 'assets/icons/cat-hr.svg',         // HR관리·채용
  '총무': 'assets/icons/cat-admin.svg',        // 총무·경영지원·일반사무
  '회계': 'assets/icons/cat-accounting.svg',   // 회계·경리·재무 실무
  'AI': 'assets/icons/cat-ai-it.svg',          // AI·IT
  '현장': 'assets/icons/cat-site.svg',         // 현장·공사·부동산 관리
};
const FIELD_ICON_DEFAULT = 'assets/icons/cat-legal-24.svg';
const fieldKey = (field) => field.replace(/\s/g, '').split('·')[0];
const iconForField = (field) => FIELD_ICON[fieldKey(field)] || FIELD_ICON_DEFAULT;

/* 업무분야 라인 아이콘 36×36 — 디자인가이드 Figma 6098:10993 (임시 업데이트)
   피그마 프레임 이름으로 확인한 5종만 있음. 없는 업무분야(영업·공공행정·생산·회계)는 기존 아이콘을 그대로 씀 */
const FIELD_LINE_ICON = {
  '법무': 'assets/icons/line-legal.svg',   // 관심분야_법무계약지식재산
  '총무': 'assets/icons/line-admin.svg',   // 관심분야_총무경영일반사무
  'AI': 'assets/icons/line-ai-it.svg',     // 관심분야_ai_it
  'HR관리': 'assets/icons/line-hr.svg',    // 관심분야_hr관리_채용
  '현장': 'assets/icons/line-site.svg',    // 관심분야_현장_공사_부동산관리
};
const lineIconForField = (field) => FIELD_LINE_ICON[fieldKey(field)] || null;

/* 관심분야(업무분야) 칩 컬러 — 예스폼 에디터 Figma 5281:21380 컬러차트 9종
   업무분야 첫 단어로 찾음 → CSS .tone--* 클래스 */
const FIELD_TONE = {
  'HR관리': 'hr',
  '회계': 'accounting',
  '현장': 'site',
  '법무': 'legal',
  '총무': 'admin',
  'AI': 'ai',
  '생산': 'scm',
  '공공행정': 'public',
  '영업': 'sales',
};
const toneForField = (field) => FIELD_TONE[fieldKey(field)] || 'hr';
/* 업무분야 칩 컬러 켜기/끄기 — 지금은 꺼 둠(false): 업무분야 칩도 업종 칩과 같은 회색.
   색 정보는 그대로 보관 — 칩에 data-tone 값으로 남기고, CSS .tone--* 와 tokens.css --field-* 도 그대로 둠.
   true로 바꾸면 tone--* 클래스가 다시 붙어서 컬러 칩으로 돌아감 */
const FIELD_CHIP_COLOR = false;

const PACKAGE_CARDS = [
  { no: 1,   industry: '건설·시공',     field: '공공행정·생활·서비스',   title: '착공 신고서',       desc: '착공 신고서를 만들어주세요. 신청자 정보, 신청 사유, 첨부 서류, 신청 일자 항목을 포함해주세요.' },
  { no: 2,   industry: '건설·시공',     field: '공공행정·생활·서비스',   title: '공사대금 지급확인서', desc: '시공 현장에서 행정 처리에 사용할 공사대금 지급확인서 양식을 만들어 주세요. 지급자·수취자, 지급 금액, 지급 일자, 사유를 빠짐없이 넣어주세요.' },
  { no: 130, industry: '건설·시공',     field: '회계·경리·재무 실무',    title: '공사 원가 계산서',   desc: '프로젝트의 투명한 예산 관리를 위한 공사 원가 계산서 만들어 주세요' },
  { no: 131, industry: '건설·시공',     field: '회계·경리·재무 실무',    title: '지출 결의서',       desc: '현장 비용 사용 승인을 받기 위한 지출 결의서 생성해 주세요' },
  { no: 181, industry: '유통·무역·소매', field: '공공행정·생활·서비스',   title: '위임장(대리인)',     desc: '위임장(대리인) 표준 양식을 제작해 주세요. B2B 거래에 실무에서 자주 쓰는 위임인·수임인 정보, 위임 사항, 위임 기간, 인감 확인란을 반영해주세요.' },
  { no: 187, industry: '유통·무역·소매', field: '공공행정·생활·서비스',   title: '통관 신고서',       desc: '해외 수입 물품 반입 시 세관에 제출할 통관 신고서 작성해 주세요' },
  { no: 188, industry: '유통·무역·소매', field: '공공행정·생활·서비스',   title: '수입신고 위임장',    desc: '관세사에게 수입 업무를 맡길 때 사용할 수입신고 위임장 만들어 주세요' },
  { no: 235, industry: '유통·무역·소매', field: '총무·경영지원·일반사무', title: '사무용품 관리대장',   desc: '부서 내 소모품 재고 현황을 실시간으로 추적할 사무용품 관리대장 제작해 주세요' },
  { no: 236, industry: '유통·무역·소매', field: '총무·경영지원·일반사무', title: '경조사 지원 신청서',  desc: '사내 임직원 복리후생 지급을 위한 경조사 지원 신청서 기안해 주세요' },
  { no: 237, industry: '유통·무역·소매', field: '현장·공사·부동산 관리',  title: '상가 월세 계약서',    desc: '상가 월세 계약서를 만들어주세요. 임대인·임차인 정보, 보증금, 월세, 임대 기간, 관리비, 특약사항 항목을 포함해주세요.' },
  // ---- 2차 추가 (번호 없는 항목은 no: null) ----
  { no: null, industry: '유통·무역·소매',   field: 'HR 관리·채용',           title: '연차 사용 신청서',     desc: '직원의 원활한 휴가 처리를 위한 연차 사용 신청서 제작해 주세요' },
  { no: null, industry: '유통·무역·소매',   field: 'HR 관리·채용',           title: '판매직 교육 일지',     desc: '신규 직원 대상 서비스 응대 교육 내역을 기록할 판매직 교육 일지 기안해 주세요' },
  { no: 359,  industry: '광고·홍보·미디어', field: '공공행정·생활·서비스',   title: '프리랜서 용역계약서',  desc: '기본 양식을 갖춘 프리랜서 용역계약서 작성해 주세요' },
  { no: 360,  industry: '광고·홍보·미디어', field: '공공행정·생활·서비스',   title: '위임장(대리인)',       desc: '실무에 바로 쓰는 위임장(대리인) 만들어주세요' },
  { no: 449,  industry: '광고·홍보·미디어', field: 'AI·IT',                  title: 'IT 자산 관리대장',     desc: '편집용 PC 등 고가 장비를 추적할 IT 자산 관리대장 만들어 주세요' },
  { no: 450,  industry: '광고·홍보·미디어', field: 'AI·IT',                  title: '시스템 장애 보고서',   desc: '서버 다운 시 원인과 대책을 정리할 시스템 장애 보고서 생성해 주세요' },
  { no: 560,  industry: '교육·학교·학원',   field: '생산·구매·자재·SCM 관리', title: '교구 사양서',          desc: '제출용으로 활용할 교구 사양서 제작해 주세요' },
  { no: 561,  industry: '교육·학교·학원',   field: '생산·구매·자재·SCM 관리', title: '교재 제작 발주서',     desc: '인쇄소에 새 학기 교재를 요청할 교재 제작 발주서 작성해 주세요' },
  { no: null, industry: '교육·학교·학원',   field: 'HR 관리·채용',           title: '시간강사 위촉 계약서', desc: '파트타임 강사의 근무 조건과 시급을 정할 시간강사 위촉 계약서 제작해 주세요' },
  { no: null, industry: '교육·학교·학원',   field: 'HR 관리·채용',           title: '경력 증명서',          desc: '퇴사한 강사의 재직 이력을 증빙해 줄 경력 증명서 기안해 주세요' },
].map((c) => ({ ...c, icon: iconForField(c.field), href: '#' }));

const GRADE_LABEL = { premium: '프리미엄', member: '유료', free: '무료' };

const TAG_ICON = {
  'ai': 'assets/icons/ic-ai.svg',
  'update': 'assets/icons/ic-update-white.svg',
  'update-light': 'assets/icons/ic-update-blue.svg',
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

/* 4번째 줄까지 꽉 채우는 카드 수 — 카드 31 + 광고 1 = 32 = 8열 × 4줄 (7열일 때는 28칸만 보이고 나머지는 css에서 숨김)
   카드가 31장보다 적으면 랜덤으로 섞은 묶음을 이어 붙여서 채움 */
const PACKAGE_CARD_SLOTS = 31;

/* 라인 아이콘이 있는 업무분야(FIELD_LINE_ICON 5종) 카드만 보여주기 — true: 5종만 · false: 전체 카드 */
const PACKAGE_LINE_ICON_ONLY = true;

/* 패키지 탭 광고 카드 — 1번째 줄 맨 오른쪽에 고정 */
const PACKAGE_AD = {
  img: 'assets/images/ad-hwp-docx.jpg',
  alt: 'HWP·DOCX 문서를 웹에서 열고, AI로 편집하세요',
  href: '#',
};

/* ---------- 배열 섞기 (Fisher–Yates) ---------- */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ---------- 패키지 카드 렌더링 ---------- */
function renderPackageCards() {
  const grid = document.getElementById('package-grid');
  const tpl = document.getElementById('package-card-template');
  const frag = document.createDocumentFragment();

  // 라인 아이콘이 있는 5개 업무분야 카드만 (영업·공공행정·생산·회계 등 기존 아이콘 카드는 뺌)
  const pool = PACKAGE_LINE_ICON_ONLY ? PACKAGE_CARDS.filter((c) => lineIconForField(c.field)) : [...PACKAGE_CARDS];
  // 새로고침할 때마다 랜덤 — 섞은 묶음을 이어 붙여 칸을 채우고, 같은 제목이 바로 옆에 붙지 않게 함
  const list = [];
  while (pool.length && list.length < PACKAGE_CARD_SLOTS) {
    let round = shuffle([...pool]);
    for (let t = 0; t < 30 && round.some((c, k) => c.title === (k ? round[k - 1] : list[list.length - 1] || {}).title); t += 1) round = shuffle([...pool]);
    list.push(...round);
  }
  list.length = Math.min(list.length, PACKAGE_CARD_SLOTS);
  list.forEach((data) => {
    const card = tpl.content.firstElementChild.cloneNode(true);
    // 아이콘: 라인 아이콘(36)이 있으면 그것, 없으면 기존 아이콘(24)을 36 칸 가운데에
    const lineIcon = lineIconForField(data.field);
    const iconImg = card.querySelector('.package-card__icon img');
    iconImg.src = lineIcon || data.icon;
    if (!lineIcon) card.querySelector('.package-card__icon').classList.add('is-fallback');
    if (data.no != null) card.dataset.no = data.no;

    const title = card.querySelector('.package-card__title');
    title.textContent = data.title;
    title.title = data.title;
    card.querySelector('.package-card__desc').textContent = data.desc;

    const chips = card.querySelector('.package-card__chips');
    chips.appendChild(el('span', 'package-chip', data.industry));                                    // 업종: 회색 칩
    const tone = toneForField(data.field);
    // 카드 윗부분 배경: 업무분야 연한 색(--field-*-bg) → 흰색 그라데이션 (Figma 6098:10993)
    card.style.setProperty('--card-tone', `var(--field-${tone}-bg)`);
    const fieldChip = el('span', FIELD_CHIP_COLOR ? `package-chip tone--${tone}` : 'package-chip', data.field); // 업무분야
    fieldChip.dataset.tone = tone; // 컬러 정보 보관 (FIELD_CHIP_COLOR = false면 클래스만 빼서 회색)
    chips.appendChild(fieldChip);

    card.querySelector('.package-card__cta').href = data.href || '#';

    frag.appendChild(card);
  });

  frag.appendChild(createPackageAd());
  grid.appendChild(frag);
}

/* ---------- 패키지 광고 카드 ---------- */
function createPackageAd() {
  const li = el('li', 'package-ad');
  const a = el('a', 'package-ad__link');
  a.href = PACKAGE_AD.href;
  const img = el('img');
  img.src = PACKAGE_AD.img;
  img.alt = PACKAGE_AD.alt;
  a.appendChild(img);
  li.appendChild(a);
  return li;
}

// 광고는 1번째 줄 맨 오른쪽 칸에 고정 (열 수가 바뀌면 다시 맞춤)
function placePackageAd() {
  const grid = document.getElementById('package-grid');
  const ad = grid.querySelector('.package-ad');
  if (!ad || !grid.offsetParent) return; // 탭이 숨겨져 있으면 열 수를 못 구함
  const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
  const others = [...grid.children].filter((c) => c !== ad);
  const target = Math.min(cols - 1, others.length);
  if (Array.prototype.indexOf.call(grid.children, ad) === target) return;
  grid.insertBefore(ad, others[target] || null);
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
    if (target === 'panel-package') placePackageAd();
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

// 창 크기가 바뀌어 열 수가 달라져도 광고는 1번째 줄 맨 오른쪽 유지 (카드 폭 최소 240 · 높이 225는 css)
new ResizeObserver(placePackageAd).observe(document.getElementById('package-grid'));

document.addEventListener('DOMContentLoaded', () => {
  renderPackageCards();
  renderCards();
  bindSearchMode();
  bindMenuTab();
  bindFavorite();
});
