import { auth } from "@clerk/nextjs/server";

import { insertArticles } from "@/db/queries";
import { collectRecentArticles } from "@/lib/rss/collect";
import { FEED_SOURCES } from "@/lib/rss/sources";

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

    return Response.json({
      fetched: unique.length,
      inserted,
      skipped: unique.length - inserted,
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
