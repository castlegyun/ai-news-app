# UI 가이드

'AI 뉴스 수집기'의 화면 구성과 스타일 규칙을 정리한 문서다. 스타일은 Tailwind CSS v4 유틸리티 클래스로만 작성하고, 모든 UI 문구는 한국어로 쓴다. 요구사항은 `PRD.md`가 기준이며, 이 문서는 그 요구사항을 화면으로 옮기는 방식을 다룬다.

## 1. 디자인 원칙

- **깔끔함:** 장식을 줄이고 여백과 얇은 테두리로 영역을 나눈다. 그림자는 쓰더라도 약하게(`shadow-sm`) 쓴다.
- **읽기 편함:** 본문은 충분한 행간(`leading-relaxed`)과 중간 명도의 회색 텍스트로 쓴다. 한 카드에서 가장 눈에 띄는 것은 한국어 제목이다.
- **일관성:** 간격은 4의 배수(Tailwind 기본 스케일), 모서리는 `rounded-xl`(카드)·`rounded-full`(칩·뱃지)·`rounded-lg`(버튼)로 통일한다.
- **다크 모드:** `<html>`의 `.dark` 클래스로 전환한다(`globals.css`의 `@custom-variant dark`). 처음 방문하면 `prefers-color-scheme`을 따르고, 오른쪽 위 토글(`ThemeToggle`)로 바꾼 값은 `localStorage`(`theme`)에 저장된다. `layout.tsx`의 초기화 스크립트가 첫 페인트 전에 클래스를 붙여 깜빡임을 막는다. 색을 지정할 때는 `dark:` 변형을 항상 함께 쓴다.

## 2. 디자인 토큰

`src/app/globals.css`의 `--background`, `--foreground`가 기본 배경·글자색이다. 그 외 색은 Tailwind 기본 팔레트를 쓴다.

| 용도 | 라이트 | 다크 |
| --- | --- | --- |
| 페이지 배경 | `bg-zinc-50` | `dark:bg-zinc-950` |
| 카드/헤더 표면 | `bg-white` | `dark:bg-zinc-900` |
| 테두리 | `border-zinc-200` | `dark:border-zinc-800` |
| 제목 텍스트 | `text-zinc-900` | `dark:text-zinc-50` |
| 본문 텍스트 | `text-zinc-600` | `dark:text-zinc-400` |
| 보조 텍스트(출처·시각) | `text-zinc-500` | `dark:text-zinc-500` |
| 강조(주요 버튼, 선택된 칩) | `bg-indigo-600 text-white` | `dark:bg-indigo-500` |
| 강조 hover | `hover:bg-indigo-700` | `dark:hover:bg-indigo-400` |

- 강조색은 인디고 하나만 쓴다. 성공(저장됨)은 `emerald`, 오류는 `red`를 상태 표시에만 쓴다.
- 폰트는 `layout.tsx`의 Geist(`--font-geist-sans`)를 쓰고, 한글은 시스템 폰트로 대체된다. 본문 기본 크기는 `text-sm`~`text-base`.

## 3. 레이아웃

```
┌──────────────────────────────────────────────┐
│ AI 뉴스 수집기              [뉴스 가져오기] (U) │  ← 헤더 (sticky)
├──────────────────────────────────────────────┤
│                                              │
│  [전체] [모델/연구] [제품/서비스] … [+ 추가]    │  ← 카테고리 바
│                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐            │
│  │  카드   │ │  카드   │ │  카드   │            │  ← 뉴스 카드 그리드
│  └────────┘ └────────┘ └────────┘            │
│                                              │
└──────────────────────────────────────────────┘
```

