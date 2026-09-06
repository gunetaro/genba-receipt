import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "700"],
  preload: false,
  display: "swap",
  fallback: ["Hiragino Sans", "Hiragino Kaku Gothic ProN", "Meiryo", "sans-serif"],
});

export const metadata: Metadata = {
  title: "現場レシート デモ｜T conference 2026",
  description:
    "トラックドライバーの待機時間・契約外作業を自動記録し、荷主に届けるデモ",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,

  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${notoSansJP.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F3F4F6] text-[#1F2937]">
        {children}
      </body>
    </html>
  );
}
