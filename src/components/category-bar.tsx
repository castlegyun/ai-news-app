import Link from "next/link";

const chipBase =
  "rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
const chipIdle =
  "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";
const chipActive =
  "border-transparent bg-indigo-600 text-white hover:bg-indigo-600 dark:bg-indigo-500";

type Category = { id: string; name: string };

export function CategoryBar({
  categories,
  activeId,
}: {
  categories: Category[];
  activeId?: string;
}) {
  return (
    <nav aria-label="카테고리" className="flex flex-wrap items-center gap-2">
      <Link
        href="/dashboard"
        aria-current={activeId ? undefined : "true"}
        className={`${chipBase} ${activeId ? chipIdle : chipActive}`}
      >
        전체
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/dashboard?category=${c.id}`}
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
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-zinc-300 px-3.5 py-1.5 text-sm text-zinc-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
      >
        + 카테고리 추가
      </button>
    </nav>
  );
}
