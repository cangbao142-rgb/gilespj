import Link from "next/link";
import type { Article } from "@/lib/types";

interface ShowcaseProps {
  articles: Article[];
}

export function Showcase({ articles }: ShowcaseProps) {
  const withCover = articles.filter((p) => p.cover_url).slice(0, 3);

  if (withCover.length === 0) return null;

  return (
    <div className="showcase">
      {withCover.map((post) => (
        <Link href={`/article/${post.id}`} key={post.id} className="showcaseCard">
          <img src={post.cover_url!} alt={post.title} />
          <div className="overlay" />
          <div className="cardInfo">
            <h3>{post.title}</h3>
            <p>{post.content.replace(/<[^>]+>/g, "").substring(0, 80)}...</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
