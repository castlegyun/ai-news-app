"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { SignInGate } from "@/components/sign-in-gate";

// 서버에서 렌더된 인증 상태가 브라우저의 실제 세션과 어긋날 수 있어 클라이언트 세션 기준으로 분기한다.
export function HomeContent() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <SignInGate />;

  return (
    <>
      <header className="flex items-center justify-between border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
        <h1 className="text-lg font-semibold">AI 뉴스 수집기</h1>
        <UserButton />
      </header>
      <main className="flex flex-1 items-center justify-center p-8 text-zinc-600 dark:text-zinc-400">
        로그인되었습니다.
      </main>
    </>
  );
}
