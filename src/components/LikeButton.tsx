"use client";

import { useState, useEffect, useCallback } from "react";

function getFingerprint(): string {
  const stored = localStorage.getItem("fp");
  if (stored) return stored;
  const raw = [
    navigator.userAgent,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join("|");
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) | 0;
  }
  const fp = "fp_" + Math.abs(hash).toString(36);
  localStorage.setItem("fp", fp);
  return fp;
}

export function LikeButton({ articleId }: { articleId: string }) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fp = getFingerprint();
    fetch(`/api/likes?articleId=${articleId}&fp=${fp}`)
      .then((r) => r.json())
      .then((d) => {
        setCount(d.count ?? 0);
        setLiked(d.liked ?? false);
      })
      .catch(() => {});
  }, [articleId]);

  const toggle = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const fp = getFingerprint();
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, fingerprint: fp }),
      });
      const d = await res.json();
      setLiked(d.liked);
      setCount(d.count);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [articleId, loading]);

  return (
    <button
      className={`like-button${liked ? " liked" : ""}`}
      onClick={toggle}
      disabled={loading}
    >
      <span className="like-icon">{liked ? "❤️" : "🤍"}</span>
      <span className="like-count">{count}</span>
    </button>
  );
}
