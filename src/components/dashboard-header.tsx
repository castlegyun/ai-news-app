"use client";

import { UserButton } from "@clerk/nextjs";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 dark:border-zinc-800 dark:bg-zinc-900/80">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        AI 뉴스 수집기
      </h1>
      <UserButton />
    </header>
  );
}
