# 플랫폼전략팀 업무 아카이브 운영 규칙

이 저장소는 플랫폼전략팀(디자인/기획) 업무 아카이브(platform-strategy-team.vercel.app)입니다.
디자인 시안·기획서를 **프로젝트 → 버전(폴더) → 시안** 구조로 관리하고, 최종안 표시와 화면별 코멘트를 지원합니다.

## 절대 규칙: 덮어쓰기 금지
- 한 번 올린 시안 폴더·파일은 **고치거나 지우거나 이름을 바꾸지 않는다.** 같은 시안의 새 버전이라도 항상 새 폴더로 올린다.
- 새 파일은 `archive/YYYYMMDD-HHMMSS-영문이름/` 새 폴더에 넣는다. 폴더가 이미 있으면 멈춘다.
- 목록에서 빼려면 숨기기(`hidden: true`)나 휴지통(`trash`)을 쓴다. 시안 파일은 그대로 둔다.
- 버전의 `folder`·`preview`·시안 `href`는 한 번 정해지면 바뀌지 않는다(`admin/model.js`의 `checkSave`가 막음).
- 바꿔도 되는 파일은 관리용뿐이다: `projects.json`, `data/comments.json`, 루트 `index.html`, `project.html`, `tracking.html`, `wbs.html`, `stats*.html`(통계 화면), `gnb.css`·`gnb.js`(공통 GNB), `vercel.json`, `admin/`, `api/`, `data/`, `README.md`, `CLAUDE.md`, `.github/`.
- `.github/workflows/no-overwrite.yml`이 push마다 이 규칙을 검사한다.

## 데이터 (`projects.json`, version 2)
- `projects[]`: `{ id, title, team('design'|'planning'), category, desc, created, updated, hidden, final, versions[] }`. 배열 순서 = 화면 순서.
- `versions[]`: `{ id, label('v1'…), title, desc(바뀐 점), created, folder, preview, hidden, items[{label, href}] }`. 오래된 것이 앞.
- `final`(확정안, 디자인 프로젝트는 관리자 3번의 "확정안" 칸이나 프로젝트 화면의 "이 시안을 확정안으로" 버튼으로 지정): `null` 또는 `{ version: 버전id, href: 시안경로|null }` (href가 null이면 버전 전체가 최종안).
- `trash[]`: `{type:'version', projectId, deleted, version}` 또는 `{type:'project', deleted, project}`.
- 규칙 코드는 `admin/model.js` 한 곳(관리자 페이지와 서버 API가 같이 씀).

## 코멘트 (`data/comments.json`)
- `{ comments: [{ id, project, version, href, author(30자), text(500자), created(ISO) }] }`
- 작성: 팀 비밀번호(`TEAM_PASSWORD`, 없으면 `ADMIN_PASSWORD`). 삭제: 관리자 비밀번호.
- 이 파일만 바뀐 커밋은 재배포하지 않는다(`vercel.json` ignoreCommand). 코멘트는 `/api/comments`가 GitHub에서 바로 읽는다.

## 화면·API
- `/` 프로젝트 목록(전체/디자인/기획), `/project.html?id=…` 시안 보기(버전 선택 없음: 확정안 버전 → 없으면 최신 버전, 시안 전환은 시안 화면 안의 자체 전환 바를 쓰고 페이지가 iframe 경로를 따라감), 헤더 "코멘트" 버튼 → 작성 모달 → 저장 시 오른쪽 사이드바에 코멘트 표시, `/admin/` 관리자.
- `/api/projects`(목록 저장), `/api/upload`(올리기), `/api/comments`(코멘트). Vercel 환경변수: `GITHUB_TOKEN`, `ADMIN_PASSWORD`, `TEAM_PASSWORD`(선택).

## 예전 위치(2026.10.07~08에 올린 것, 그대로 유지)
- 루트 `yesform-main.html`, `v01-1/`, `v02/`, `v03/`, `css/`, `js/`, `assets/`
- `yesform-main-1008/`, `yesform-main-1008-2/`

## GA4·GTM 측정 관리 (`/tracking.html`)
- GA4에 넣는 이벤트를 설계 → GTM·개발 구현 → 수집 확인까지 관리하는 화면. 헤더 "측정 관리" 버튼.
- 측정 항목: `data/tracking.json` (`{ version, updated, products[], sources[], wbs[], items[] }`). `items[]`: `{ id, product(yesform|sign|editor), kind(new|fix|existing), funnel, event, eventType, title, metrics, fire, dedupe, paramsReq[], paramsOpt[], impl(처리 주체), how, status, owner, due, gtm{container,version,tags[]}, note, log[{date,by,text}], updated }`.
- 상태: plan(계획) · gtm(GTM 작업 중) · dev(개발 요청) · verify(검증 필요) · live(수집 중) · done(완료, 제거·수정) · hold(보류).
- 쓰기: `/api/tracking` — 추가·수정·이력은 팀 비밀번호, 삭제는 관리자 비밀번호. 이 파일만 바뀐 커밋은 재배포 안 함(ignoreCommand), 화면은 API로 GitHub에서 바로 읽음.
- 스냅샷: `data/tracking-snapshot.json` = GTM 컨테이너(태그·트리거·게시 이력), GA4 이벤트별 일별 수집량(최근 28일), GA4 맞춤 정의 목록. 자동 갱신 안 됨 — GTM 내부 API·GA4에서 다시 뽑아 이 파일을 덮어쓰면 갱신(재배포됨).
- 원본 설계는 Google 시트 「GA4개선(WBS포함)」(01 예스폼 신규 · 02 제거·수정 · 03 싸인 신규 · 04 개발 필수 · WBS). 2026-11-12에 시트 내용으로 처음 채움.

