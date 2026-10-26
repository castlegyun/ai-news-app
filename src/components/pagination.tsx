import Link from "next/link";

const itemBase =
  "inline-flex h-10 min-w-10 items-center justify-center border px-3 text-xs font-bold tracking-[1.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
const itemIdle =
  "border-hairline text-body hover:border-foreground hover:text-foreground";
const itemActive =
  "border-foreground bg-foreground text-background";
const itemDisabled =
  "cursor-not-allowed border-hairline text-muted opacity-60";

const PAGE_WINDOW = 2;

// 현재 페이지 주변만 보여주고 처음·끝 페이지는 항상 포함한다. 생략 구간은 null.
function pageItems(current: number, total: number) {
  const pages = new Set([1, total]);
  for (let p = current - PAGE_WINDOW; p <= current + PAGE_WINDOW; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const items: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push(null);
    items.push(p);
  });
  return items;
}

export function Pagination({
  page,
  totalPages,
  categoryId,
  keyword,
}: {
  page: number;
  totalPages: number;
  categoryId?: string;
  keyword?: string;
}) {
  if (totalPages <= 1) return null;

  // 1페이지는 page 파라미터를 생략해 URL을 깔끔하게 유지한다.
  const href = (p: number) => {
    const params = new URLSearchParams();
    if (categoryId) params.set("category", categoryId);
    if (keyword) params.set("q", keyword);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  };

  return (
    <nav
      aria-label="페이지"
      className="flex flex-wrap items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${itemBase} ${itemIdle}`}>
          이전
        </Link>
      ) : (
        <span aria-disabled="true" className={`${itemBase} ${itemDisabled}`}>
          이전
        </span>
      )}
      {pageItems(page, totalPages).map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-label={`${p}페이지`}
            aria-current={p === page ? "page" : undefined}
            className={`${itemBase} ${p === page ? itemActive : itemIdle}`}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={href(page + 1)} className={`${itemBase} ${itemIdle}`}>
          다음
        </Link>
      ) : (
        <span aria-disabled="true" className={`${itemBase} ${itemDisabled}`}>
          다음
        </span>
      )}
    </nav>
  );
}