- 페이지 배경은 `bg-zinc-50 dark:bg-zinc-950`, 콘텐츠 컨테이너는 `mx-auto w-full max-w-6xl px-4 sm:px-6`.
- 헤더 아래 본문은 `py-6`, 카테고리 바와 카드 그리드 사이 간격은 `mt-6`.
- 카드 그리드: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`. 모바일은 1열.

## 4. 컴포넌트

### 4.1 헤더

- 좌측: 앱 이름 `AI 뉴스 수집기` (`text-lg font-semibold`).
- 우측: '뉴스 가져오기' 버튼, 다크 모드 토글(아이콘 버튼, 라이트에서는 달·다크에서는 해), Clerk `UserButton` 순서. 비로그인 화면에서는 토글만 오른쪽 위에 고정(`fixed top-3 right-4`)한다.
- 클래스: `sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 dark:border-zinc-800 dark:bg-zinc-900/80`.

**'뉴스 가져오기' 버튼 (주요 버튼)**

```
inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white
transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60
dark:bg-indigo-500 dark:hover:bg-indigo-400
```

- 수집 중에는 `disabled`로 두고 스피너와 `가져오는 중…`을 표시한다.
- 완료 시 `새 기사 N건을 가져왔습니다` 토스트, 실패 시 오류 메시지를 보여준다(§5).

### 4.2 카테고리 바

뉴스 카드 목록 **바로 위**에 가로로 나열한다. 순서는 `전체` → 사용자 카테고리(`sortOrder` 순) → **카테고리 추가 버튼(맨 끝)**.

- 컨테이너: `flex flex-wrap items-center gap-2`. 칩이 많아도 줄바꿈되어 가로 스크롤이 생기지 않게 한다.
- 칩은 `<button>`이며 선택 상태를 `aria-pressed`로 표시한다.

**카테고리 칩**

```
기본:   rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-sm text-zinc-700
        transition-colors hover:bg-zinc-100
        dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800
선택됨: border-transparent bg-indigo-600 text-white hover:bg-indigo-600
        dark:bg-indigo-500 dark:text-white
```

- '전체'는 항상 첫 번째이며 모든 기사를 보여준다. 초기 선택 상태다.
- 칩 안에 해당 카테고리의 기사 수를 작은 숫자로 덧붙일 수 있다(`ml-1.5 text-xs opacity-70`).
- 카테고리 수정·삭제는 칩에 마우스를 올리거나 포커스했을 때 나타나는 보조 메뉴(`⋯`)로 연다. 기본 화면에서는 숨겨 깔끔함을 유지한다.

**카테고리 추가 버튼 (목록 맨 끝)**

```
inline-flex items-center gap-1 rounded-full border border-dashed border-zinc-300 px-3.5 py-1.5
text-sm text-zinc-500 transition-colors hover:border-indigo-400 hover:text-indigo-600
dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-indigo-400 dark:hover:text-indigo-400
```

- 라벨은 `+ 카테고리 추가`. 점선 테두리로 일반 칩과 구분한다.
- 클릭하면 이름과 설명(분류 힌트)을 입력하는 작은 대화상자(또는 칩 자리에 인라인 입력)를 연다. 설명은 분류 프롬프트에 쓰인다는 안내 문구를 입력란 아래에 `text-xs text-zinc-500`으로 표시한다.
- 추가·수정·삭제 후에는 '재분류'로 기존 기사에 반영할 수 있어야 한다. 재분류 버튼은 카테고리 바 오른쪽 끝에 텍스트 버튼(`text-sm text-zinc-500 hover:text-zinc-900`)으로 둔다.

### 4.3 뉴스 카드

한 기사를 한 장의 카드로 보여준다. 요소 순서는 위에서 아래로 다음과 같다.

1. 상단: 출처(좌, `font-medium text-zinc-700 dark:text-zinc-300`)와 게시 시각(우, `tabular-nums text-zinc-500 dark:text-zinc-400`) — `text-xs`, 가운뎃점 없음
2. 한국어 제목 — `text-lg font-semibold leading-snug tracking-tight break-keep text-zinc-900 dark:text-zinc-50`
3. 한국어 요약 — `text-[15px] leading-7 break-keep text-zinc-600 dark:text-zinc-400`, `line-clamp-4`
4. 하단 행(구분선 아래): 카테고리 라벨(좌), 원문 링크와 'Notion 저장' 버튼(우)

**카드 컨테이너**

```
group relative flex h-full flex-col gap-4 overflow-hidden rounded-xl border border-zinc-200 bg-white
py-6 pr-6 pl-7 shadow-sm transition-[border-color,box-shadow] duration-200
hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700
```

- **카테고리 색 막대:** 카드 왼쪽 가장자리에 `absolute inset-y-6 left-0 w-1 rounded-r-full`. 색은 `categories.color`(인라인 스타일), 미분류는 `bg-zinc-300 dark:bg-zinc-600`. 호버하면 `group-hover:inset-y-0`으로 카드 높이만큼 늘어난다(`motion-reduce`에서는 전환 없음). 카드가 떠오르는 효과는 쓰지 않는다.
- 한글은 `break-keep`으로 어절 단위 줄바꿈한다.
- 삭제(✕) 버튼은 데스크톱(`md`~)에서 hover·포커스 때만 보이고, 모바일에서는 항상 보인다. 클래스: `md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100` (카드 컨테이너의 `group` 필요).
- 하단 행은 `mt-auto flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800`로 두어 카드 높이가 달라도 같은 줄에 정렬되게 한다.
- 제목은 원문이 아니라 한국어 제목(`titleKo`)을 쓰고, 번역 전 기사는 원문 제목을 대신 보여준다.
- 시간 표기는 상대 시각(`방금 전`, `N분 전`, `N시간 전`, `N일 전`)을 쓰고, 7일을 넘으면 `YYYY. M. D.`로 표기한다. `<time dateTime>`에 ISO 값을 넣는다.
- 목록은 게시 시각 기준 최신순이다.

**카테고리 라벨**

```
inline-flex min-w-0 items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300
```

- 앞에 `size-2 rounded-full` 색 점을 둔다. `categories.color`는 `#RRGGBB` 값이므로 Tailwind 클래스 대신 인라인 스타일(`backgroundColor`)로 입힌다.
- 미분류 기사는 `bg-zinc-300 dark:bg-zinc-600` 회색 점과 `기타`를 표시한다.

