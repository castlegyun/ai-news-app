import { and, asc, count, desc, eq, sql } from "drizzle-orm";

import { db } from "./index";
import {
  articleCategories,
  articles,
  categories,
  savedArticles,
} from "./schema";

export const DASHBOARD_PAGE_SIZE = 9;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isCategoryId(value: string | undefined): value is string {
  return !!value && UUID_RE.test(value);
}

export async function getUserCategories(userId: string) {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
    })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.sortOrder), asc(categories.createdAt));
}

// 공용 기사에 사용자별 분류·Notion 저장 기록을 붙여 최신순으로 가져온다.
export async function getDashboardArticles(
  userId: string,
  categoryId?: string,
  page = 1,
) {
  return db
    .select({
      id: articles.id,
      source: articles.source,
      url: articles.url,
      title: articles.title,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      excerpt: articles.excerpt,
      publishedAt: articles.publishedAt,
      createdAt: articles.createdAt,
      categoryName: categories.name,
      categoryColor: categories.color,
      savedAt: savedArticles.savedAt,
    })
    .from(articles)
    .leftJoin(
      articleCategories,
      and(
        eq(articleCategories.articleId, articles.id),
        eq(articleCategories.userId, userId),
      ),
    )
    .leftJoin(categories, eq(categories.id, articleCategories.categoryId))
    .leftJoin(
      savedArticles,
      and(
        eq(savedArticles.articleId, articles.id),
        eq(savedArticles.userId, userId),
      ),
    )
    .where(
      categoryId ? eq(articleCategories.categoryId, categoryId) : undefined,
    )
    .orderBy(
      desc(sql`coalesce(${articles.publishedAt}, ${articles.createdAt})`),
      desc(articles.createdAt),
    )
    .limit(DASHBOARD_PAGE_SIZE)
    .offset((page - 1) * DASHBOARD_PAGE_SIZE);
}

// 페이지 수 계산용 전체 기사 수. 카테고리 필터는 getDashboardArticles와 같은 조건을 쓴다.
export async function getDashboardArticleCount(
  userId: string,
  categoryId?: string,
) {
  const query = db.select({ total: count() }).from(articles);
  const [row] = categoryId
    ? await query
        .innerJoin(
          articleCategories,
          and(
            eq(articleCategories.articleId, articles.id),
            eq(articleCategories.userId, userId),
          ),
        )
        .where(eq(articleCategories.categoryId, categoryId))
    : await query;
  return row.total;
}

// url이 이미 있는 기사는 건너뛰고, 실제로 새로 저장된 개수를 반환한다.
export async function insertArticles(rows: (typeof articles.$inferInsert)[]) {
  if (rows.length === 0) return 0;
  const inserted = await db
    .insert(articles)
    .values(rows)
    .onConflictDoNothing({ target: articles.url })
    .returning({ id: articles.id });
  return inserted.length;
}

export type DashboardArticle =Awaited<
  ReturnType<typeof getDashboardArticles>
>[number];
