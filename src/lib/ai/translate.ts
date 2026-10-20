import { askJson } from "./client";
import { runBatches } from "./batch";

export type TranslateInput = { id: string; title: string; excerpt: string };
export type Translation = { id: string; titleKo: string; summaryKo: string };

const SYSTEM = `You translate and summarize English AI news into Korean.
For each article return:
- titleKo: a natural Korean headline (keep company and product names in their original form).
- summaryKo: a 2-3 sentence Korean summary based only on the given title and excerpt. Do not invent facts.
Return every input id exactly once.`;

const SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          titleKo: { type: "string" },
          summaryKo: { type: "string" },
        },
        required: ["id", "titleKo", "summaryKo"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
};

// 신규 기사 한국어 제목·요약. 입력 id에 없는 결과는 버린다.
export async function translateAndSummarize(
  items: TranslateInput[],
): Promise<Translation[]> {
  const ids = new Set(items.map((i) => i.id));
  const results = await runBatches(items, async (batch) => {
    const { items: out } = await askJson<{ items: Translation[] }>(
      SYSTEM,
      JSON.stringify(batch),
      SCHEMA,
    );
    return out;
  });
  return results.filter((r) => ids.has(r.id));
}
