import { getTodayArticles } from "@/lib/articles";
import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/types";
import { DailyTabs } from "@/components/DailyTabs";

export const metadata: Metadata = {
  title: "今日盘解",
  description: "今日市场分析",
};

export const dynamic = "force-dynamic";

export default async function DailyPage() {
  const dailyArticles = await getTodayArticles("daily");

  const dateStr = new Date().toLocaleDateString("zh-CN", {
    timeZone: "Asia/Shanghai",
  });

  return (
    <div className="container">
      <div className="headerRow">
        <div className="headerTitle">
          <h2>今日盘解</h2>
        </div>
        <div className="headerDesc">
          <p>今日市场分析</p>
        </div>
      </div>

      <DailyTabs articles={dailyArticles} dateStr={dateStr} />
    </div>
  );
}
