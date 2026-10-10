import { getArticleById, getExcerpt } from "@/lib/articles";
import { CATEGORY_LABELS } from "@/lib/types";
import type { Article } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LikeButton } from "@/components/LikeButton";
import { CommentSection } from "@/components/CommentSection";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  let article: Article;
  try {
    article = await getArticleById(id);
  } catch {
    return { title: "文章不存在" };
  }

  const description = getExcerpt(article.content).replace(/\s+/g, " ").trim();

  return {
    title: article.title,
    description,
    openGraph: {
      type: "article",
      title: article.title,
      description,
      publishedTime: article.created_at,
      modifiedTime: article.updated_at,
      ...(article.cover_url && {
        images: [{ url: article.cover_url, alt: article.title }],
      }),
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;

  let article!: Article;
  try {
    article = await getArticleById(id);
  } catch {
    notFound();
  }

  return (
    <div className="container">
      <article className="article-detail">
        <h1>{article.title}</h1>
        <div className="meta">
          <span className="tag">
            {CATEGORY_LABELS[article.category] || article.category}
          </span>
          <span>
            {new Date(article.created_at).toLocaleDateString("zh-CN")}
          </span>
        </div>
        {article.cover_url && (
          <img
            src={article.cover_url}
            className="cover-img"
            alt={article.title}
          />
        )}
        <div
          className="content"
          dangerouslySetInnerHTML={{
            __html: article.content.replace(
              /<img /gi,
              '<img loading="lazy" decoding="async" '
            ),
          }}
        />
      </article>

      <div className="article-actions">
        <LikeButton articleId={article.id} />
      </div>

      <CommentSection articleId={article.id} />

      <div style={{ textAlign: "center", marginTop: 48 }}>
        <Link href="/" className="btn btn-outline">
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
