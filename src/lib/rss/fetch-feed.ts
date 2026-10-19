import Parser from "rss-parser";

import type { articles } from "@/db/schema";

import { EXCERPT_MAX_LENGTH, FEED_TIMEOUT_MS, type FeedSource } from "./sources";

export type NewArticle = typeof articles.$inferInsert;

type MediaNode = { $?: { url?: string } } | string;

type FeedItem = {
  mediaContent?: MediaNode[];
  mediaThumbnail?: MediaNode;
};

const parser = new Parser<Record<string, never>, FeedItem>({
  timeout: FEED_TIMEOUT_MS,
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail"],
    ],
  },
});

const TRACKING_PARAM = /^(utm_|fbclid$|gclid$|mc_)/i;

// 추적 파라미터와 해시를 제거해 같은 기사가 다른 URL로 중복 저장되지 않게 한다.
function normalizeUrl(raw: string) {
  try {
    const url = new URL(raw.trim());
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_PARAM.test(key)) url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return null;
  }
}

function toExcerpt(html: string | undefined) {
  if (!html) return null;
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  return text.length > EXCERPT_MAX_LENGTH
    ? `${text.slice(0, EXCERPT_MAX_LENGTH).trimEnd()}…`
    : text;
}

function mediaUrl(node: MediaNode | undefined) {
  if (!node || typeof node === "string") return undefined;
  return node.$?.url;
}

// The Verge(Atom)는 미디어 태그 없이 본문 HTML 안에만 이미지가 있다.
function firstImgSrc(html: string | undefined) {
  const src = html?.match(/<img\b[^>]*?\ssrc=["']([^"']+)["']/i)?.[1];
  return src?.replace(/&#0*38;|&amp;/g, "&");
}

function pickImageUrl(
  item: FeedItem & {
    enclosure?: { url?: string; type?: string };
    content?: string;
  },
) {
  const candidate =
    mediaUrl(item.mediaContent?.[0]) ??
    mediaUrl(item.mediaThumbnail) ??
    (item.enclosure?.type?.startsWith("image/") ? item.enclosure.url : undefined) ??
    firstImgSrc(item.content);
  return candidate ? (normalizeUrl(candidate) ?? null) : null;
}

export async function fetchFeed(source: FeedSource): Promise<NewArticle[]> {
  const feed = await parser.parseURL(source.feedUrl);
  const items: NewArticle[] = [];

  for (const item of feed.items) {
    const url = item.link ? normalizeUrl(item.link) : null;
    const title = item.title?.trim();
    if (!url || !title) continue;

    const publishedAt = item.isoDate ? new Date(item.isoDate) : null;

    items.push({
      source: source.name,
      url,
      title,
      excerpt: toExcerpt(item.contentSnippet ?? item.summary ?? item.content),
      imageUrl: pickImageUrl(item),
      publishedAt:
        publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
    });
  }

  return items;
}
