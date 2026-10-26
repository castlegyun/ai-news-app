"use client";

import { THEME_STORAGE_KEY } from "@/lib/theme";

// 아이콘은 dark: 변형으로 바꿔 보여주므로 상태가 없고 하이드레이션 불일치도 없다.
export function ThemeToggle({ className = "" }: { className?: string }) {
  function handleClick() {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      // 저장소를 쓸 수 없어도 현재 화면의 전환은 유지한다.
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="다크 모드 전환"
      title="다크 모드 전환"
      className={`inline-flex size-9 items-center justify-center border border-hairline text-foreground transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${className}`}
    >
      {/* 라이트 모드: 달 아이콘(다크로 전환) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 dark:hidden"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      {/* 다크 모드: 해 아이콘(라이트로 전환) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="hidden size-4 dark:block"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    </button>
  );
}
