/* =========================================================
   예스폼 에디터 — 프롬프트 화면
   · 추천 프롬프트: 카드 4장씩 4묶음 · 화살표 / 점으로 넘김
   · 탭(관심분야 · 시즈널 · MY): 고르면 파란 글자 + 아래 줄, 목록 제목이 바뀌고 카드를 다시 섞음
     — 관심분야 · MY 탭 = 업종 · 관심 분야 상자 / 시즈널 탭 = 관심 분야 · 월 상자(Figma 6796:49709)
   · 필터 버튼: 지금 탭의 상자를 접고 펴기
   · 업종 · 관심 분야 체크 / 검색: 아래 카드를 바로 걸러서 보여 줌 (아무것도 안 고르면 전체)
   · 시즈널 체크: 고른 항목이 칩으로 쌓이고 "적용하기(N건)"를 눌러야 걸러짐 · "초기화"는 모두 풂
     — 시즈널 탭 카드 아래 줄은 업종 대신 시즌(월) 이름
   · 관심분야 프롬프트 카드 = 01_예스폼/메인_검색화면/시안01-1(전환 바 "시안01") 카드 · 데이터 그대로
   ========================================================= */

/* ---------- 관심분야(업무분야) 색 — 이름 첫 단어로 찾음 (메인_검색화면 시안01-1과 같음) ---------- */
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
const fieldKey = (field) => field.replace(/\s/g, '').split('·')[0];
const toneForField = (field) => FIELD_TONE[fieldKey(field)] || 'hr';

/* ---------- 추천 프롬프트 — "2027 상반기 채용 준비" 주제 16장 (4장씩 4묶음)
   Figma는 같은 예시 카드(마케팅 회사소개서) 4장이라, 주제에 맞는 채용 준비 프롬프트로 채움 ---------- */
const RECO_CARDS = [
  { field: 'HR 관리·채용', title: '신입 채용 공고문', desc: '직무·자격 요건·근무 조건을 정리한 2027 상반기 신입 채용 공고문 작성해 주세요' },
  { field: 'HR 관리·채용', title: '직무기술서', desc: '모집 직무의 주요 업무·필요 역량·우대 사항을 담은 직무기술서 만들어 주세요' },
  { field: '총무·경영지원·일반사무', title: '채용 일정표', desc: '서류 접수부터 최종 합격 발표까지 단계별 채용 일정표 정리해 주세요' },
  { field: '공공행정·생활·서비스', title: '청년 채용 지원금 신청서', desc: '청년 일자리 지원 사업에 낼 채용 계획·지원 인원이 담긴 지원금 신청서 작성해 주세요' },
  { field: 'HR 관리·채용', title: '입사지원서 양식', desc: '인적 사항·학력·경력·자기소개 항목이 들어간 입사지원서 양식 만들어 주세요' },
  { field: 'HR 관리·채용', title: '면접 평가표', desc: '지원자 역량을 항목별 점수로 매길 수 있는 면접 평가표 만들어 주세요' },
  { field: '회계·경리·재무 실무', title: '채용 예산 계획서', desc: '채용 광고비·면접 진행비·인건비를 정리한 상반기 채용 예산 계획서 작성해 주세요' },
  { field: '영업·마케팅·사업기획', title: '채용 홍보 콘텐츠 기획안', desc: '회사 문화와 복지를 알릴 채용 홍보 SNS 콘텐츠 기획안 써 주세요' },
  { field: 'HR 관리·채용', title: '합격 안내 메일', desc: '최종 합격자에게 보낼 입사일·제출 서류 안내가 담긴 합격 안내 메일 써 주세요' },
  { field: 'HR 관리·채용', title: '불합격 안내문', desc: '지원자에게 정중하게 결과를 전할 불합격 안내문 작성해 주세요' },
  { field: 'HR 관리·채용', title: '레퍼런스 체크 질문지', desc: '경력 지원자의 전 직장 동료에게 물어볼 레퍼런스 체크 질문지 만들어 주세요' },
  { field: '법무·계약·지식재산', title: '표준 근로계약서', desc: '근로기준법에 맞춰 임금·근로시간·휴일을 담은 표준 근로계약서 작성해 주세요' },
  { field: '총무·경영지원·일반사무', title: '입사 서류 체크리스트', desc: '신입사원이 첫 출근 전에 낼 서류를 정리한 입사 서류 체크리스트 만들어 주세요' },
  { field: '법무·계약·지식재산', title: '입사 서약서', desc: '비밀 유지와 회사 규정 준수를 약속하는 입사 서약서 작성해 주세요' },
  { field: 'HR 관리·채용', title: '신입사원 온보딩 계획서', desc: '입사 첫 달 교육 일정과 멘토 배정을 담은 온보딩 계획서 작성해 주세요' },
  { field: 'HR 관리·채용', title: '수습 평가표', desc: '수습 기간 동안 업무 태도와 성과를 평가할 수습 평가표 만들어 주세요' },
];
const RECO_PER_PAGE = 4;

