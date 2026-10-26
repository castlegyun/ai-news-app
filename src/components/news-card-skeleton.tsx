export function NewsCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full animate-pulse flex-col gap-4 border border-hairline bg-surface py-6 pr-6 pl-7"
    >
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 bg-hairline" />
        <div className="h-3 w-12 bg-hairline" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-4/5 bg-hairline" />
        <div className="h-3 w-full bg-hairline" />
        <div className="h-3 w-full bg-hairline" />
        <div className="h-3 w-2/3 bg-hairline" />
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-hairline pt-4">
        <div className="h-4 w-20 bg-hairline" />
        <div className="h-8 w-24 bg-hairline" />
      </div>
    </div>
  );
}
