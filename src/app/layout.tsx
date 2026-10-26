import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Inter, Noto_Sans_KR } from "next/font/google";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

// BMW M 스타일: 굵은(700) 제목과 가벼운(300) 본문 대비. 영문은 Inter, 한글은 Noto Sans KR.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["300", "400", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "AI 뉴스 수집기",
  description: "해외 AI 뉴스를 한국어로 번역·요약해 보여주는 뉴스 수집기",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider localization={koKR}>
      {/* 초기화 스크립트가 .dark 클래스를 붙이므로 html 속성 불일치 경고를 끈다. */}
      <html
        lang="ko"
        className={`${inter.variable} ${notoSansKr.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
