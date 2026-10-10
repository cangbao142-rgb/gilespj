"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import type { Article, CategoryType } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

interface PostListProps {
  initialData: Article[];
  initialTotal: number;
  pageSize?: number;
}

export function PostList({ initialData, initialTotal, pageSize = 10 }: PostListProps) {
  const [posts, setPosts] = useState<Article[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles?page=${p}&pageSize=${pageSize}`);
      const data = await res.json();
      setPosts(data.data);
      setTotal(data.total);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div className="blogList">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
            <p>加载中...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📝</div>
            <p>还没有发布任何内容</p>
          </div>
        ) : (
          posts.map((post, i) => (
            <Link
              href={`/article/${post.id}`}
              key={post.id}
              className={`blogRow${post.is_pinned ? " pinned" : ""}`}
            >
              <div className="blogIndex">
                <span>{String((page - 1) * pageSize + i + 1).padStart(2, "0")}</span>
              </div>
              <div className="blogInfo">
                <h3>
                  {post.is_pinned && <span className="pin-badge">置顶</span>}
                  {post.title}
                </h3>
                <p>{post.content.replace(/<[^>]+>/g, "").substring(0, 120)}...</p>
                <div className="rowMeta">
                  <span className="tag">{CATEGORY_LABELS[post.category as CategoryType] || post.category}</span>
                  <span>{new Date(post.created_at).toLocaleDateString("zh-CN")}</span>
                </div>
              </div>
              <div className="blogArrow">
                <span>→</span>
              </div>
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => loadPage(page - 1)}>
            上一页
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)
            )
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev !== undefined && p - prev > 1;
              return (
                <span key={p}>
                  {showEllipsis && <button disabled>...</button>}
                  <button
                    className={p === page ? "active" : ""}
                    onClick={() => loadPage(p)}
                  >
                    {p}
                  </button>
                </span>
              );
            })}
          <button disabled={page >= totalPages} onClick={() => loadPage(page + 1)}>
            下一页
          </button>
        </div>
      )}
    </>
  );
}
