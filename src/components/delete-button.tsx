"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function DeleteButton({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  async function handleClick() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/news/${articleId}`, { method: "DELETE" });
      const data: { error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "기사를 삭제하지 못했습니다. 다시 시도해 주세요.");
        setDeleting(false);
        return;
      }
      // 목록을 다시 불러와 카드가 사라지게 한다.
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={deleting}
        aria-label="기사 삭제"
        className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        <span aria-hidden="true">✕</span>
      </button>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4"
      >
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
    </>
  );
}
