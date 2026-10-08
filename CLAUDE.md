# 디자인 시안 아카이브 운영 규칙

이 저장소는 플랫폼전략팀 디자인 시안 아카이브(platform-strategy-team.vercel.app)입니다.

## 절대 규칙: 덮어쓰기 금지
- 한 번 올린 시안 폴더·파일은 **고치거나 지우거나 이름을 바꾸지 않는다.** 같은 시안의 새 버전이라도 항상 새 폴더로 올린다.
- 새 시안은 `archive/YYYYMMDD-HHMMSS-영문이름/` 새 폴더에 넣는다. 폴더가 이미 있으면 멈춘다.
- 목록에서 빼고 싶으면 `projects.json`에서 `"hidden": true`로 숨긴다(파일은 그대로 둔다).
- 바꿔도 되는 파일은 관리용뿐이다: `projects.json`, 루트 `index.html`, `admin/`, `README.md`, `CLAUDE.md`, `.github/`.
- `.github/workflows/no-overwrite.yml`이 push마다 이 규칙을 검사한다.

## 목록 데이터
- `projects.json`의 `projects` 배열 순서가 화면 순서다. 새 항목은 맨 앞에 넣는다.
- 항목 필드: `id`, `title`, `desc`, `category`, `created`, `updated`(YYYY.MM.DD), `hidden`, `folder`, `preview`, `versions[{label, href}]`.
- 관리자 페이지: `/admin/` (GitHub 토큰으로 바로 커밋).

## 예전 위치(2026.10.07~08에 올린 것, 그대로 유지)
- 루트 `yesform-main.html`, `v01-1/`, `v02/`, `v03/`, `css/`, `js/`, `assets/`
- `yesform-main-1008/`, `yesform-main-1008-2/`
