import Link from "next/link";

const chipBase =
  "border-b-2 px-1 py-3 text-base font-bold tracking-[1.5px] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
const chipIdle =
  "border-transparent text-body hover:border-hairline hover:text-foreground";
const chipActive =
  "border-foreground text-foreground";

type Category = { id: string; name: string };

export function CategoryBar({
  categories,
  activeId,
  keyword,
}: {
  categories: Category[];
  activeId?: string;
  keyword?: string;
}) {
  // 검색어가 있으면 카테고리를 바꿔도 유지한다.
  const href = (categoryId?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.set("category", categoryId);
    if (keyword) params.set("q", keyword);
    const qs = params.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  };

  return (
    <nav aria-label="카테고리" className="flex flex-wrap items-center gap-x-8 gap-y-2">
      <Link
        href={href()}
        aria-current={activeId ? undefined : "true"}
        className={`${chipBase} ${activeId ? chipIdle : chipActive}`}
      >
        전체
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={href(c.id)}
          aria-current={activeId === c.id ? "true" : undefined}
          className={`${chipBase} ${activeId === c.id ? chipActive : chipIdle}`}
        >
          {c.name}
        </Link>
      ))}
      {/* 카테고리 CRUD 구현 전까지 비활성 */}
      <button
        type="button"
        disabled
        title="준비 중입니다"
        className="inline-flex items-center gap-1 px-1 py-3 text-base font-bold tracking-[1.5px] text-muted uppercase transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        + 카테고리 추가
      </button>
    </nav>
  );
}
