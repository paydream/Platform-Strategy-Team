# 예스폼 멤버십 이용요금 (2026-11-23)

| 시안 | Figma (디자인가이드_2025) | 모양 |
|---|---|---|
| 시안01 | picing `6366:14703` | 가운데 정렬 · 혜택 탭 · 통합 멤버십 카드 흐름 |
| 시안02 | picing `6366:14009` | 왼쪽 정렬 · 혜택 펼침 목록 · 파트너사 로고 흐름 |

2026-11-23 오후 마지막으로 확인한 Figma 기준입니다.

## 여는 법
`index.html` 을 브라우저로 열면 됩니다. 글꼴(Pretendard)만 인터넷에서 불러오고, 나머지는 모두 이 폴더 안 파일을 씁니다.

## 시안 바 (확인용 · 디자인에 포함되지 않음)
- 화면 맨 위 검정 바의 [시안01] [시안02] 로 바꿔 봅니다. 탭에 마우스를 올리면 시안 설명이 보입니다.
- 주소 뒤 `#1`, `#2` 로 바로 열 수 있고, 키보드 ←/→ 로도 넘깁니다. 마지막에 본 시안을 기억합니다.
- 전달할 때는 `index.html` 맨 아래 `<script src="js/sian-bar.js"></script>` 한 줄을 지우면 바가 빠지고 시안01 만 보입니다.

## 동작 (두 시안 같음)
| 무엇 | 어떻게 |
|---|---|
| 결제 주기 | 처음엔 **연 결제**. 월 결제를 누르면 프리미엄 12,000원 / 비즈니스 9,000원(1인), 안내 문구 "12개월 약정 · 매달 결제", 프리미엄 할인 표시 숨김 |
| 비즈니스 인원 | −/+ 로 2명~99명. 합계 = 인원 × 90,000원 / 년 (월 결제면 × 9,000원 / 월). 2명일 때 − 는 흐리게 |
| 자주 묻는 질문 | 누른 질문만 펼침 (처음엔 첫 질문이 열림) |
| 가로 흐름 | 시안01 통합 멤버십 카드 · 시안02 파트너사 로고가 왼쪽으로 계속 흐름. 마우스를 올리면 멈춤 |
| 프리미엄 혜택 | 시안01: 탭을 누르면 고른 탭만 파란색 / 시안02: 누른 항목만 펼침 |
| 헤더 | 두 시안 모두 Figma `6374:5410` (MEMBERSHIP) 헤더. 스크롤해도 화면 위에 고정 |

주소 뒤에 `?billing=month` 를 붙이면 월 결제로 열립니다.

## 파일
```
이용요금_개선/
├─ index.html          두 시안이 한 파일에 (div.sian data-sian="1" / "2")
├─ README.md
├─ css/style.css       공용 + 시안02(.s2-) 스타일
├─ js/main.js          결제 주기 · 인원 · 펼침 · 가로 흐름
├─ js/sian-bar.js      시안 바 (확인용)
└─ images/
   ├─ logo-yesform.svg
   ├─ ic-join-24.svg  ic-charge-24.svg  ic-call-24.svg  ic-login-24.svg
   ├─ ic-check-20.svg  ic-check-24.svg  ic-arrow-up-24.svg  ic-arrow-down-24.svg  ic-alink-18.svg
   ├─ ic-plus-18.svg  ic-minus-18.svg
   ├─ ic-group-form-24.svg  ic-group-write-24.svg  ic-group-sign-24.svg  ic-group-people-24.svg
   ├─ ic-fmt-hwp.svg  ic-fmt-word.svg  ic-fmt-excel.svg  ic-fmt-pdf.svg
   ├─ benefit-download.png
   └─ partners-logo-01.png ~ partners-logo-16.png
```

## Figma 와 다르게 정한 것
- 결제 주기 처음 선택: 시안01 Figma 는 "월 결제" 가 눌린 모양이지만, 카드 금액이 연 결제 금액이라 **연 결제**로 시작 (시안02 와 같게).
- 월 결제 금액(12,000원 · 9,000원)과 자주 묻는 질문 2~6번 답은 Figma 에 없어 기획 시안(yesform-custom.vercel.app/pricing)에서 가져옴.
- 시안01 프리미엄 혜택 설명: 같은 문장이 두 줄 반복돼 있어 한 줄만 넣음 (그 구역이 26px 짧음).
- 시안01 통합 멤버십 카드: Figma 는 10장(뒤 4장은 "에디터" 반복)이라 다른 6장만 두고 흐름으로 반복. 유리 효과(Figma Glass)는 CSS 로 비슷하게만 (흐림 + 빛 테두리).
- 시안02 혜택 2·3번 펼친 내용은 Figma 에 없어 설명 한 줄 + 빈 그림 자리로 새로 정함.
- 흐름 속도(초당 40px), 마우스를 올리면 멈춤, hover 모양이 없는 것(파란 그라데이션 버튼 · 결제 주기 · 인원 −/+)은 새로 정함.
- 그림(benefit-download.png)은 Figma 화면 캡처라 1배 크기.
