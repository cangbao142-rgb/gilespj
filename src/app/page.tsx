import { getArticles } from "@/lib/articles";
import { Showcase } from "@/components/Showcase";
import { CategoryTabs } from "@/components/CategoryTabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giles博客 - 首页",
  description: "分享交易心得、市场分析和操作记录",
};

export const dynamic = "force-dynamic"; // SSR: 每次请求都从 Supabase 获取

export default async function HomePage() {
  const { data, total } = await getArticles({ page: 1, pageSize: 10 });

  return (
    <div className="container">
      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">HELLO</h1>
      </section>

      {/* Showcase 精选 */}
      <Showcase articles={data} />

      {/* 文章列表 */}
      <div className="headerRow">
        <div className="headerTitle">
          <h2>最新文章</h2>
        </div>
        <div className="headerDesc">
          <p>分享交易心得、市场分析和操作记录</p>
        </div>
      </div>

      <CategoryTabs initialData={data} initialTotal={total} />
    </div>
  );
}
