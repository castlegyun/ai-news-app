import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "./index";
import {
  articleCategories,
  articles,
  categories,
  savedArticles,
} from "./schema";

const DASHBOARD_ARTICLE_LIMIT = 60;

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
    .limit(DASHBOARD_ARTICLE_LIMIT);
}

export type DashboardArticle = Awaited<
  ReturnType<typeof getDashboardArticles>
>[number];
