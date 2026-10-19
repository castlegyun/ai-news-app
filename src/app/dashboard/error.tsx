"use client";

export default function DashboardError({ retry }: { retry: () => void }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div
        role="alert"
        className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
      >
        뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        <button
          type="button"
          onClick={() => retry()}
          className="shrink-0 font-medium underline underline-offset-2"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
