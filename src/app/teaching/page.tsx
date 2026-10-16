import { getArticles } from "@/lib/articles";
import type { Metadata } from "next";
import { PostList } from "@/components/PostList";

export const metadata: Metadata = {
  title: "教学",
  description: "交易教学内容，从基础到进阶，从K线到宏观",
};

export const dynamic = "force-dynamic";

export default async function TeachingPage() {
  const { data, total } = await getArticles({
    category: "teaching",
    page: 1,
    pageSize: 10,
  });

  return (
    <div className="container">
      <div className="headerRow">
        <div className="headerTitle">
          <h2>教学</h2>
        </div>
        <div className="headerDesc">
          <p>交易教学内容，从基础到进阶，从K线到宏观</p>
        </div>
      </div>

      <PostList initialData={data} initialTotal={total} category="teaching" />
    </div>
  );
}
