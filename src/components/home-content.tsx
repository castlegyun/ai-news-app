"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignInGate } from "@/components/sign-in-gate";

// 서버에서 렌더된 인증 상태가 브라우저의 실제 세션과 어긋날 수 있어 클라이언트 세션 기준으로 분기한다.
// 로그인 상태면 바로 대시보드로 이동한다.
export function HomeContent() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) return null;
  return <SignInGate />;
}
