import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

const USER_ID = "user_sample_001";

const sampleCategories = [
  { name: "모델/연구", color: "#6366F1", description: "새 AI 모델 발표, 벤치마크, 연구 논문, 기술적 돌파구" },
  { name: "제품/서비스", color: "#10B981", description: "AI 기능·앱·서비스 출시와 업데이트" },
  { name: "투자/비즈니스", color: "#F59E0B", description: "투자 유치, 인수합병, 실적, 기업 전략" },
  { name: "규제/정책", color: "#EF4444", description: "법률, 규제, 정부 정책, 소송, 안전·윤리 논의" },
  { name: "기타", color: "#6B7280", description: "위 어디에도 맞지 않는 기사" },
];

const sampleArticles = [
  {
    category: "모델/연구",
    source: "TechCrunch AI",
    url: "https://techcrunch.com/2026/10/19/example-anthropic-reasoning-model/",
    title: "Anthropic unveils a new reasoning model aimed at long-running agent tasks",
    excerpt: "The new model is built for multi-step work such as coding and research, with improved tool-use reliability.",
    imageUrl: "https://example.com/images/sample-1.jpg",
    publishedAt: new Date("2026-10-19T14:30:00Z"),
    titleKo: "앤트로픽, 장시간 에이전트 작업을 겨냥한 새 추론 모델 공개",
    summaryKo:
      "앤트로픽이 여러 단계를 거치는 장시간 작업에 특화된 새 추론 모델을 공개했다. 코딩·리서치 벤치마크에서 이전 세대보다 향상된 성능을 보였고, 도구 호출 안정성도 개선됐다고 회사는 밝혔다.",
  },
  {
    category: "제품/서비스",
    source: "The Verge AI",
    url: "https://www.theverge.com/2026/10/19/example-chrome-android-ai-summaries",
    title: "Google adds on-device AI summaries to Chrome for Android",
    excerpt: "Chrome can now summarize web pages locally, without sending data to Google's servers.",
    imageUrl: null,
    publishedAt: new Date("2026-10-19T09:10:00Z"),
    titleKo: "구글, 안드로이드 크롬에 온디바이스 AI 요약 기능 추가",
    summaryKo:
      "구글이 안드로이드용 크롬에 웹페이지를 기기 안에서 요약해 주는 기능을 도입한다. 데이터가 서버로 전송되지 않아 개인정보 부담이 적으며, 일부 최신 기기부터 순차 제공된다.",
  },
  {
    category: "투자/비즈니스",
    source: "TechCrunch AI",
    url: "https://techcrunch.com/2026/10/18/example-ai-infra-startup-raises-400m/",
    title: "AI infrastructure startup raises $400M at a $5B valuation",
    excerpt: "The company will use the funding to expand data centers and hire engineers.",
    imageUrl: "https://example.com/images/sample-3.jpg",
    publishedAt: new Date("2026-10-18T20:45:00Z"),
    titleKo: "AI 인프라 스타트업, 기업가치 50억 달러에 4억 달러 투자 유치",
    summaryKo:
      "AI 추론용 클라우드 인프라를 제공하는 스타트업이 4억 달러 규모 투자를 유치했다. 기업가치는 50억 달러로 평가됐으며, 조달 자금은 데이터센터 확충과 인력 채용에 쓰일 예정이다.",
  },
  {
    category: "규제/정책",
    source: "The Verge AI",
    url: "https://www.theverge.com/2026/10/18/example-eu-gpai-transparency-guidelines",
    title: "EU finalizes guidelines for general-purpose AI model transparency",
    excerpt: "Providers must publish training data summaries and copyright compliance policies.",
    imageUrl: null,
    publishedAt: new Date("2026-10-18T11:00:00Z"),
    titleKo: "EU, 범용 AI 모델 투명성 지침 확정",
    summaryKo:
      "유럽연합이 범용 AI 모델 제공자에게 학습 데이터 요약과 저작권 준수 정책 공개를 요구하는 지침을 확정했다. 기업들은 내년부터 단계적으로 적용을 받는다.",
  },
  {
    category: "기타",
    source: "TechCrunch AI",
    url: "https://techcrunch.com/2026/10/17/example-ai-music-streaming-flood/",
    title: "Why AI-generated music is flooding streaming platforms",
    excerpt: "Platforms are weighing labeling rules and royalty policies as AI tracks surge.",
    imageUrl: "https://example.com/images/sample-5.jpg",
    publishedAt: new Date("2026-10-17T16:20:00Z"),
    titleKo: "AI 생성 음악이 스트리밍 플랫폼에 넘쳐나는 이유",
    summaryKo:
      "AI로 만든 음악이 스트리밍 플랫폼에 급증하면서 플랫폼들이 라벨링과 수익 배분 기준을 고민하고 있다. 아티스트 단체는 투명한 표시 의무화를 요구하고 있다.",
  },
];

async function main() {
  // DATABASE_URL을 읽는 db 모듈은 dotenv 로드 이후에 불러온다.
  const { db } = await import("./index");
  const { articles, categories, articleCategories } = await import("./schema");

  await db
    .insert(categories)
    .values(
      sampleCategories.map((c, i) => ({ ...c, userId: USER_ID, sortOrder: i })),
    )
    .onConflictDoNothing();

  const categoryRows = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, USER_ID));
  const categoryIdByName = new Map(categoryRows.map((c) => [c.name, c.id]));

  for (const { category, ...article } of sampleArticles) {
    await db.insert(articles).values(article).onConflictDoNothing();

    const [row] = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.url, article.url));

    await db
      .insert(articleCategories)
      .values({
        userId: USER_ID,
        articleId: row.id,
        categoryId: categoryIdByName.get(category)!,
      })
      .onConflictDoNothing();
  }

  console.log("sample data seeded");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
