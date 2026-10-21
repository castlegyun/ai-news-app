import Link from "next/link";

// GET 폼이라 '검색' 버튼 클릭과 Enter 키 모두 /dashboard?q=... 로 이동한다.
// 선택된 카테고리는 hidden 입력으로 유지하고, 페이지는 1페이지로 돌아간다.
export function SearchBar({
  keyword,
  categoryId,
}: {
  keyword?: string;
  categoryId?: string;
}) {
  const clearHref = categoryId
    ? `/dashboard?category=${categoryId}`
    : "/dashboard";

  return (
    <form
      action="/dashboard"
      role="search"
      aria-label="뉴스 검색"
      className="flex w-full gap-2 lg:w-96 lg:shrink-0"
    >
      {categoryId && <input type="hidden" name="category" value={categoryId} />}
      <input
        type="search"
        name="q"
        defaultValue={keyword}
        maxLength={100}
        placeholder="키워드로 뉴스 검색"
        aria-label="검색어"
        className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        검색
      </button>
      {keyword && (
        <Link
          href={clearHref}
          className="inline-flex shrink-0 items-center rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          초기화
        </Link>
      )}
    </form>
  );
}
