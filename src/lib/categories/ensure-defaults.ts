import { db } from "@/db";
import { categories } from "@/db/schema";
import { getUserCategories } from "@/db/queries";

const DEFAULT_CATEGORIES = [
  { name: "모델/연구", color: "#6366F1", description: "새 AI 모델 발표, 벤치마크, 연구 논문, 기술적 돌파구" },
  { name: "제품/서비스", color: "#10B981", description: "AI 기능·앱·서비스 출시와 업데이트" },
  { name: "투자/비즈니스", color: "#F59E0B", description: "투자 유치, 인수합병, 실적, 기업 전략" },
  { name: "규제/정책", color: "#EF4444", description: "법률, 규제, 정부 정책, 소송, 안전·윤리 논의" },
  { name: "기타", color: "#6B7280", description: "위 어디에도 맞지 않는 기사" },
];

// 카테고리가 하나도 없는 사용자에게만 기본 카테고리를 시드한다.
export async function ensureDefaultCategories(userId: string) {
  if ((await getUserCategories(userId)).length > 0) return;
  await db
    .insert(categories)
    .values(DEFAULT_CATEGORIES.map((c, sortOrder) => ({ ...c, userId, sortOrder })))
    .onConflictDoNothing();
}
