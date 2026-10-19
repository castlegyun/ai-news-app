import { type NewArticle, fetchFeed } from "./fetch-feed";
import { FEED_SOURCES, MAX_ITEMS_PER_SOURCE } from "./sources";

const DAY_MS = 24 * 60 * 60 * 1000;

export type CollectResult = {
  articles: NewArticle[];
  failedSources: string[];
};

// 두 피드를 병렬로 수집해 지난 24시간 안에 게시된 기사만 반환한다.
// 게시 시각이 없는 항목은 24시간 기준을 판단할 수 없으므로 건너뛴다.
export async function collectRecentArticles(
  now = Date.now(),
): Promise<CollectResult> {
  const since = now - DAY_MS;

  const results = await Promise.allSettled(
    FEED_SOURCES.map((source) => fetchFeed(source)),
  );

  const articles: NewArticle[] = [];
  const failedSources: string[] = [];

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`RSS 수집 실패: ${FEED_SOURCES[i].name}`, result.reason);
      failedSources.push(FEED_SOURCES[i].name);
      return;
    }
    const recent = result.value
      .filter((a) => a.publishedAt && a.publishedAt.getTime() >= since)
      .sort((a, b) => b.publishedAt!.getTime() - a.publishedAt!.getTime())
      .slice(0, MAX_ITEMS_PER_SOURCE);
    articles.push(...recent);
  });

  return { articles, failedSources };
}