/* ---------- 업종 · 관심 분야 체크 항목 (Figma 6790:48989 이름 그대로 · "법부"는 "법무"로 고침) ---------- */
const INDUSTRY_OPTIONS = ['건설·시공', '교육·학원·학교', '금융·보험·증권', '공공·행정·비영리', '부동산·중개·임대', '광고·홍보·미디어', '생활·여가', '유통·무역·소매', '의료·바이오·헬스케어', '법률·회계·노무', '제조·화학·에너지', 'IT·SW·정보통신'];
const FIELD_OPTIONS = ['HR 관리·채용', '회계·경리·재무 실무', '현장·공사·부동산 관리', '법무·계약·지식재산', '공공행정·생활·서비스', '총무·경영지원·일반사무', 'AI·IT', '생산·구매·자재·SCM 관리', '영업·마케팅·사업기획'];

/* ---------- 시즈널 — 월 12개 (Figma 6796:49730 이름 그대로) ---------- */
const SEASONS = [
  '1월 새해 시작 및 연말정산 시즌', '2월 연말정산 마감 및 봄맞이 준비', '3월 정기 주주총회 및 봄철 행사',
  '4월 1분기 마감 및 사내 캠페인', '5월 가정의 달 및 종합소득세 신고', '6월 상반기 마감 및 여름 대비',
  '7월 하계 휴가 및 부가세 신고', '8월 휴가 및 하반기 채용 준비', '9월 추석 명절 및 가을 행사',
  '10월 3분기 마감 및 차년도 준비', '11월 내년도 예산 확정 및 겨울 대비', '12월 연말 결산 및 종무식',
];
/* 카드별 시즌(월) — Figma 카드에 적힌 것(생산 일보 1월 · 표준 근로계약서 2월 · 솔루션 도입 제안서 2월 · 상가 임대차 계약서 3월 · 시스템 장애 보고서 3월)은 그대로,
   나머지는 문서 쓰임에 맞는 달로 2~3장씩 나눔 — 고치려면 숫자(월)만 바꾸면 됨 */
const SEASON_OF = {
  '생산 일보': 1, '수강료 납부 확인서': 1,
  '표준 근로계약서': 2, '솔루션 도입 제안서': 2, '강사 채용 공고문': 2,
  '상가 임대차 계약서': 3, '시스템 장애 보고서': 3, '행사 운영 계획서': 3,
  '월별 손익 보고서': 4, '캠페인 성과 보고서': 4,
  '매장 프로모션 기획안': 5, '시설 대관 신청서': 5,
  '현장 안전점검표': 6, '보안 점검 보고서': 6,
  '아르바이트 근무표': 7, '상품 발주서': 7,
  '의료 데이터 활용 동의서': 8, '자원봉사 활동 확인서': 8,
  '보조금 사업 신청서': 9, '저작물 이용 허락서': 9,
  '기성금 청구서': 10, '기술 비밀유지 계약서': 10,
  '자재 입출고 관리대장': 11, '의료 소모품 관리대장': 11, '공사 작업일보': 11,
  '내용증명': 12, '부동산 거래 신고서': 12, '공연 출연 계약서': 12,
};
/* 시즈널 상자를 처음 열 때 체크해 둘 항목 (Figma 그대로: HR 관리·채용 · 회계·경리·재무 실무 · 2월) — 적용 전 상태라 카드는 전체 */
const SEASON_DEFAULT = { sfield: ['HR 관리·채용', '회계·경리·재무 실무'], month: [SEASONS[1]] };

