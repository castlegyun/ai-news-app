import { auth } from "@clerk/nextjs/server";

import {
  getArticleForSave,
  isCategoryId,
  saveArticleRecord,
} from "@/db/queries";
import { createNotionPage } from "@/lib/notion/save";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const articleId = typeof body?.articleId === "string" ? body.articleId : "";
  // articleId도 UUID 형식이라 같은 검사를 재사용한다.
  if (!isCategoryId(articleId)) {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const article = await getArticleForSave(userId, articleId);
    if (!article) {
      return Response.json({ error: "기사를 찾을 수 없습니다." }, { status: 404 });
    }
    // 이미 저장한 기사는 Notion에 다시 만들지 않는다.
    if (article.savedAt) {
      return Response.json({ saved: true, alreadySaved: true });
    }

    const pageId = await createNotionPage({
      title: article.titleKo ?? article.title,
      summary: article.summaryKo ?? article.excerpt ?? "",
      category: article.categoryName ?? "기타",
      url: article.url,
      date: article.publishedAt ?? article.createdAt,
    });
    await saveArticleRecord(userId, articleId, pageId);

    return Response.json({ saved: true });
  } catch (error) {
    console.error("Notion 저장 실패", error);
    return Response.json(
      { error: "Notion에 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
