/* =========================================================
   예스폼 메인 — 카드 렌더링 + 인터랙션
   시안 01-1 스크립트 — 시안 01(../js/main.js)을 복사해서 패키지 카드만 바꿈 (디자인가이드 Figma 6124:1055)
   · AI로 초안 생성하기 탭 (처음 열리는 탭) → PACKAGE_CARDS (패키지 카드, 1920 1줄 7개 / 2560 1줄 8개 × 4줄)
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

/**
 * 패키지 카드 (테스트2 Figma 16:241) — 프롬프트 탭
 * no      : 원본 데이터 번호
 * industry: 업종 → 첫 번째 칩
 * field   : 업무분야 → 두 번째 칩 + 아이콘 (FIELD_ICON)
 * keywords: 키워드 2개 → 업종 칩 뒤에 붙는 칩 (시안 01-1 카드 · Figma 6124:1773) — 지금은 화면에서 뺌(PACKAGE_SHOW_KEYWORDS = false)
 * title / desc : 제목 1줄, 설명 2줄 (넘치면 말줄임)
 */
/* 업무분야 아이콘 — 예스폼 에디터 Figma 5490:40913 (업무분야 9종)
   업무분야 이름의 첫 단어(· 앞, 공백 제거)로 찾음 → '총무·경영지원·일반사무'와 '총무 · 경영 · 일반사무' 모두 '총무'로 연결 */
const FIELD_ICON = {
  '법무': '../assets/icons/cat-legal-24.svg',     // 법무·계약·지식재산
  '영업': '../assets/icons/cat-sales.svg',        // 영업·마케팅·사업기획
  '공공행정': '../assets/icons/cat-public.svg',   // 공공행정·생활·서비스
  '생산': '../assets/icons/cat-scm.svg',          // 생산·구매·자재·SCM 관리
  'HR관리': '../assets/icons/cat-hr.svg',         // HR관리·채용
  '총무': '../assets/icons/cat-admin.svg',        // 총무·경영지원·일반사무
  '회계': '../assets/icons/cat-accounting.svg',   // 회계·경리·재무 실무
  'AI': '../assets/icons/cat-ai-it.svg',          // AI·IT
  '현장': '../assets/icons/cat-site.svg',         // 현장·공사·부동산 관리
};
const FIELD_ICON_DEFAULT = '../assets/icons/cat-legal-24.svg';
const fieldKey = (field) => field.replace(/\s/g, '').split('·')[0];
const iconForField = (field) => FIELD_ICON[fieldKey(field)] || FIELD_ICON_DEFAULT;

/* 업무분야 라인 아이콘 36×36 — 디자인가이드 Figma 6098:10993 (임시 업데이트)
   피그마 프레임 이름으로 확인한 5종만 있음. 없는 업무분야(영업·공공행정·생산·회계)는 기존 아이콘을 그대로 씀 */
