import { auth } from "@clerk/nextjs/server";

import {
  getUnclassifiedArticles,
  getUntranslatedArticles,
  getUserCategories,
  insertArticles,
  saveArticleCategories,
  updateArticleTranslations,
} from "@/db/queries";
import { classifyArticles } from "@/lib/ai/classify";
import { translateAndSummarize } from "@/lib/ai/translate";
import { ensureDefaultCategories } from "@/lib/categories/ensure-defaults";
import { collectRecentArticles } from "@/lib/rss/collect";
import { FEED_SOURCES } from "@/lib/rss/sources";

// Claude 배치 호출이 있어 기본 타임아웃보다 길게 잡는다.
export const maxDuration = 60;

// 한 번에 처리할 번역·분류 대상 상한. 실패분은 다음 가져오기에서 이어서 처리한다.
const AI_LIMIT = 60;

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { articles, failedSources } = await collectRecentArticles();

    if (failedSources.length === FEED_SOURCES.length) {
      return Response.json(
        {
          error: "뉴스 피드를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          failedSources,
        },
        { status: 502 },
      );
    }

    // 같은 URL이 두 소스에 겹쳐도 한 번만 insert하도록 URL 기준으로 합친다.
    const unique = [...new Map(articles.map((a) => [a.url, a])).values()];
    const inserted = await insertArticles(unique);

    // 번역·요약은 공용이라 기사당 1회만: 방금 저장한 기사 + 이전에 실패한 기사.
    const pending = new Map(
      [...inserted, ...(await getUntranslatedArticles(AI_LIMIT))].map((a) => [
        a.id,
        { id: a.id, title: a.title, excerpt: a.excerpt ?? "" },
      ]),
    );
    const translations = await translateAndSummarize([...pending.values()]);
    await updateArticleTranslations(translations);

    // 분류는 사용자별: 이 사용자에게 아직 분류되지 않은 번역 완료 기사.
    await ensureDefaultCategories(userId);
    const userCategories = await getUserCategories(userId);
    const unclassified = await getUnclassifiedArticles(userId, AI_LIMIT);
    const classifications = await classifyArticles(
      unclassified.map((a) => ({
        id: a.id,
        titleKo: a.titleKo ?? "",
        summaryKo: a.summaryKo ?? "",
      })),
      userCategories,
    );
    await saveArticleCategories(userId, classifications);

    return Response.json({
      fetched: unique.length,
      inserted: inserted.length,
      skipped: unique.length - inserted.length,
      translated: translations.length,
      classified: classifications.length,
      failedSources,
    });
  } catch (error) {
    console.error("뉴스 가져오기 실패", error);
    return Response.json(
      { error: "뉴스를 저장하는 중 오류가 발생했습니다. 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
