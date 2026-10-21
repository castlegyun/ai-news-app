import { and, asc, count, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";

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

// 원문·한국어 제목과 요약에서 키워드를 찾는다. LIKE 와일드카드는 이스케이프한다.
function keywordFilter(keyword?: string) {
  if (!keyword) return undefined;
  const pattern = `%${keyword.replace(/[\\%_]/g, "\\$&")}%`;
  return or(
    ilike(articles.title, pattern),
    ilike(articles.titleKo, pattern),
    ilike(articles.summaryKo, pattern),
    ilike(articles.excerpt, pattern),
  );
}

export async function getUserCategories(userId: string) {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
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
  keyword?: string,
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
      and(
        categoryId ? eq(articleCategories.categoryId, categoryId) : undefined,
        keywordFilter(keyword),
      ),
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
  keyword?: string,
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
        .where(
          and(
            eq(articleCategories.categoryId, categoryId),
            keywordFilter(keyword),
          ),
        )
    : await query.where(keywordFilter(keyword));
  return row.total;
}

// url이 이미 있는 기사는 건너뛰고, 실제로 새로 저장된 기사 행을 반환한다.
export async function insertArticles(rows: (typeof articles.$inferInsert)[]) {
  if (rows.length === 0) return [];
  return db
    .insert(articles)
    .values(rows)
    .onConflictDoNothing({ target: articles.url })
    .returning({
      id: articles.id,
      title: articles.title,
      excerpt: articles.excerpt,
    });
}

// 번역·요약이 아직 없는 기사(이전 실행에서 실패한 것 포함).
export async function getUntranslatedArticles(limit: number) {
  return db
    .select({
      id: articles.id,
      title: articles.title,
      excerpt: articles.excerpt,
    })
    .from(articles)
    .where(isNull(articles.titleKo))
    .orderBy(desc(articles.createdAt))
    .limit(limit);
}

export async function updateArticleTranslations(
  rows: { id: string; titleKo: string; summaryKo: string }[],
) {
  await Promise.all(
    rows.map((r) =>
      db
        .update(articles)
        .set({ titleKo: r.titleKo, summaryKo: r.summaryKo })
        .where(eq(articles.id, r.id)),
    ),
  );
}

// 번역은 끝났지만 이 사용자에게는 아직 분류되지 않은 기사.
export async function getUnclassifiedArticles(userId: string, limit: number) {
  return db
    .select({
      id: articles.id,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
    })
    .from(articles)
    .leftJoin(
      articleCategories,
      and(
        eq(articleCategories.articleId, articles.id),
        eq(articleCategories.userId, userId),
      ),
    )
    .where(
      and(
        sql`${articles.titleKo} is not null`,
        isNull(articleCategories.articleId),
      ),
    )
    .orderBy(desc(articles.createdAt))
    .limit(limit);
}

export async function saveArticleCategories(
  userId: string,
  rows: { id: string; categoryId: string }[],
) {
  if (rows.length === 0) return;
  await db
    .insert(articleCategories)
    .values(
      rows.map((r) => ({ userId, articleId: r.id, categoryId: r.categoryId })),
    )
    .onConflictDoNothing();
}

// Notion 저장에 필요한 기사 정보와 이 사용자의 카테고리·저장 기록.
export async function getArticleForSave(userId: string, articleId: string) {
  const [row] = await db
    .select({
      title: articles.title,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      excerpt: articles.excerpt,
      url: articles.url,
      publishedAt: articles.publishedAt,
      createdAt: articles.createdAt,
      categoryName: categories.name,
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
    .where(eq(articles.id, articleId))
    .limit(1);
  return row;
}

export async function saveArticleRecord(
  userId: string,
  articleId: string,
  notionPageId: string,
) {
  await db
    .insert(savedArticles)
    .values({ userId, articleId, notionPageId })
    .onConflictDoNothing();
}

// article_categories, saved_articles는 onDelete cascade로 함께 지워진다.
export async function deleteArticle(articleId: string) {
  const rows = await db
    .delete(articles)
    .where(eq(articles.id, articleId))
    .returning({ id: articles.id });
  return rows.length > 0;
}

export type DashboardArticle =Awaited<
  ReturnType<typeof getDashboardArticles>
>[number];
