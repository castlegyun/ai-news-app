import { DeleteButton } from "@/components/delete-button";
import { SaveButton } from "@/components/save-button";
import type { DashboardArticle } from "@/db/queries";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// 서버에서 요청마다 한 번만 호출하는 현재 시각. 컴포넌트 렌더 중 Date.now() 직접 호출 린트를 피한다.
export function currentTime() {
  return Date.now();
}

function formatPublished(date: Date, now: number) {
  const diff = now - date.getTime();
  if (diff < MINUTE) return "방금 전";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}일 전`;
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

// categories.color는 #RRGGBB 값이므로 Tailwind 클래스 대신 인라인 스타일로 색을 입힌다.
// 미분류 기사는 회색 점과 '기타'로 표시한다.
function CategoryLabel({
  name,
  color,
}: {
  name: string | null;
  color: string | null;
}) {
  const classified = Boolean(name && color);
  return (
    <span className="inline-flex min-w-0 items-center gap-2 text-xs font-bold tracking-[1.5px] text-body uppercase">
      <span
        aria-hidden="true"
        className="size-2 shrink-0 rounded-full bg-muted"
        style={classified ? { backgroundColor: color! } : undefined}
      />
      <span className="truncate">{classified ? name : "기타"}</span>
    </span>
  );
}

export function NewsCard({
  article,
  now,
}: {
  article: DashboardArticle;
  now: number;
}) {
  const published = article.publishedAt ?? article.createdAt;
  const saved = article.savedAt !== null;
  // 이름과 색이 모두 있을 때만 분류된 기사로 본다. 막대 색에 쓴다.
  const categoryColor = article.categoryName ? article.categoryColor : null;

  return (
    <article className="group relative flex h-full flex-col gap-4 overflow-hidden border border-hairline bg-surface py-6 pr-6 pl-7 transition-colors duration-200 hover:border-foreground">
      {/* 카테고리 색 세로 막대: 호버하면 카드 높이만큼 늘어난다. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-6 left-0 w-1 bg-muted transition-[top,bottom] duration-200 group-hover:inset-y-0 motion-reduce:transition-none"
        style={categoryColor ? { backgroundColor: categoryColor } : undefined}
      />
      <DeleteButton articleId={article.id} />

      {/* 상단: 출처(좌), 게시 시각(우) */}
      <div className="flex items-baseline justify-between gap-3 pr-8 text-xs">
        <span className="font-bold tracking-[1.5px] text-foreground uppercase">
          {article.source}
        </span>
        <time
          dateTime={published.toISOString()}
          className="text-muted tabular-nums"
        >
          {formatPublished(published, now)}
        </time>
      </div>

      {/* 번역 전 기사는 원문 제목/발췌를 대신 보여준다. break-keep으로 한글을 어절 단위로 줄바꿈한다. */}
      <div className="flex flex-col gap-2.5">
        <h2 className="text-xl leading-snug font-bold tracking-tight break-keep text-foreground">
          {article.titleKo ?? article.title}
        </h2>
        {(article.summaryKo ?? article.excerpt) && (
          <p className="line-clamp-4 text-[15px] leading-7 font-light break-keep text-body">
            {article.summaryKo ?? article.excerpt}
          </p>
        )}
      </div>

      {/* 하단: 카테고리(좌), 원문 링크와 저장 버튼(우) */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-hairline pt-4">
        <CategoryLabel
          name={article.categoryName}
          color={article.categoryColor}
        />
        <div className="flex shrink-0 items-center gap-3">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold tracking-[1.5px] text-body uppercase transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            원문 보기 ↗
          </a>
          <SaveButton articleId={article.id} initialSaved={saved} />
        </div>
      </div>
    </article>
  );
}
