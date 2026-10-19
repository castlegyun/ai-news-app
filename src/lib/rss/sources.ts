export type FeedSource = {
  name: string;
  feedUrl: string;
};

export const FEED_SOURCES: FeedSource[] = [
  {
    name: "TechCrunch AI",
    feedUrl: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "The Verge AI",
    feedUrl: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
];

// 서버리스 타임아웃을 고려한 소스별 제한
export const FEED_TIMEOUT_MS = 10_000;
export const MAX_ITEMS_PER_SOURCE = 30;
export const EXCERPT_MAX_LENGTH = 300;
