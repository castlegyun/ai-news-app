# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 현황

AI 뉴스 수집기: 해외 AI 뉴스를 RSS로 수집하고, Claude로 한국어 번역·요약·카테고리 분류를 한 뒤, 선택한 기사를 Notion에 저장하는 한국어 웹앱. 요구사항의 기준 문서는 `PRD.md`이며, 기능을 만들기 전에 반드시 읽을 것.

UI를 만들거나 수정할 때는 `ui.md`(화면 구성, Tailwind 스타일 규칙, 컴포넌트 가이드)를 먼저 읽고 따를 것.

현재는 `create-next-app` 기본 스캐폴드만 있고 앱 코드는 없다. 아래 기술 스택 중 Next.js 외의 패키지는 **아직 설치되지 않았다**. 구현 단계마다 필요할 때 추가한다.

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

Next.js(App Router, TypeScript, `src/` 구조, 임포트 별칭 `@/*`) · Clerk(인증) · Neon(Postgres) + Drizzle ORM · Claude API(`@anthropic-ai/sdk`) · Notion MCP(`@modelcontextprotocol/sdk` 클라이언트) · `rss-parser`

## 제품 개요와 범위

- 시나리오: 로그인 → 헤더의 '뉴스 가져오기' 클릭 → 카드 목록 확인 → 카테고리 칩으로 필터 → 'Notion 저장'.
- 뉴스 소스는 고정 2개: TechCrunch AI(`https://techcrunch.com/category/artificial-intelligence/feed/`), The Verge AI(`https://www.theverge.com/rss/ai-artificial-intelligence/index.xml`).
- 비목표: 자동/예약 수집(항상 수동 버튼), RSS 소스 사용자 추가·편집, 모바일 네이티브 앱, 댓글·공유.
- UI와 요약은 모두 한국어.

## 핵심 동작 규칙

- **인증:** 비로그인 상태에서는 모든 페이지와 API가 차단된다. 모든 API는 인증 검사를 한다. 최초 로그인 시 기본 카테고리를 시드한다(모델/연구, 제품/서비스, 투자/비즈니스, 규제/정책, 기타).
- **뉴스 가져오기:** 두 RSS를 병렬 수집 → URL 기준으로 이미 저장된 기사는 건너뜀(중복 방지) → 신규 기사만 Claude로 한국어 제목·요약을 생성해 저장. 로딩 상태, 완료 시 신규 기사 수 알림, 실패 시 오류 메시지를 표시한다.
- **서버리스 제약:** 타임아웃을 고려해 소스당 최대 N개로 제한하고 Claude 호출은 배치로 묶는다. 번역·요약은 신규 기사당 1회만 수행하며, 분류에는 경량 모델을 고려한다.
- **카드 목록:** 한국어 제목, 한국어 요약, 출처, 게시 시각, 카테고리 뱃지, 원문 링크, 'Notion 저장' 버튼. 최신순 정렬.
- **분류:** 신규·미분류 기사를 로그인 사용자의 카테고리 기준으로 Claude가 분류하고 결과는 사용자별로 저장한다. 어디에도 맞지 않으면 '기타'(또는 미분류). 카테고리의 설명(분류 힌트)이 분류 프롬프트에 쓰인다.
- **카테고리 관리:** 사용자별 추가·이름/설명 수정·삭제. 변경 후 '재분류'로 기존 기사에 반영하며, 삭제된 카테고리의 기사는 기타/미분류로 이동한다. 칩으로 필터링하고 '전체'는 모두 표시.
- **Notion 저장:** Notion 원격 MCP 서버(OAuth)를 사용하고 최초 1회 계정을 연결한다. 클릭하면 제목·요약·카테고리·원문 URL·날짜로 페이지를 생성하고, 버튼이 '저장됨'으로 바뀌며 중복 저장하지 않는다. 미연결 상태에서 클릭하면 연결 흐름으로 안내한다.
- **보안:** Notion 토큰은 암호화 저장, API 키는 환경변수로만 관리. 필요한 환경변수: Clerk 키, `DATABASE_URL`, `ANTHROPIC_API_KEY`, Notion OAuth 값.

## 데이터 모델 (PRD §8)

- `articles`(공용): id, source, url(unique), title, excerpt, imageUrl, publishedAt, titleKo, summaryKo, createdAt
- `categories`(사용자별): id, userId, name, description, color, sortOrder
- `article_categories`: userId, articleId, categoryId
- `notion_connections`: userId, 암호화된 OAuth 토큰·만료 정보, 대상 페이지/DB ID
- `saved_articles`: userId, articleId, notionPageId, savedAt

뉴스(`articles`)만 사용자 간 공용이고, 분류 결과·카테고리·Notion 연결·저장 기록은 사용자별이다.

## API 경로 (PRD §9, 안)

- `POST /api/news/fetch` — 수집·번역·요약·분류
- `GET /api/news?category=` — 목록/필터
- `GET|POST|PATCH|DELETE /api/categories` — 카테고리 CRUD
- `POST /api/categories/reclassify` — 재분류
- `GET /api/notion/connect`, `GET /api/notion/callback` — Notion OAuth
- `POST /api/notion/save` — 기사 Notion 저장

## 구현 단계 (PRD §10)

1. 프로젝트 초기화 + Clerk
2. Neon/Drizzle 스키마·마이그레이션
3. RSS 수집
4. Claude 번역·요약
5. 카드 UI
6. 분류 + 카테고리 CRUD/필터
7. Notion MCP 연동

## 수용 기준 (PRD §11)

- 비로그인 접근이 차단되고, 로그인 후 진입된다.
- '뉴스 가져오기' 후 카드가 생성되며, 재클릭해도 중복이 없다.
- 카테고리 필터와 추가·수정·삭제·재분류가 동작한다.
- 'Notion 저장' 시 실제 Notion 페이지가 생성되고 중복 저장이 방지된다.

## 미결 사항 (구현 시 확정 필요)

- 소스당 수집 최대 개수(N)와 사용할 Claude 모델
- Notion 저장 대상: 특정 페이지 vs 데이터베이스
- Notion MCP의 사용자별 OAuth 토큰 저장·갱신이 가장 복잡한 부분(리스크)
