import Link from "next/link";

const itemBase =
  "inline-flex min-w-9 items-center justify-center rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
const itemIdle =
  "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";
const itemActive =
  "border-transparent bg-indigo-600 font-medium text-white dark:bg-indigo-500";
const itemDisabled =
  "cursor-not-allowed border-zinc-200 text-zinc-400 opacity-60 dark:border-zinc-800 dark:text-zinc-600";

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
}: {
  page: number;
  totalPages: number;
  categoryId?: string;
}) {
  if (totalPages <= 1) return null;

  // 1페이지는 page 파라미터를 생략해 URL을 깔끔하게 유지한다.
  const href = (p: number) => {
    const params = new URLSearchParams();
    if (categoryId) params.set("category", categoryId);
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
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-zinc-500">
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
