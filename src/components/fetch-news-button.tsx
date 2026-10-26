"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type Message = { kind: "success" | "error"; text: string };

type FetchResponse = {
  inserted?: number;
  translated?: number;
  failedSources?: string[];
  error?: string;
};

export function FetchNewsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/news/fetch", { method: "POST" });
      const data: FetchResponse = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({
          kind: "error",
          text: data.error ?? "뉴스를 가져오지 못했습니다. 다시 시도해 주세요.",
        });
        return;
      }
      const inserted = data.inserted ?? 0;
      const failed = data.failedSources ?? [];
      const base =
        inserted > 0 ? `새 기사 ${inserted}건을 가져왔습니다` : "새 기사가 없습니다";
      const translated = data.translated ?? 0;
      const pendingAi = inserted > translated;
      setMessage({
        kind: "success",
        text: [
          base,
          pendingAi ? `(번역 ${inserted - translated}건 대기, 다시 시도해 주세요)` : "",
          failed.length ? `(${failed.join(", ")} 수집 실패)` : "",
        ]
          .filter(Boolean)
          .join(" "),
      });
      startRefresh(() => router.refresh());
    } catch {
      setMessage({
        kind: "error",
        text: "네트워크 오류가 발생했습니다. 다시 시도해 주세요.",
      });
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || refreshing;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex h-10 items-center gap-2 border border-foreground bg-foreground px-5 text-xs font-bold tracking-[1.5px] text-background uppercase transition-colors hover:bg-transparent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy && (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-background/40 border-t-background"
          />
        )}
        {busy ? "가져오는 중…" : "뉴스 가져오기"}
      </button>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4"
      >
        {message && (
          <p
            className={
              message.kind === "error"
                ? "border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                : "bg-foreground px-4 py-2.5 text-sm text-background"
            }
          >
            {message.text}
          </p>
        )}
      </div>
    </>
  );
}
