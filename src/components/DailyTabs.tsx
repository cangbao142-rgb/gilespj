"use client";

import Link from "next/link";
import { useState } from "react";
import type { Article } from "@/lib/types";

interface DailyTabsProps {
  dailyArticles: Article[];
  operationArticles: Article[];
  dateStr: string;
}

export function DailyTabs({
  dailyArticles,
  operationArticles,
  dateStr,
}: DailyTabsProps) {
  const [activeType, setActiveType] = useState<"daily" | "operation">("daily");

  const articles = activeType === "daily" ? dailyArticles : operationArticles;

  return (
    <>
      <div className="category-tabs">
        <span
          className={`tab${activeType === "daily" ? " active" : ""}`}
          onClick={() => setActiveType("daily")}
        >
          盘解
        </span>
        <span
          className={`tab${activeType === "operation" ? " active" : ""}`}
          onClick={() => setActiveType("operation")}
        >
          操作记录
        </span>
      </div>

      <div className="blogList">
        {articles.length === 0 ? (
          <div className="empty-today">
            <h1>
              {activeType === "daily"
                ? "今日盘解暂未发布"
                : "今日操作记录暂未发布"}
            </h1>
            <p>{dateStr}</p>
          </div>
        ) : (
          articles.map((post, i) => (
            <Link
              href={`/article/${post.id}`}
              key={post.id}
              className="blogRow"
            >
              <div className="blogIndex">
                <span>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="blogInfo">
                <h3>{post.title}</h3>
                <p>
                  {post.content.replace(/<[^>]+>/g, "").substring(0, 150)}...
                </p>
                <div className="rowMeta">
                  <span>
                    {new Date(post.created_at).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </div>
              <div className="blogArrow">
                <span>→</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
