# PRD: AI 뉴스 수집기

## 1. 개요
해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·카테고리 분류해 카드 형태로 보여주는 웹앱. 마음에 드는 뉴스는 카드의 버튼으로 Notion에 저장한다.

## 2. 목표
- 해외 AI 뉴스를 한국어로 빠르게 훑어볼 수 있게 한다.
- 사용자가 정의한 카테고리로 뉴스를 자동 분류하고 필터링한다.
- 선별한 뉴스를 Notion에 한 번에 저장한다.

### 비목표 (현재 범위 제외)
- 자동/예약 수집(항상 사용자가 버튼으로 수동 수집)
- RSS 소스 사용자 추가/편집(소스는 고정 2개)
- 모바일 네이티브 앱, 댓글/공유 기능

## 3. 사용자 및 시나리오
- **사용자:** AI 동향을 한국어로 추적하고 싶은 로그인 사용자.
- **시나리오:** 로그인 → '뉴스 가져오기' 클릭 → 카드 목록 확인 → 카테고리 칩으로 필터 → 관심 기사에서 'Notion 저장' 클릭.

## 4. 뉴스 소스
| 소스 | RSS |
|---|---|
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ |
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml |

## 5. 기능 요구사항

### 5.1 인증
- Clerk를 사용하며 앱 실행 시 로그인이 먼저 필요하다. 비로그인 상태에서는 모든 페이지·API가 차단된다.
- 최초 로그인 시 기본 카테고리를 자동 생성(시드)한다.

### 5.2 뉴스 가져오기
- 헤더의 '뉴스 가져오기' 버튼 클릭 시 두 RSS를 병렬 수집한다.
- URL 기준으로 이미 저장된 기사는 건너뛴다(중복 방지).
- 신규 기사만 Claude로 한국어 제목·요약을 생성하고 DB에 저장한다.
- 진행 중 로딩 상태를 표시하고, 완료 시 신규 기사 수를 알린다. 실패 시 오류 메시지를 보여준다.
- 1회 수집량은 소스당 최대 N개(기본 값 구현 시 확정)로 제한한다.

### 5.3 카드 목록
- 카드 구성: 한국어 제목, 한국어 요약, 출처, 게시 시각, 카테고리 뱃지, 원문 링크, 'Notion 저장' 버튼.
- 최신순 정렬. 뉴스 데이터는 사용자 간 공용이다.

### 5.4 자동 카테고리 분류
- 수집한 신규(및 미분류) 기사를 로그인 사용자의 카테고리 기준으로 Claude가 분류한다.
- 분류 결과는 사용자별로 저장한다. 어디에도 맞지 않으면 '기타'(또는 미분류)로 둔다.

### 5.5 카테고리 필터
- 카테고리 칩을 선택하면 해당 카테고리 뉴스만 표시한다. '전체' 선택 시 모두 표시.

### 5.6 카테고리 관리
- 카테고리는 사용자별이며 추가·이름/설명 수정·삭제가 가능하다.
- 설명(분류 힌트)은 Claude 분류 프롬프트에 사용된다.
- 변경 후 '재분류'를 실행해 기존 기사에 반영할 수 있다. 삭제된 카테고리의 기사는 기타/미분류로 이동한다.
- 기본 시드: 모델/연구, 제품/서비스, 투자/비즈니스, 규제/정책, 기타.

### 5.7 Notion 저장
- Notion MCP 서버(원격, OAuth)를 사용한다. 최초 1회 Notion 계정을 연결한다.
- 'Notion 저장' 클릭 시 선택한 기사를 Notion 페이지로 생성한다(제목, 요약, 카테고리, 원문 URL, 날짜).
- 저장 완료 시 버튼이 '저장됨'으로 바뀌고, 같은 기사를 중복 저장하지 않는다.
- 미연결 상태에서 클릭하면 연결 흐름으로 안내한다.

## 6. 비기능 요구사항
- **성능:** 서버리스 타임아웃을 고려해 수집량 제한과 Claude 배치 호출을 사용한다.
- **비용:** 번역·요약은 신규 기사당 1회만 수행한다. 분류에는 경량 모델을 고려한다.
- **보안:** Notion 토큰은 암호화 저장하고, API 키는 환경변수로만 관리한다. 모든 API는 인증 검사를 한다.
- **언어:** UI와 요약은 한국어.

## 7. 기술 스택
Next.js(App Router, TypeScript) · Clerk · Neon(Postgres) + Drizzle ORM · Claude API(`@anthropic-ai/sdk`) · Notion MCP(`@modelcontextprotocol/sdk` 클라이언트) · rss-parser

## 8. 데이터 모델
- `articles`(공용): id, source, url(unique), title, excerpt, imageUrl, publishedAt, titleKo, summaryKo, createdAt
- `categories`(사용자별): id, userId, name, description, color, sortOrder
- `article_categories`: userId, articleId, categoryId
- `notion_connections`: userId, 암호화된 OAuth 토큰·만료 정보, 대상 페이지/DB ID
- `saved_articles`: userId, articleId, notionPageId, savedAt

## 9. API (안)
- `POST /api/news/fetch` — 수집·번역·요약·분류
- `GET /api/news?category=` — 목록/필터
- `GET|POST|PATCH|DELETE /api/categories` — 카테고리 CRUD
- `POST /api/categories/reclassify` — 재분류
- `GET /api/notion/connect`, `GET /api/notion/callback` — Notion OAuth
- `POST /api/notion/save` — 기사 Notion 저장

## 10. 구현 단계
1. 프로젝트 초기화 + Clerk
2. Neon/Drizzle 스키마·마이그레이션
3. RSS 수집
4. Claude 번역·요약
5. 카드 UI
6. 분류 + 카테고리 CRUD/필터
7. Notion MCP 연동

## 11. 수용 기준
- 비로그인 접근이 차단되고, 로그인 후 진입된다.
- '뉴스 가져오기' 후 카드가 생성되며, 재클릭해도 중복이 없다.
- 카테고리 필터와 추가·수정·삭제·재분류가 동작한다.
- 'Notion 저장' 시 실제 Notion 페이지가 생성되고 중복 저장이 방지된다.

## 12. 리스크 및 미결 사항
- Notion MCP의 사용자별 OAuth 토큰 저장·갱신 구현이 가장 복잡하다.
- Notion 저장 대상(특정 페이지 vs 데이터베이스)은 구현 시 확정한다.
- 소스당 수집 최대 개수와 사용할 Claude 모델은 구현 시 확정한다.
- 필요한 환경변수: Clerk 키, `DATABASE_URL`, `ANTHROPIC_API_KEY`, Notion OAuth 값.