## 통계 · 에디터/싸인 지표 (`/stats.html`, 매일 자동 갱신)
- 헤더 GNB의 "에디터/싸인 지표" 버튼(매일 보는 메뉴라 고정). 에디터·예스폼싸인 탭 × 월 탭. 통계 비밀번호(`STATS_PASSWORD`)로 열람.
- 데이터: `data/stats/marketing.enc.json` — 저장소가 공개라 AES-256-GCM으로 암호화(`api/_statsfile.js`, 키는 `STATS_UPDATE_KEY`에서 파생). `meta`(업데이트 날짜·기간)만 평문. 파일이 없으면 env `STATS_DATA`(예전 스냅샷)를 쓴다.
- 갱신: 매일 아침 Aside 루틴이 GA4(에디터·싸인 속성)와 싸인 관리자 통계에서 전날까지 다시 뽑아 `POST /api/stats-update` `{ key, id:'marketing', data }`로 보낸다(키 = `STATS_UPDATE_KEY`). API가 암호화해 GitHub에 커밋. 이 파일만 바뀐 커밋은 재배포 안 함(ignoreCommand), `/api/stats`가 GitHub에서 바로 읽는다(60초 캐시).
- 목록(사이드바)의 기간·업데이트 날짜는 `auto: true` 항목이면 파일 meta로 자동 표시된다.

## 팀 WBS (`/wbs.html`, 비밀번호 없음, 매일 17:00 갱신)
- 헤더 GNB "팀 WBS". 디자인 심현지 · 기획 박채은 개인 일정(지금 하는 일, 다음 일정, 휴가, 주별 부하, 기간별 빈 평일, 간트).
- 데이터: `data/stats/wbs.enc.json`(암호화, `api/_statsfile.js` 재사용, 재배포 없음). 화면은 `GET /api/wbs`로 읽는다. 실패하면 현황판 API를 바로 부르고(휴가 없음), 그것도 실패하면 파일 안 저장본.
- 갱신: 매일 17시 Aside 루틴이 (1) 현황판 `https://yesform-bs-dashboard.vercel.app/api/master?tab=통합일정` WBS와 (2) 예스폼 관리자 연차/휴가 달력(`formadmin.yesform.com/admin/admin/newVacation/huga_calendar.php?Year=&Month=`, 이번 달~+2달, 심현지·박채은만)을 모아 `POST /api/wbs` `{ key, data }`(키 = `STATS_UPDATE_KEY`). 데이터: `{ updated, updatedAt, wbs{fetchedAt, sheetCollected, rows[]}, leaves{ok, fetchedAt, months[], items[{date,team,name,type}]} }`.
- 휴가 계산: 반반차 0.25일, 반차 0.5일, 그 외는 하루. 하루 휴가는 빈 날에서 뺀다.
- 분류: 담당자 `hyunji sim`/`PARK CHAEEUN` → 해당 사람. 담당자 칸이 비면 업무명 ‘디자인’(시스템·토큰·가이드 제외) → 심현지, ‘기획’ → 박채은, 그 하위 업무도 같은 사람. 제외 프로젝트: 웹 업무자동화(박지훈), 에디터·싸인 통합(상세 시트와 중복), 예스폼(주간 회의), 마케팅, 주요 콘텐츠. 규칙은 `wbs.html`의 `PEOPLE`/`SKIP`.

## 공통 GNB (`gnb.css` · `gnb.js`)
- 업무 아카이브(`/`) · 에디터/싸인 지표 · 팀 WBS · 측정 관리 · 통계 · 관리자를 아이콘+메뉴명으로 보여주는 상단 메뉴. 왼쪽 "플랫폼전략팀" 로고를 누르면 메인 홈(`./`)으로 간다.
- 메뉴 추가·순서·아이콘·배지 변경은 `gnb.js`의 `MENU`만 고치면 모든 화면에 반영된다. 스타일은 `gnb.css`.
- 화면 마크업: `<header class="gnb"><div class="wrap gnb-top">로고 <div class="gnb-util">화면별 버튼(잠그기 등)</div></div><nav class="wrap gnb-nav" data-current="메뉴id"></nav><script src="gnb.js"></script></header>`, `<head>`에 `<link rel="stylesheet" href="gnb.css">`.
- 메뉴 id: `archive`, `metrics`(stats.html), `wbs`, `tracking`, `stats`(stats-age*.html·홈 사이드바 `#stats`), `admin`. 새 화면을 만들면 같은 마크업을 쓴다.
