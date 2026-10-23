import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { CategoryBar } from "@/components/category-bar";
import { DashboardHeader } from "@/components/dashboard-header";
import { NewsCard, currentTime } from "@/components/news-card";
import { NewsCardSkeleton } from "@/components/news-card-skeleton";
import { NewsCountBadge } from "@/components/news-count-badge";
import { Pagination } from "@/components/pagination";
import { SearchBar } from "@/components/search-bar";
import {
  DASHBOARD_PAGE_SIZE,
  getDashboardArticleCount,
  getDashboardArticles,
  getTotalArticleCount,
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

  const { category, page: pageParam, q } = await searchParams;
  const requested = typeof category === "string" ? category : undefined;
  const categoryId = isCategoryId(requested) ? requested : undefined;
  const keyword =
    (typeof q === "string" ? q.trim() : "").slice(0, 100) || undefined;

  const [categories, total, totalAll] = await Promise.all([
    getUserCategories(userId),
    getDashboardArticleCount(userId, categoryId, keyword),
    getTotalArticleCount(),
  ]);
  // 잘못되었거나 범위를 벗어난 page 값은 가까운 유효 페이지로 맞춘다.
  const totalPages = Math.max(1, Math.ceil(total / DASHBOARD_PAGE_SIZE));
  const requestedPage = Number(typeof pageParam === "string" ? pageParam : 1);
  const page = Number.isInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const articles = await getDashboardArticles(
    userId,
    categoryId,
    page,
    keyword,
  );
  const now = currentTime();

  return (
    <>
      <NewsCountBadge total={totalAll} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <CategoryBar
          categories={categories}
          activeId={categoryId}
          keyword={keyword}
        />
        <SearchBar keyword={keyword} categoryId={categoryId} />
      </div>
      {keyword && (
        <p className="text-sm text-zinc-500">
          &lsquo;{keyword}&rsquo; 검색 결과 {total}건
        </p>
      )}
      {articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {keyword
            ? "검색 결과가 없습니다"
            : categoryId
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
      <Pagination
        page={page}
        totalPages={totalPages}
        categoryId={categoryId}
        keyword={keyword}
      />
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="불러오는 중" className="space-y-6">
      <div className="flex justify-between gap-3">
        <div className="h-9 w-72 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="hidden h-10 w-96 animate-pulse rounded-lg bg-zinc-200 lg:block dark:bg-zinc-800" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
