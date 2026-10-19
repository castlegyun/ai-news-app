import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// userId는 Clerk 사용자 ID(text)이며 별도 users 테이블이 없으므로 FK를 걸지 않는다.

// 뉴스: 사용자 간 공용
export const articles = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: text("source").notNull(),
    url: text("url").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    imageUrl: text("image_url"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    titleKo: text("title_ko"),
    summaryKo: text("summary_ko"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("articles_published_at_idx").on(t.publishedAt.desc())],
);

// 카테고리: 사용자별
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    // 분류 프롬프트에 쓰이는 힌트
    description: text("description"),
    color: text("color").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique("categories_user_id_name_unique").on(t.userId, t.name),
    index("categories_user_id_idx").on(t.userId),
  ],
);

// 분류 결과: 사용자당 기사 1개 카테고리. 카테고리가 삭제되면 categoryId가 null(미분류)이 된다.
export const articleCategories = pgTable(
  "article_categories",
  {
    userId: text("user_id").notNull(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.articleId] }),
    index("article_categories_category_id_idx").on(t.categoryId),
  ],
);

// Notion 연결: 토큰은 앱 레벨에서 암호화한 문자열만 저장한다.
export const notionConnections = pgTable("notion_connections", {
  userId: text("user_id").primaryKey(),
  accessTokenEnc: text("access_token_enc").notNull(),
  refreshTokenEnc: text("refresh_token_enc"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  // 저장 대상(페이지 vs 데이터베이스)은 미확정
  targetType: text("target_type"),
  targetId: text("target_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Notion 저장 기록: (userId, articleId) 중복 저장 방지
export const savedArticles = pgTable(
  "saved_articles",
  {
    userId: text("user_id").notNull(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    notionPageId: text("notion_page_id").notNull(),
    savedAt: timestamp("saved_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.articleId] })],
);

export const articlesRelations = relations(articles, ({ many }) => ({
  articleCategories: many(articleCategories),
  savedArticles: many(savedArticles),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  articleCategories: many(articleCategories),
}));

export const articleCategoriesRelations = relations(
  articleCategories,
  ({ one }) => ({
    article: one(articles, {
      fields: [articleCategories.articleId],
      references: [articles.id],
    }),
    category: one(categories, {
      fields: [articleCategories.categoryId],
      references: [categories.id],
    }),
  }),
);

export const savedArticlesRelations = relations(savedArticles, ({ one }) => ({
  article: one(articles, {
    fields: [savedArticles.articleId],
    references: [articles.id],
  }),
}));