/* ---------- 관심분야 프롬프트 카드 데이터 — 메인_검색화면 시안01-1/js/main.js 의 PACKAGE_CARDS 그대로 ---------- */
/* 업종 14종 × 2장 = 28장 (관심분야 9종이 3~4장씩) · keywords는 시안01-1처럼 화면에 안 씀 */
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
].map((c) => ({ ...c, season: SEASONS[(SEASON_OF[c.title] || 1) - 1], href: '#' }));

const PACKAGE_CARD_SLOTS = 32; // 7개 × 4줄 = 28칸 (2560은 8개 × 4줄 = 32칸) — 넘치는 카드는 CSS로 숨김
const TOTAL_COUNT_LABEL = '1,234'; // 아무것도 안 고르면 보여 주는 개수 (Figma 값)

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/* ---------- 배열 섞기 (Fisher–Yates) ---------- */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* =========================================================
   1. 추천 프롬프트 넘기기
   ========================================================= */
(function reco() {
  const track = document.getElementById('reco-track');
  const tpl = document.getElementById('reco-card-template');
  const prev = document.getElementById('reco-prev');
  const next = document.getElementById('reco-next');
  const dotsWrap = document.getElementById('reco-dots');
  const pages = Math.ceil(RECO_CARDS.length / RECO_PER_PAGE);
  let page = 0;

  RECO_CARDS.forEach((data) => {
    const card = tpl.content.firstElementChild.cloneNode(true);
    const tone = toneForField(data.field);
    card.dataset.tone = tone;
    card.style.setProperty('--badge-bg', `var(--field-${tone}-bg)`);
    card.style.setProperty('--badge-ink', `var(--field-${tone}-text)`);
    if (tone === 'public') { card.style.removeProperty('--badge-bg'); card.style.removeProperty('--badge-ink'); } // 공공행정은 Figma 색 그대로 (css)
    card.querySelector('.reco-card__badge').textContent = data.field;
    const link = card.querySelector('.reco-card__link');
    link.textContent = data.title;
    link.title = data.title;
    card.querySelector('.reco-card__desc').textContent = data.desc;
    track.appendChild(card);
  });

  const dots = [];
  for (let i = 0; i < pages; i += 1) {
    const dot = el('button', 'reco__dot');
    dot.type = 'button';
    dot.setAttribute('aria-label', `${i + 1}번째 추천 묶음 보기`);
    dot.addEventListener('click', () => go(i));
    dotsWrap.appendChild(dot);
    dots.push(dot);
  }

  function go(p) {
    page = Math.max(0, Math.min(pages - 1, p));
    const viewport = track.parentElement;
    track.style.transform = `translateX(${-page * (viewport.clientWidth + 24)}px)`; // 한 묶음 = 보이는 폭 + 카드 간격 24
    prev.disabled = page === 0;
    next.disabled = page === pages - 1;
    dots.forEach((d, i) => d.setAttribute('aria-current', String(i === page)));
    // 안 보이는 묶음 카드는 Tab으로 가지 않게
    [...track.children].forEach((card, i) => {
      const on = Math.floor(i / RECO_PER_PAGE) === page;
      card.querySelector('.reco-card__link').tabIndex = on ? 0 : -1;
    });
  }

  prev.addEventListener('click', () => go(page - 1));
  next.addEventListener('click', () => go(page + 1));
  window.addEventListener('resize', () => {
    track.style.transition = 'none'; // 화면 폭이 바뀌면 애니메이션 없이 자리만 맞춤
    go(page);
    requestAnimationFrame(() => { track.style.transition = ''; });
  });
  go(0);
})();

/* =========================================================
   2. 관심분야 프롬프트 카드 + 탭 · 필터 · 체크 · 검색 · 시즈널
   ========================================================= */
