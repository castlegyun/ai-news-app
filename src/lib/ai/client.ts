import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-haiku-5-5";

const client = new Anthropic();

// 구조화 출력(JSON 스키마)으로 한 번 호출하고 파싱된 결과를 돌려준다.
// 번역·분류는 단순 작업이라 effort를 낮춰 비용과 지연을 줄인다.
export async function askJson<T>(
  system: string,
  user: string,
  schema: Record<string, unknown>,
): Promise<T> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system,
    messages: [{ role: "user", content: user }],
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema },
    },
  });

  if (response.stop_reason === "max_tokens" || response.stop_reason === "refusal") {
    throw new Error(`Claude 응답이 완료되지 않았습니다 (${response.stop_reason})`);
  }
  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("Claude 응답에 텍스트가 없습니다");
  return JSON.parse(text.text) as T;
}
