import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 페이지는 로그인 모달을 띄워야 하므로 통과시키고, API는 비로그인 시 401로 차단한다.
export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname.startsWith("/api")) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
  }
});

export const config = {
  matcher: [
    // Next.js 내부 경로와 정적 파일은 제외
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
