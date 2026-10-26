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
        className="h-10 min-w-0 flex-1 border border-hairline bg-surface px-4 text-sm font-light text-foreground placeholder:text-muted focus-visible:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      />
      <button
        type="submit"
        className="h-10 shrink-0 border border-foreground bg-foreground px-5 text-xs font-bold tracking-[1.5px] text-background uppercase transition-colors hover:bg-transparent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        검색
      </button>
      {keyword && (
        <Link
          href={clearHref}
          className="inline-flex h-10 shrink-0 items-center border border-foreground px-4 text-xs font-bold tracking-[1.5px] text-foreground uppercase transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          초기화
        </Link>
      )}
    </form>
  );
}
