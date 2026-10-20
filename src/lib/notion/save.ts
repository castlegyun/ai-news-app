const NOTION_VERSION = "2022-06-28";
// rich_text 한 덩어리의 길이 상한
const MAX_TEXT = 2000;

export type NotionArticle = {
  title: string;
  summary: string;
  category: string;
  url: string;
  date: Date;
};

// 'AI 뉴스 북마크' 데이터베이스(제목/요약/카테고리/출처/날짜)에 기사 1건을 페이지로 만들고 페이지 ID를 반환한다.
export async function createNotionPage(article: NotionArticle) {
  const token = process.env.NOTION_API_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) {
    throw new Error("NOTION_API_TOKEN 또는 NOTION_DATABASE_ID가 설정되지 않았습니다.");
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        제목: { title: [{ text: { content: article.title.slice(0, MAX_TEXT) } }] },
        요약: {
          rich_text: [{ text: { content: article.summary.slice(0, MAX_TEXT) } }],
        },
        카테고리: { select: { name: article.category } },
        출처: { url: article.url },
        날짜: { date: { start: article.date.toISOString() } },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Notion API 오류 ${res.status}: ${await res.text()}`);
  }
  const page: { id: string } = await res.json();
  return page.id;
}
