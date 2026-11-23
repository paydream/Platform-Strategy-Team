# 예스폼 멤버십 이용요금 (2026-11-23)

Figma: 디자인가이드_2025 › picing `6366:14703` (1280 폭) — 2026-11-23 오후 마지막으로 확인한 모양 기준

## 여는 법
`index.html` 을 브라우저로 열면 됩니다. 글꼴(Pretendard)만 인터넷에서 불러오고, 나머지는 모두 이 폴더 안 파일을 씁니다.

## 화면 순서
헤더 → 요금 안내 + 요금제 카드 4장 → 프로모션 → 확 달라진 프리미엄 혜택 → 통합 멤버십(어두운 배경) → 요금제별 상세 내용 → 파트너사 → 자주 묻는 질문 → 푸터

## 동작
| 무엇 | 어떻게 |
|---|---|
| 결제 주기 | 처음엔 **연 결제**. 월 결제를 누르면 프리미엄 12,000원 / 비즈니스 9,000원(1인), 안내 문구 "12개월 약정 · 매달 결제", "17% 절약" 표시 숨김 |
| 비즈니스 인원 | −/+ 로 2명~99명. 합계 = 인원 × 90,000원 / 년 (월 결제면 × 9,000원 / 월). 2명일 때 − 는 흐리게 |
| 자주 묻는 질문 | 누른 질문만 펼침 (처음엔 첫 질문이 열림) |
| 프리미엄 혜택 탭 | 고른 탭만 파란색 (다른 탭 내용은 시안에 없어 아래 내용은 그대로) |
| 헤더 전체 검색 | 체크박스 켜고 끄기 (hover · 선택 모양은 디자인가이드 check box) |

주소 뒤에 `?billing=month` 를 붙이면 월 결제로 열립니다.

## 파일
```
이용요금_개선/
├─ index.html
├─ README.md
├─ css/style.css
├─ js/main.js
└─ images/
   ├─ logo-yesform.svg
   ├─ ic-search-30.svg  ic-checkbox-24.svg  ic-checkbox-hover-24.svg  ic-checkbox-on-24.svg
   ├─ ic-join-24.svg  ic-charge-24.svg  ic-call-24.svg  ic-login-24.svg
   ├─ ic-check-20.svg  ic-check-24.svg  ic-arrow-up-24.svg  ic-arrow-down-24.svg  ic-alink-18.svg
   ├─ ic-group-form-24.svg  ic-group-write-24.svg  ic-group-sign-24.svg  ic-group-people-24.svg
   ├─ ic-fmt-hwp.svg  ic-fmt-word.svg  ic-fmt-excel.svg  ic-fmt-pdf.svg
   └─ partners-logo-01.png ~ partners-logo-16.png
```

## Figma 와 다르게 정한 것
- 결제 주기 처음 선택: Figma 는 "월 결제" 가 눌린 모양이지만, 카드 금액(10,000원 · 1년 120,000원 한 번에 결제)이 연 결제 금액이라 **연 결제**로 시작.
- 월 결제 금액(12,000원 · 9,000원)과 자주 묻는 질문 2~6번 답은 Figma 에 없어 기획 시안(yesform-custom.vercel.app/pricing)에서 가져옴.
- 프리미엄 혜택 설명: Figma 에 같은 문장이 두 줄 반복돼 있어 한 줄만 넣음 (그래서 그 구역이 26px 짧음).
- 통합 멤버십 카드의 유리 효과(Figma Glass)는 CSS 로 비슷하게만 만듦 (흐림 + 빛 테두리, 굴절은 CSS 로 못 함).
- hover 모양이 디자인가이드에 없는 것(파란 그라데이션 버튼, 결제 주기 버튼, 인원 −/+)은 살짝 진해지게만 새로 정함.
