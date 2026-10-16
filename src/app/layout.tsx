import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { MusicPlayer } from "@/components/MusicPlayer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Giles博客",
    template: "%s - Giles博客",
  },
  description: "分享经济解读、市场分析和教学内容",
  keywords: ["交易", "经济解读", "市场分析", "教学", "博客"],
  authors: [{ name: "Giles" }],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "Giles博客",
  },
};

// 在首次绘制前设置 data-theme，避免刷新时主题闪烁
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        style={{
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <BackgroundPattern />
        <Navbar />
        <main className="main-content">{children}</main>
        <Footer />
        <MusicPlayer />
      </body>
    </html>
  );
}
