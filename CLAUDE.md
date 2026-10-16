# 플랫폼전략팀 업무 아카이브 운영 규칙

이 저장소는 플랫폼전략팀(디자인/기획) 업무 아카이브(platform-strategy-team.vercel.app)입니다.
디자인 시안·기획서를 **프로젝트 → 버전(폴더) → 시안** 구조로 관리하고, 최종안 표시와 화면별 코멘트를 지원합니다.

## 절대 규칙: 덮어쓰기 금지
- 한 번 올린 시안 폴더·파일은 **고치거나 지우거나 이름을 바꾸지 않는다.** 같은 시안의 새 버전이라도 항상 새 폴더로 올린다.
- 새 파일은 `archive/YYYYMMDD-HHMMSS-영문이름/` 새 폴더에 넣는다. 폴더가 이미 있으면 멈춘다.
- 목록에서 빼려면 숨기기(`hidden: true`)나 휴지통(`trash`)을 쓴다. 시안 파일은 그대로 둔다.
- 버전의 `folder`·`preview`·시안 `href`는 한 번 정해지면 바뀌지 않는다(`admin/model.js`의 `checkSave`가 막음).
- 바꿔도 되는 파일은 관리용뿐이다: `projects.json`, `data/comments.json`, 루트 `index.html`, `project.html`, `vercel.json`, `admin/`, `api/`, `README.md`, `CLAUDE.md`, `.github/`.
- `.github/workflows/no-overwrite.yml`이 push마다 이 규칙을 검사한다.

## 데이터 (`projects.json`, version 2)
- `projects[]`: `{ id, title, team('design'|'planning'), category, desc, created, updated, hidden, final, versions[] }`. 배열 순서 = 화면 순서.
- `versions[]`: `{ id, label('v1'…), title, desc(바뀐 점), created, folder, preview, hidden, items[{label, href}] }`. 오래된 것이 앞.
- `final`: `null` 또는 `{ version: 버전id, href: 시안경로|null }` (href가 null이면 버전 전체가 최종안).
- `trash[]`: `{type:'version', projectId, deleted, version}` 또는 `{type:'project', deleted, project}`.
- 규칙 코드는 `admin/model.js` 한 곳(관리자 페이지와 서버 API가 같이 씀).

## 코멘트 (`data/comments.json`)
- `{ comments: [{ id, project, version, href, author(30자), text(500자), created(ISO) }] }`
- 작성: 팀 비밀번호(`TEAM_PASSWORD`, 없으면 `ADMIN_PASSWORD`). 삭제: 관리자 비밀번호.
- 이 파일만 바뀐 커밋은 재배포하지 않는다(`vercel.json` ignoreCommand). 코멘트는 `/api/comments`가 GitHub에서 바로 읽는다.

## 화면·API
- `/` 프로젝트 목록(전체/디자인/기획), `/project.html?id=…` 버전 폴더·시안 보기·코멘트, `/admin/` 관리자.
- `/api/projects`(목록 저장), `/api/upload`(올리기), `/api/comments`(코멘트). Vercel 환경변수: `GITHUB_TOKEN`, `ADMIN_PASSWORD`, `TEAM_PASSWORD`(선택).

## 예전 위치(2026.10.07~08에 올린 것, 그대로 유지)
- 루트 `yesform-main.html`, `v01-1/`, `v02/`, `v03/`, `css/`, `js/`, `assets/`
- `yesform-main-1008/`, `yesform-main-1008-2/`
