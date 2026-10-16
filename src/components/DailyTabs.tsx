"use client";

import Link from "next/link";
import type { Article } from "@/lib/types";

interface DailyTabsProps {
  articles: Article[];
  dateStr: string;
}

export function DailyTabs({ articles, dateStr }: DailyTabsProps) {
  return (
    <div className="blogList">
      {articles.length === 0 ? (
        <div className="empty-today">
          <h1>今日盘解暂未发布</h1>
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
  );
}
