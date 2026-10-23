export function NewsCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full animate-pulse flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-5 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="mt-auto flex items-center justify-between pt-2">
        <div className="h-5 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-7 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
