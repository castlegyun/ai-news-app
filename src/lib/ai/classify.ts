import { askJson } from "./client";
import { runBatches } from "./batch";

export type ClassifyInput = { id: string; titleKo: string; summaryKo: string };
export type ClassifyCategory = { id: string; name: string; description: string | null };
export type Classification = { id: string; categoryId: string };

// 사용자 카테고리(이름+설명)를 기준으로 기사를 분류한다.
// categoryId를 enum으로 제한해 존재하지 않는 값이 나오지 않게 한다.
export async function classifyArticles(
  items: ClassifyInput[],
  categories: ClassifyCategory[],
): Promise<Classification[]> {
  if (items.length === 0 || categories.length === 0) return [];

  const system = `You classify Korean AI news articles into exactly one of the user's categories.
Categories (id: name - description):
${categories.map((c) => `${c.id}: ${c.name} - ${c.description ?? ""}`).join("\n")}
If no category fits, choose the catch-all category ("기타") when present.
Return every input id exactly once.`;

  const schema = {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            categoryId: { type: "string", enum: categories.map((c) => c.id) },
          },
          required: ["id", "categoryId"],
          additionalProperties: false,
        },
      },
    },
    required: ["items"],
    additionalProperties: false,
  };

  const ids = new Set(items.map((i) => i.id));
  const results = await runBatches(items, async (batch) => {
    const { items: out } = await askJson<{ items: Classification[] }>(
      system,
      JSON.stringify(batch),
      schema,
    );
    return out;
  });
  return results.filter((r) => ids.has(r.id));
}
