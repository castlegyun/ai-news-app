"use client";

import { UserButton } from "@clerk/nextjs";

import { FetchNewsButton } from "@/components/fetch-news-button";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-background/95 px-4 pt-3 pb-4 backdrop-blur sm:px-6">
      {/* M 삼색 스트라이프: 브랜드 식별용 4px 구분선 */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex h-1">
        <span className="flex-1 bg-[#0066b1]" />
        <span className="flex-1 bg-[#1c69d4]" />
        <span className="flex-1 bg-[#e22718]" />
      </div>
      <h1 className="text-xl font-bold tracking-[1.5px] text-foreground uppercase">
        AI 뉴스 수집기
      </h1>
      <div className="flex items-center gap-3">
        <FetchNewsButton />
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  );
}