(function promptList() {
  const grid = document.getElementById('package-grid');
  const tpl = document.getElementById('package-card-template');
  const countEl = document.getElementById('list-count');
  const titleEl = document.getElementById('list-title');
  const emptyEl = document.getElementById('list-empty');
  const interestPanel = document.getElementById('interest-panel');
  const seasonPanel = document.getElementById('season-panel');
  const filterBtn = document.getElementById('filter-btn');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const chipsEl = document.getElementById('season-chips');
  const applyBtn = document.getElementById('season-apply');
  const resetBtn = document.getElementById('season-reset');

  let tab = 'interest';     // interest · season · my
  let panelOpen = true;     // 필터 상자 펼침 (탭을 바꿔도 그대로)
  let applied = { sfield: [], month: [] }; // 시즈널 — "적용하기"로 확정한 항목

  /* 체크 항목 만들기 */
  function buildOptions(group, names, preset = []) {
    const wrap = document.querySelector(`.interest__options[data-group="${group}"]`);
    names.forEach((name) => {
      const label = el('label', 'check');
      const input = el('input', 'check__input');
      input.type = 'checkbox';
      input.value = name;
      input.dataset.group = group;
      input.checked = preset.includes(name);
      label.append(input, el('span', 'check__box'), el('span', 'check__label', name));
      wrap.appendChild(label);
    });
  }
  buildOptions('industry', INDUSTRY_OPTIONS);
  buildOptions('field', FIELD_OPTIONS);
  buildOptions('sfield', FIELD_OPTIONS, SEASON_DEFAULT.sfield);
  buildOptions('month', SEASONS, SEASON_DEFAULT.month);

  /* 이름 맞추기 — "·"로 나눈 낱말 묶음이 한쪽에 다 들어 있으면 같은 것으로 봄
     (예: 체크 "건설·시공" ↔ 카드 "건설·부동산·시공", 체크 "교육·학원·학교" ↔ 카드 "교육·학교·학원") */
  const words = (str) => str.replace(/\s/g, '').split('·');
  const sameName = (a, b) => {
    const A = words(a); const B = words(b);
    return A.every((w) => B.includes(w)) || B.every((w) => A.includes(w));
  };
  const checked = (group) => [...document.querySelectorAll(`.check__input[data-group="${group}"]:checked`)].map((i) => i.value);
  const hasKeyword = (card, keyword) => !keyword || `${card.title} ${card.desc} ${card.industry} ${card.field} ${card.season}`.replace(/\s/g, '').includes(keyword.replace(/\s/g, ''));

  /* 관심분야 · MY 탭 — 업종 · 관심 분야 (같은 묶음 안은 "또는", 묶음끼리는 "그리고") */
  const matchInterest = (card, industries, fields) =>
    (!industries.length || industries.some((n) => sameName(n, card.industry))) &&
    (!fields.length || fields.some((n) => sameName(n, card.field)));
  /* 시즈널 탭 — 관심 분야 · 월 */
  const matchSeason = (card, sel) =>
    (!sel.sfield.length || sel.sfield.some((n) => sameName(n, card.field))) &&
    (!sel.month.length || sel.month.includes(card.season));
  const seasonCount = (sel) => PACKAGE_CARDS.filter((c) => matchSeason(c, sel)).length;

  function cardNode(data) {
    const card = tpl.content.firstElementChild.cloneNode(true);
    const tone = toneForField(data.field);
    card.dataset.tone = tone;
    card.style.setProperty('--card-bg', `var(--field-${tone}-bg)`);
    card.style.setProperty('--card-ink', `var(--field-${tone}-dark)`);
    const fieldEl = card.querySelector('.package-card__field');
    fieldEl.textContent = data.field;
    fieldEl.title = data.field;
    const link = card.querySelector('.package-card__link');
    link.textContent = data.title;
    link.href = data.href || '#';
    link.title = data.title;
    card.querySelector('.package-card__desc').textContent = data.desc;
    const label = tab === 'season' ? data.season : data.industry; // 시즈널 탭은 아래 줄에 시즌(월) 이름 (Figma 6796:49798)
    const chip = el('span', 'package-chip', label);
    chip.title = label;
    card.querySelector('.package-card__chips').appendChild(chip);
    return card;
  }

  function render() {
    const keyword = searchInput.value.trim();
    let filtered;
    let pool;
    if (tab === 'season') {
      filtered = applied.sfield.length || applied.month.length || keyword;
      pool = PACKAGE_CARDS.filter((c) => matchSeason(c, applied) && hasKeyword(c, keyword));
    } else {
      const industries = checked('industry');
      const fields = checked('field');
      filtered = industries.length || fields.length || keyword;
      pool = PACKAGE_CARDS.filter((c) => matchInterest(c, industries, fields) && hasKeyword(c, keyword));
    }

    let list;
    if (filtered) {
      list = shuffle([...pool]); // 걸러 낸 카드만 (같은 카드를 되풀이하지 않음)
    } else {
      // 전체 — 섞은 묶음을 이어 붙여 칸을 채우고, 같은 제목이 바로 옆에 붙지 않게 함 (시안01-1과 같은 방식)
      list = [];
      while (pool.length && list.length < PACKAGE_CARD_SLOTS) {
        let round = shuffle([...pool]);
        for (let t = 0; t < 30 && round.some((c, k) => c.title === (k ? round[k - 1] : list[list.length - 1] || {}).title); t += 1) round = shuffle([...pool]);
        list.push(...round);
      }
      list.length = Math.min(list.length, PACKAGE_CARD_SLOTS);
    }

    grid.replaceChildren(...list.map(cardNode));
    countEl.textContent = filtered ? pool.length.toLocaleString('ko-KR') : TOTAL_COUNT_LABEL;
    emptyEl.hidden = pool.length > 0;
  }

  /* 시즈널 — 고른 항목 칩 + 적용하기 건수 (체크할 때마다 바로 바뀜 · 카드는 "적용하기"를 눌러야 바뀜) */
  function updateSeasonBox() {
    const pending = { sfield: checked('sfield'), month: checked('month') };
    const picked = [
      ...pending.sfield.map((v) => ({ group: 'sfield', value: v })),
      ...pending.month.map((v) => ({ group: 'month', value: v })),
    ];
    chipsEl.replaceChildren(...picked.map(({ group, value }) => {
      const chip = el('span', 'season-chip', value);
      const x = el('button', 'season-chip__x');
      x.type = 'button';
      x.setAttribute('aria-label', `${value} 빼기`);
      x.innerHTML = '<img src="assets/icons/ic-chip-close.svg" width="20" height="20" alt="" />';
      x.addEventListener('click', () => {
        const input = document.querySelector(`.check__input[data-group="${group}"][value="${CSS.escape(value)}"]`);
        if (input) input.checked = false;
        updateSeasonBox();
      });
      chip.appendChild(x);
      return chip;
    }));
    if (!picked.length) chipsEl.appendChild(el('span', 'season-apply__none', '관심 분야나 월을 골라 주세요.'));
    const n = picked.length ? seasonCount(pending).toLocaleString('ko-KR') : TOTAL_COUNT_LABEL;
    applyBtn.textContent = `적용하기 (${n}건)`;
  }

  applyBtn.addEventListener('click', () => {
    applied = { sfield: checked('sfield'), month: checked('month') };
    render();
  });
  resetBtn.addEventListener('click', () => {
    document.querySelectorAll('.check__input[data-group="sfield"], .check__input[data-group="month"]').forEach((i) => { i.checked = false; });
    applied = { sfield: [], month: [] };
    updateSeasonBox();
    render();
  });

  document.querySelectorAll('.check__input').forEach((input) => input.addEventListener('change', () => {
    if (input.dataset.group === 'sfield' || input.dataset.group === 'month') updateSeasonBox();
    else render();
  }));
  searchForm.addEventListener('submit', (e) => { e.preventDefault(); render(); });
  searchInput.addEventListener('search', render); // 검색창 X(지우기)를 누르면 바로 전체로

  /* 필터 버튼 — 지금 탭의 상자 접고 펴기 */
  function showPanels() {
    const seasonTab = tab === 'season';
    interestPanel.hidden = !(panelOpen && !seasonTab);
    seasonPanel.hidden = !(panelOpen && seasonTab);
    filterBtn.setAttribute('aria-expanded', String(panelOpen));
    filterBtn.setAttribute('aria-controls', seasonTab ? 'season-panel' : 'interest-panel');
  }
  filterBtn.addEventListener('click', () => { panelOpen = !panelOpen; showPanels(); });

  /* 탭 — 관심분야 · 시즈널 · MY */
  const tabs = [...document.querySelectorAll('.list-tab')];
  tabs.forEach((btn) => btn.addEventListener('click', () => {
    tabs.forEach((t) => {
      const on = t === btn;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
    tab = btn.dataset.tab;
    titleEl.textContent = btn.dataset.title;
    showPanels();
    render();
  }));

  updateSeasonBox();
  showPanels();
  render();
})();
