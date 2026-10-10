"use client";

import { useState } from "react";
import type { Article, CategoryType } from "@/lib/types";
import { PostList } from "./PostList";

interface CategoryTabsProps {
  initialData: Article[];
  initialTotal: number;
}

const TABS: { key: CategoryType | ""; label: string }[] = [
  { key: "", label: "全部" },
  { key: "article", label: "文章" },
  { key: "daily", label: "盘解" },
  { key: "operation", label: "操作记录" },
];

export function CategoryTabs({ initialData, initialTotal }: CategoryTabsProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryType | "">("");
  const [data, setData] = useState<Article[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  const handleCategoryChange = async (category: CategoryType | "") => {
    if (category === activeCategory) return;
    setActiveCategory(category);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      params.set("page", "1");
      params.set("pageSize", "10");

      const res = await fetch(`/api/articles?${params}`);
      const result = await res.json();
      setData(result.data);
      setTotal(result.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="category-tabs">
        {TABS.map((tab) => (
          <span
            key={tab.key}
            className={`tab${activeCategory === tab.key ? " active" : ""}`}
            onClick={() => handleCategoryChange(tab.key)}
          >
            {tab.label}
          </span>
        ))}
      </div>
      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>加载中...</p>
        </div>
      ) : (
        <PostList initialData={data} initialTotal={total} />
      )}
    </>
  );
}
