# AI 뉴스 수집기

해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·카테고리 분류를 해 카드 목록으로 보여주는 웹앱입니다. 마음에 드는 기사는 버튼 하나로 Notion 데이터베이스에 저장할 수 있습니다.

## 주요 기능

- **로그인:** Clerk 인증. 비로그인 상태에서는 페이지와 API가 모두 차단됩니다.
- **뉴스 가져오기:** TechCrunch AI, The Verge AI 두 RSS를 병렬 수집하고, URL 기준으로 중복을 건너뛰며 신규 기사만 저장합니다.
- **번역·요약·분류:** Claude Haiku로 한국어 제목·요약을 만들고, 사용자별 카테고리 기준으로 분류합니다. 번역·요약은 기사당 1회만 수행합니다.
- **카드 목록:** 최신순 정렬, 카테고리 칩 필터, 페이지네이션.
- **Notion 저장:** 카드의 `Notion 저장` 버튼을 누르면 제목·요약·카테고리·원문 URL·날짜가 Notion 데이터베이스에 저장되고, 버튼이 `저장됨`으로 바뀝니다. 같은 기사는 중복 저장되지 않습니다.

## 기술 스택

Next.js 16 (App Router, TypeScript) · React 19 · Tailwind CSS v4 · Clerk · Neon (Postgres) + Drizzle ORM · Claude API (`@anthropic-ai/sdk`) · Notion API · `rss-parser`

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경변수

프로젝트 루트에 `.env.local`을 만들고 아래 값을 채웁니다.

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Neon (Postgres)
DATABASE_URL=

# Claude API
ANTHROPIC_API_KEY=

# Notion
NOTION_API_TOKEN=
NOTION_DATABASE_ID=
```

### 3. Notion 데이터베이스 준비

저장 대상 데이터베이스에는 아래 속성이 있어야 합니다.

| 속성 | 타입 |
| --- | --- |
| 제목 | 제목(title) |
| 요약 | 텍스트 |
| 카테고리 | 선택(select) |
| 출처 | URL |
| 날짜 | 날짜 |

Notion 통합(integration)을 만들어 토큰을 `NOTION_API_TOKEN`에 넣고, 해당 데이터베이스의 **연결** 메뉴에서 그 통합을 추가해야 저장이 동작합니다. 데이터베이스 ID는 `NOTION_DATABASE_ID`에 넣습니다.

### 4. 데이터베이스 마이그레이션

```bash
npm run db:migrate
```

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` / `npm start` | 프로덕션 빌드 / 실행 |
| `npm run lint` | ESLint |
| `npm run db:generate` | 스키마 변경에서 마이그레이션 생성 |
| `npm run db:migrate` | 마이그레이션 적용 |

## 프로젝트 구조

```
src/
├── app/
│   ├── dashboard/          # 뉴스 카드 대시보드
│   └── api/
│       ├── news/fetch/     # 수집·번역·요약·분류
│       └── notion/save/    # 기사 Notion 저장
├── components/             # 뉴스 카드, 카테고리 바, 저장 버튼 등
├── db/                     # Drizzle 스키마와 쿼리
└── lib/
    ├── rss/                # RSS 수집
    ├── ai/                 # Claude 번역·요약·분류
    ├── categories/         # 기본 카테고리 시드
    └── notion/             # Notion 페이지 생성
```

## 문서

- `PRD.md` — 요구사항의 기준 문서
- `ui.md` — 화면 구성과 스타일 가이드
- `CLAUDE.md` — AI 코딩 도구용 프로젝트 안내

## 현재 범위와 제한

- 뉴스 소스는 위 두 곳으로 고정이며, 수집은 항상 수동 버튼으로만 이루어집니다.
- Notion 저장은 환경변수의 통합 토큰과 데이터베이스 하나를 모든 사용자가 공유합니다. 사용자별 Notion OAuth 연결은 아직 구현되지 않았습니다.
