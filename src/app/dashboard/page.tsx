import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { CategoryBar } from "@/components/category-bar";
import { DashboardHeader } from "@/components/dashboard-header";
import { NewsCard, currentTime } from "@/components/news-card";
import {
  getDashboardArticles,
  getUserCategories,
  isCategoryId,
} from "@/db/queries";

export const metadata: Metadata = { title: "대시보드 | AI 뉴스 수집기" };

export default function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

// 사용자 세션과 쿼리 문자열을 읽으므로 Suspense 안에서 요청 시점에 렌더링한다.
async function DashboardContent({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard">["searchParams"];
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { category } = await searchParams;
  const requested = typeof category === "string" ? category : undefined;
  const categoryId = isCategoryId(requested) ? requested : undefined;

  const [categories, articles] = await Promise.all([
    getUserCategories(userId),
    getDashboardArticles(userId, categoryId),
  ]);
  const now = currentTime();

  return (
    <>
      <CategoryBar categories={categories} activeId={categoryId} />
      {articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {categoryId
            ? "이 카테고리에 해당하는 기사가 없습니다"
            : "아직 가져온 뉴스가 없습니다"}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} now={now} />
          ))}
        </div>
      )}
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="불러오는 중" className="space-y-6">
      <div className="h-9 w-72 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-52 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
    </div>
  );
}