**원문 링크**

- `원문 보기 ↗` 텍스트 링크: `text-sm text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100`.
- `target="_blank" rel="noopener noreferrer"`로 새 탭에서 연다.

**'Notion 저장' 버튼 (보조 버튼)**

```
기본:   rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700
        transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800
저장중: disabled:opacity-60 (라벨 `저장 중…`)
저장됨: border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30
        dark:bg-emerald-500/10 dark:text-emerald-300 (라벨 `저장됨`, disabled)
```

- 저장이 끝나면 버튼이 `저장됨`으로 바뀌고 다시 누를 수 없다(중복 저장 방지).
- Notion 미연결 상태에서 누르면 연결 안내 대화상자를 띄우고 연결 흐름으로 이동시킨다.

### 4.4 상태 화면

- **로딩(목록):** 카드와 같은 크기의 스켈레톤(`animate-pulse`, `bg-zinc-200 dark:bg-zinc-800`)을 6개 보여준다.
- **빈 상태:** 카드 영역 중앙에 `아직 가져온 뉴스가 없습니다` + `뉴스 가져오기` 버튼 안내. 특정 카테고리가 비어 있으면 `이 카테고리에 해당하는 기사가 없습니다`. 문구는 `text-sm text-zinc-500`, 영역은 `rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700`.
- **오류:** `rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300`. 원인과 다시 시도할 방법을 한 문장으로 쓴다.
- **알림(토스트):** 화면 하단 중앙 또는 우측 상단에 3~4초 노출. `rounded-lg bg-zinc-900 px-4 py-2.5 text-sm text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900`.

### 4.5 비로그인 화면

비로그인 상태에서는 앱 이름, 한 줄 소개, 로그인 버튼만 가운데 정렬로 보여준다(`SignInGate`). 대시보드 요소는 렌더링하지 않는다.

## 5. 상호작용·접근성

- 모든 클릭 요소는 키보드로 접근할 수 있어야 하며 포커스 링을 유지한다: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`.
- 칩과 버튼의 최소 터치 영역은 높이 36px 이상(`py-1.5` + `text-sm` 기준)을 유지한다.
- 아이콘만 있는 버튼에는 `aria-label`을 붙인다. 로딩·알림 영역에는 `role="status"`/`aria-live="polite"`를 쓴다.
- 색만으로 상태를 구분하지 않는다(선택된 칩은 `aria-pressed`, 저장됨은 라벨 변경으로 함께 전달).
- 전환 효과는 `transition-colors`/`transition-shadow` 정도로 짧게 쓰고, 과한 애니메이션은 피한다.

## 6. 반응형

| 구간 | 카드 열 수 | 비고 |
| --- | --- | --- |
| 기본(모바일) | 1 | 헤더의 '뉴스 가져오기'는 아이콘+짧은 라벨 유지 |
| `sm`(640px~) | 2 | |
| `lg`(1024px~) | 3 | 컨테이너 최대 너비 `max-w-6xl` |

카테고리 바는 모든 구간에서 줄바꿈으로 처리한다.

## 7. 구현 위치 (안)

- `src/components/home-content.tsx` — 로그인 후 대시보드 진입점(헤더 + 본문)
- `src/components/category-bar.tsx` — 카테고리 칩 + 추가 버튼
- `src/components/news-card.tsx` — 뉴스 카드
- `src/components/news-list.tsx` — 카드 그리드, 로딩/빈 상태

파일 분리는 구현 단계에서 조정해도 된다. 이 문서의 클래스 조합이 바뀌면 문서도 함께 갱신한다.
