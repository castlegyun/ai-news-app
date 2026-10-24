export function NewsCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full animate-pulse flex-col gap-4 rounded-xl border border-zinc-200 bg-white py-6 pr-6 pl-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
