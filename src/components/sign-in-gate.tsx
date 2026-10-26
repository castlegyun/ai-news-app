"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

// 비로그인 상태로 접속하면 로그인 모달을 자동으로 연다.
export function SignInGate() {
  const { openSignIn } = useClerk();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    // 로그인 직후 전환 중에 다시 열면 single-session 오류가 나므로 확실히 비로그인일 때만 연다.
    if (isLoaded && !isSignedIn) openSignIn({});
  }, [isLoaded, isSignedIn, openSignIn]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <ThemeToggle className="fixed top-3 right-4 sm:right-6" />
      <h1 className="text-5xl font-bold tracking-tight uppercase">AI 뉴스 수집기</h1>
      <p className="font-light text-body">
        해외 AI 뉴스를 한국어로 모아보려면 로그인이 필요합니다.
      </p>
      <button
        type="button"
        disabled={!isLoaded || isSignedIn}
        onClick={() => openSignIn({})}
        className="h-12 border border-foreground bg-foreground px-8 text-xs font-bold tracking-[1.5px] text-background uppercase transition-colors hover:bg-transparent hover:text-foreground disabled:opacity-50"
      >
        로그인
      </button>
    </div>
  );
}
