"use client";

import { useState, useEffect, useCallback } from "react";

interface Comment {
  id: string;
  article_id: string;
  parent_id: string | null;
  nickname: string;
  content: string;
  created_at: string;
  replies: Comment[];
}

function CommentItem({
  comment,
  depth,
  onReply,
}: {
  comment: Comment;
  depth: number;
  onReply: (parentId: string) => void;
}) {
  return (
    <div className="comment-item" style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      <div className="comment-header">
        <span className="comment-nickname">{comment.nickname}</span>
        <span className="comment-time">
          {new Date(comment.created_at).toLocaleString("zh-CN")}
        </span>
      </div>
      <div className="comment-body">{comment.content}</div>
      {depth < 2 && (
        <button
          className="comment-reply-btn"
          onClick={() => onReply(comment.id)}
        >
          回复
        </button>
      )}
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          onReply={onReply}
        />
      ))}
    </div>
  );
}

export function CommentSection({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?articleId=${articleId}`);
      const d = await res.json();
      setComments(d.comments ?? []);
    } catch {}
  }, [articleId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    const saved = localStorage.getItem("comment_nickname");
    if (saved) setNickname(saved);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim() || submitting) return;

    setSubmitting(true);
    try {
      localStorage.setItem("comment_nickname", nickname.trim());
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          nickname: nickname.trim(),
          content: content.trim(),
          parentId: replyTo,
        }),
      });
      if (res.ok) {
        setContent("");
        setReplyTo(null);
        loadComments();
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const totalCount = comments.reduce(
    (sum, c) => sum + 1 + (c.replies?.length ?? 0),
    0
  );

  return (
    <div className="comment-section">
      <h3 className="comment-title">评论 ({totalCount})</h3>

      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-form-row">
          <input
            type="text"
            placeholder="昵称"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            required
          />
          {replyTo && (
            <span className="comment-reply-tag">
              回复中
              <button type="button" onClick={() => setReplyTo(null)}>
                取消
              </button>
            </span>
          )}
        </div>
        <textarea
          placeholder="写下你的评论..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={3}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "发送中..." : "发表评论"}
        </button>
      </form>

      <div className="comment-list">
        {comments.length === 0 ? (
          <div className="comment-empty">还没有评论，来说点什么吧</div>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              depth={0}
              onReply={(parentId) => setReplyTo(parentId)}
            />
          ))
        )}
      </div>
    </div>
  );
}
