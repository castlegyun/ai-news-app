# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 현황

AI 뉴스 수집기: 해외 AI 뉴스를 RSS로 수집하고, Claude로 한국어 번역·요약·카테고리 분류를 한 뒤, 선택한 기사를 Notion에 저장하는 한국어 웹앱. 요구사항의 기준 문서는 `PRD.md`이며, 기능을 만들기 전에 반드시 읽을 것.

UI를 만들거나 수정할 때는 `ui.md`(화면 구성, Tailwind 스타일 규칙, 컴포넌트 가이드)를 먼저 읽고 따를 것.

구현 현황(기능별 ✅/⏳)은 `PRD.md`의 6장과 11장을 따른다. 코드와 PRD가 어긋나면 코드를 기준으로 PRD를 고친다.

## 명령어

- `npm run dev` — 개발 서버 (Turbopack)
- `npm run build` / `npm start` — 프로덕션 빌드 / 실행
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- 테스트 러너는 설정되어 있지 않다.

## 커스텀 명령어

- `/news-workflow <브랜치-이름>` (`.claude/commands/news-workflow.md`) — 새 기능 개발 워크플로우. main 확인 → 새 브랜치 생성(이름이 없으면 기능을 물어보고 영어 소문자-하이픈 이름을 제안) → 프로젝트 컨벤션 안내 → '완료'/'done' 입력 시 변경 파일 목록과 커밋 메시지 제안 후 사용자 확인을 받아 커밋하고 main에 병합 → 작업 요약.
- `/new-branch <브랜치-이름>` — main에서 새 브랜치만 생성.

## Next.js 버전 주의

`next`는 16.4.2, React는 19.3으로, 이전 버전과 호환되지 않는 변경이 있다. `next dev`가 자동 관리하는 `AGENTS.md`는 Next.js 코드를 작성하기 전에 `node_modules/next/dist/docs/`의 관련 가이드를 읽고, 폐기(deprecation) 안내를 따르라고 요구한다.

`next.config.ts`에서 `cacheComponents`와 `partialPrefetching`이 켜져 있고, `*.css`는 `@tailwindcss/turbopack`을 통해 Tailwind v4로 처리한다. 이 설정은 페이지와 데이터 패칭을 작성하는 방식(예: 사용자별 동적 데이터, 인증이 필요한 라우트)에 영향을 주므로 관련 문서를 확인할 것.

## 기술 스택 (PRD §7)

Next.js(App Router, TypeScript, `src/` 구조, 임포트 별칭 `@/*`) · Clerk(인증) · Neon(Postgres) + Drizzle ORM · Claude API(`@anthropic-ai/sdk`) · Notion REST API(직접 호출) · `rss-parser`

## 제품 개요와 범위

- 시나리오: 로그인 → 헤더의 '뉴스 가져오기' 클릭 → 카드 목록 확인 → 카테고리 칩으로 필터 → 'Notion 저장'.
- 뉴스 소스는 고정 2개: TechCrunch AI(`https://techcrunch.com/category/artificial-intelligence/feed/`), The Verge AI(`https://www.theverge.com/rss/ai-artificial-intelligence/index.xml`).
- 비목표: 자동/예약 수집(항상 수동 버튼), RSS 소스 사용자 추가·편집, 모바일 네이티브 앱, 댓글·공유.
- UI와 요약은 모두 한국어.

## 핵심 동작 규칙 (구현 기준, 자세한 내용은 PRD.md)

- **인증:** Clerk. 페이지는 로그인 모달을 띄우기 위해 통과시키고, `/api/*`는 비로그인이면 401로 막는다 (`src/proxy.ts`). 모든 API는 인증을 검사한다.
- **뉴스 가져오기:** 두 RSS를 병렬 수집 → URL 기준으로 중복 건너뜀 → 신규·미번역 기사만 Claude Haiku로 한국어 제목·요약 생성 → 사용자 카테고리 기준으로 분류. 소스당 30건, 1회 AI 처리 60건 상한, `maxDuration` 60초. 번역·요약은 기사당 1회만 한다.
- **기본 카테고리:** 모델/연구, 제품/서비스, 투자/비즈니스, 규제/정책, 기타. 사용자가 처음 뉴스를 가져올 때 시드한다.
- **카드 목록:** 한국어 제목·요약, 출처, 게시 시각, 카테고리 뱃지, 원문 링크, 'Notion 저장'과 삭제 버튼. 최신순, 한 페이지 9개. 카테고리 칩 필터와 키워드 검색(제목·요약).
- **Notion 저장:** 환경변수의 통합 토큰과 데이터베이스 하나를 모든 사용자가 공유한다. 저장하면 '저장됨'으로 바뀌고 같은 사용자의 같은 기사는 중복 저장하지 않는다.
- **보안:** API 키와 토큰은 환경변수로만 관리한다. 필요한 환경변수: Clerk 키, `DATABASE_URL`, `ANTHROPIC_API_KEY`, `NOTION_API_TOKEN`, `NOTION_DATABASE_ID`.

## 아직 구현하지 않은 것 (PRD 6.6, 6.7)

- 사용자별 카테고리 추가·수정·삭제와 재분류, 관련 API
- 사용자별 Notion OAuth 연결 (`notion_connections` 테이블은 스키마만 있고 쓰지 않는다)

## 데이터 모델과 API

`PRD.md`의 9장(데이터 모델)과 10장(API)을 본다. 요약: 뉴스(`articles`)만 사용자 간 공용이고, 카테고리·분류 결과·저장 기록은 사용자별이다. API는 `POST /api/news/fetch`, `DELETE /api/news/{id}`, `POST /api/notion/save` 세 개이고, 목록 조회는 `/dashboard` 서버 컴포넌트가 DB를 직접 읽는다.