const FIELD_LINE_ICON = {
  '법무': '../assets/icons/line-legal.svg',   // 관심분야_법무계약지식재산
  '총무': '../assets/icons/line-admin.svg',   // 관심분야_총무경영일반사무
  'AI': '../assets/icons/line-ai-it.svg',     // 관심분야_ai_it
  'HR관리': '../assets/icons/line-hr.svg',    // 관심분야_hr관리_채용
  '현장': '../assets/icons/line-site.svg',    // 관심분야_현장_공사_부동산관리
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

/* 패키지 카드 데이터 — 업종 14종 × 2장 = 28장 (관심분야 9종이 3~4장씩 들어감)
   업종·관심분야는 통계표(관심 분야별 / 업종별) 이름 그대로. 프롬프트(제목·설명)와 키워드는 그 업종 + 관심분야에 맞춰 씀
   - industry : 업종 → 첫 번째 칩 (1번 자리 고정)
   - field    : 관심분야(업무분야) → 카드 위 줄 이름 + 카드 색
   - keywords : 키워드 2개 → 업종 칩 뒤 칩 2개. 제목·업종·관심분야에 이미 나온 말은 다시 쓰지 않음(단어 중복 X) — 문서의 쓰임·상황·대상을 보여 주는 말로.
                카드 폭이 좁으면 뒤 칩부터 숨겨지니 짧은 키워드를 앞에 둠 */
const PACKAGE_CARDS = [
  // 건설·부동산·시공
  { no: null, industry: '건설·부동산·시공', field: '현장·공사·부동산 관리', title: '공사 작업일보', desc: '현장 인력·장비 투입과 공정 진행률을 매일 기록할 공사 작업일보 만들어 주세요', keywords: ['공정률', '인력 투입'] },
  { no: null, industry: '건설·부동산·시공', field: '회계·경리·재무 실무', title: '기성금 청구서', desc: '공정 진행률에 맞춰 발주처에 공사대금을 청구할 기성금 청구서 작성해 주세요', keywords: ['공사대금', '발주처 정산'] },
  // 유통·무역·소매
  { no: null, industry: '유통·무역·소매', field: '생산·구매·자재·SCM 관리', title: '상품 발주서', desc: '거래처에 상품을 주문할 때 쓸 품목·수량·납기가 들어간 발주서 만들어 주세요', keywords: ['납기 일정', '거래처 주문'] },
  { no: null, industry: '유통·무역·소매', field: '영업·마케팅·사업기획', title: '매장 프로모션 기획안', desc: '신상품 출시에 맞춰 매장 할인 행사를 진행할 프로모션 기획안 작성해 주세요', keywords: ['할인 행사', '신상품 출시'] },
  // 제조·화학·에너지
  { no: null, industry: '제조·화학·에너지', field: '생산·구매·자재·SCM 관리', title: '생산 일보', desc: '라인별 생산량과 불량 수량을 매일 기록할 생산 일보 만들어 주세요', keywords: ['불량률', '라인 실적'] },
  { no: null, industry: '제조·화학·에너지', field: '법무·계약·지식재산', title: '기술 비밀유지 계약서', desc: '협력사와 공정 기술을 공유하기 전에 맺을 비밀유지 계약서(NDA) 작성해 주세요', keywords: ['NDA', '협력사'] },
  // 법률·회계·노무
  { no: null, industry: '법률·회계·노무', field: '법무·계약·지식재산', title: '내용증명', desc: '계약 위반 사실과 이행 요구 사항을 정리해 상대방에게 보낼 내용증명 만들어 주세요', keywords: ['분쟁 예방', '채무 불이행'] },
  { no: null, industry: '법률·회계·노무', field: 'HR 관리·채용', title: '표준 근로계약서', desc: '근로기준법에 맞춰 임금·근로시간·휴일을 담은 표준 근로계약서 작성해 주세요', keywords: ['임금·휴일', '입사 서류'] },
  // 교육·학교·학원
  { no: null, industry: '교육·학교·학원', field: 'HR 관리·채용', title: '강사 채용 공고문', desc: '학원 신규 강사를 모집할 자격 요건·근무 조건이 담긴 채용 공고문 만들어 주세요', keywords: ['신규 모집', '자격 요건'] },
  { no: null, industry: '교육·학교·학원', field: '회계·경리·재무 실무', title: '수강료 납부 확인서', desc: '학부모에게 발급할 수강 기간·납부 금액이 들어간 수강료 납부 확인서 만들어 주세요', keywords: ['학부모 발급', '연말정산 증빙'] },
  // 광고·홍보·미디어
  { no: null, industry: '광고·홍보·미디어', field: '영업·마케팅·사업기획', title: '캠페인 성과 보고서', desc: '매체별 노출·클릭·전환 성과를 정리할 광고 캠페인 성과 보고서 작성해 주세요', keywords: ['전환율', '매체 분석'] },
  { no: null, industry: '광고·홍보·미디어', field: '법무·계약·지식재산', title: '저작물 이용 허락서', desc: '영상·이미지 소스를 광고에 쓰기 위해 받을 저작물 이용 허락서 만들어 주세요', keywords: ['라이선스', '영상 소스'] },
  // 건설·시공
  { no: null, industry: '건설·시공', field: '현장·공사·부동산 관리', title: '현장 안전점검표', desc: '작업 시작 전 안전장비와 위험 요소를 확인할 공사 현장 안전점검표 만들어 주세요', keywords: ['보호구', '중대재해 예방'] },
  { no: null, industry: '건설·시공', field: '생산·구매·자재·SCM 관리', title: '자재 입출고 관리대장', desc: '현장 자재의 입고·출고·재고 수량을 관리할 자재 입출고 관리대장 만들어 주세요', keywords: ['재고 수량', '현장 반입'] },
  // IT·SW·정보통신
  { no: null, industry: 'IT·SW·정보통신', field: 'AI·IT', title: '시스템 장애 보고서', desc: '서버 장애 원인과 조치 내용, 재발 방지 대책을 정리할 장애 보고서 작성해 주세요', keywords: ['서버 다운', '재발 방지'] },
  { no: null, industry: 'IT·SW·정보통신', field: '영업·마케팅·사업기획', title: '솔루션 도입 제안서', desc: '고객사에 도입 효과와 요금제를 설명할 SaaS 솔루션 도입 제안서 만들어 주세요', keywords: ['요금제', 'SaaS'] },
  // 공공·행정·비영리
  { no: null, industry: '공공·행정·비영리', field: '공공행정·생활·서비스', title: '보조금 사업 신청서', desc: '지자체 지원 사업에 낼 사업 목적·예산 계획이 담긴 보조금 사업 신청서 작성해 주세요', keywords: ['예산 계획', '지자체 공모'] },
  { no: null, industry: '공공·행정·비영리', field: '총무·경영지원·일반사무', title: '자원봉사 활동 확인서', desc: '봉사자에게 발급할 활동 기간·시간·내용이 담긴 자원봉사 활동 확인서 만들어 주세요', keywords: ['증빙 서류', '시간 인정'] },
  // 의료·바이오·헬스케어
  { no: null, industry: '의료·바이오·헬스케어', field: 'AI·IT', title: '의료 데이터 활용 동의서', desc: '진료 데이터를 AI 분석에 쓰기 위한 환자 개인정보 수집·활용 동의서 작성해 주세요', keywords: ['개인정보', '진료 기록'] },
  { no: null, industry: '의료·바이오·헬스케어', field: '총무·경영지원·일반사무', title: '의료 소모품 관리대장', desc: '진료실 소모품의 입고·사용·재고 수량을 기록할 의료 소모품 관리대장 만들어 주세요', keywords: ['재고 파악', '진료실 비품'] },
  // 생활·여가
  { no: null, industry: '생활·여가', field: '공공행정·생활·서비스', title: '시설 대관 신청서', desc: '체육관·강당 같은 공용 시설을 빌릴 때 쓰는 시설 대관 신청서 만들어 주세요', keywords: ['체육관', '예약 접수'] },
  { no: null, industry: '생활·여가', field: 'HR 관리·채용', title: '아르바이트 근무표', desc: '카페·매장 아르바이트생의 주간 근무 시간을 정리할 근무 스케줄표 만들어 주세요', keywords: ['시급 계산', '주간 스케줄'] },
  // 금융·보험·증권
  { no: null, industry: '금융·보험·증권', field: '회계·경리·재무 실무', title: '월별 손익 보고서', desc: '지점별 수익과 비용을 비교해 한 달 손익을 정리할 월별 손익 보고서 작성해 주세요', keywords: ['월 결산', '지점 실적'] },
  { no: null, industry: '금융·보험·증권', field: 'AI·IT', title: '보안 점검 보고서', desc: '전산 시스템 취약점 점검 결과와 조치 계획을 정리할 보안 점검 보고서 작성해 주세요', keywords: ['취약점', '전산 시스템'] },
  // 문화·예술·종교
  { no: null, industry: '문화·예술·종교', field: '총무·경영지원·일반사무', title: '행사 운영 계획서', desc: '공연·전시 행사의 일정·인력·예산을 한눈에 정리할 행사 운영 계획서 작성해 주세요', keywords: ['공연·전시', '예산 배분'] },
  { no: null, industry: '문화·예술·종교', field: '법무·계약·지식재산', title: '공연 출연 계약서', desc: '출연자와 출연료·리허설 일정·초상권 사용을 정할 공연 출연 계약서 만들어 주세요', keywords: ['초상권', '리허설 일정'] },
  // 부동산·중개·임대
  { no: null, industry: '부동산·중개·임대', field: '현장·공사·부동산 관리', title: '상가 임대차 계약서', desc: '임대인·임차인 정보와 보증금·월세·관리비를 담은 상가 임대차 계약서 만들어 주세요', keywords: ['월세', '보증금'] },
  { no: null, industry: '부동산·중개·임대', field: '공공행정·생활·서비스', title: '부동산 거래 신고서', desc: '매매 계약 후 관할 관청에 제출할 부동산 거래 신고서 작성해 주세요', keywords: ['관할 관청', '매매 계약'] },
].map((c) => ({ ...c, icon: iconForField(c.field), href: '#' }));

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

/* 4번째 줄까지 꽉 채우는 카드 수 — 카드 31 + 광고 1 = 32 = 8열 × 4줄 (1920처럼 7열일 때는 28칸만 보이고 나머지는 css에서 숨김)
   카드가 31장보다 적으면(지금 28장) 랜덤으로 섞은 묶음을 이어 붙여서 채움 — 같은 제목이 바로 옆에 붙지 않게 */
const PACKAGE_CARD_SLOTS = 31;

/* 라인 아이콘이 있는 업무분야(FIELD_LINE_ICON 5종) 카드만 보여주기 — true: 5종만 · false: 전체 카드
   시안 01-1은 업무분야별 색이 9종 모두 있어서 전체 카드를 보여 줌 */
const PACKAGE_LINE_ICON_ONLY = false;

/* 키워드 칩 보이기 — 지금은 꺼 둠(false): 칩은 업종 1개만 나옴
   키워드 데이터(PACKAGE_CARDS의 keywords)는 그대로 남겨 둠 → true로 바꾸면 업종 뒤에 키워드 2개가 다시 붙음 */
const PACKAGE_SHOW_KEYWORDS = false;


/* 패키지 탭 광고 카드 — 1번째 줄 맨 오른쪽에 고정 */
const PACKAGE_AD = {
  img: '../assets/images/ad-hwp-docx.jpg',
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

  // 카드 묶음 — PACKAGE_LINE_ICON_ONLY = false라서 업무분야 9종 전체 카드 (true면 라인 아이콘 5종 분야만)
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
    if (data.no != null) card.dataset.no = data.no;

    // 카드 색: 배경 = 업무분야 연한 색(--field-*-bg) · 업무분야 이름 = 가장 진한 색(--field-*-dark) (Figma 6124:1055 회계 카드와 같은 규칙)
    const tone = toneForField(data.field);
    card.dataset.tone = tone;
    card.style.setProperty('--card-bg', `var(--field-${tone}-bg)`);
    card.style.setProperty('--card-ink', `var(--field-${tone}-dark)`);

    // 위 줄: 업무분야 이름 (Figma 6124:1773 — 아이콘·생성 버튼 없음)
    const fieldEl = card.querySelector('.package-card__field');
    fieldEl.textContent = data.field;
    fieldEl.title = data.field;

    // 흰 박스: 제목(카드 전체 링크) · 설명 · 칩(업종만 — PACKAGE_SHOW_KEYWORDS = true면 키워드 2개도)
    const link = card.querySelector('.package-card__link');
    link.textContent = data.title;
    link.href = data.href || '#';
    link.title = data.title;
    card.querySelector('.package-card__desc').textContent = data.desc;
    const chips = card.querySelector('.package-card__chips');
    const keywords = PACKAGE_SHOW_KEYWORDS ? (data.keywords || []).slice(0, 2) : [];
    [data.industry, ...keywords].forEach((text) => {
      const chip = el('span', 'package-chip', text);
      chip.title = text;
      chips.appendChild(chip);
    });

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
