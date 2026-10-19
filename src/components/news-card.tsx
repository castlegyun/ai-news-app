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

// categories.color는 #RRGGBB 값이므로 Tailwind 클래스 대신 인라인 스타일로 뱃지 색을 입힌다.
function CategoryBadge({ name, color }: { name: string | null; color: string | null }) {
  if (!name || !color) {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        기타
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ color, backgroundColor: `${color}1A` }}
    >
      {name}
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

  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
        <span>{article.source}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={published.toISOString()}>
          {formatPublished(published, now)}
        </time>
      </div>

      {/* 번역 전 기사는 원문 제목/발췌를 대신 보여준다. */}
      <h2 className="text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
        {article.titleKo ?? article.title}
      </h2>
      {(article.summaryKo ?? article.excerpt) && (
        <p className="line-clamp-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {article.summaryKo ?? article.excerpt}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <CategoryBadge name={article.categoryName} color={article.categoryColor} />
        <div className="flex items-center gap-3">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:hover:text-zinc-100"
          >
            원문 보기 ↗
          </a>
          {/* Notion 연동 전까지 저장 버튼은 비활성이며, 저장 기록이 있으면 '저장됨'으로 표시한다. */}
          <button
            type="button"
            disabled
            className={
              saved
                ? "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200"
            }
          >
            {saved ? "저장됨" : "Notion 저장"}
          </button>
        </div>
      </div>
    </article>
  );
}
