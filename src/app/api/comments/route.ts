import { NextRequest, NextResponse } from "next/server";
import { getComments, createComment } from "@/lib/comments";

const NICKNAME_MAX = 30;
const CONTENT_MAX = 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");

  if (!articleId) {
    return NextResponse.json({ error: "articleId required" }, { status: 400 });
  }

  try {
    const comments = await getComments(articleId);
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { articleId, nickname, content, parentId } = await request.json();

  const nick = typeof nickname === "string" ? nickname.trim() : "";
  const text = typeof content === "string" ? content.trim() : "";

  if (!articleId || !nick || !text) {
    return NextResponse.json(
      { error: "articleId, nickname, and content required" },
      { status: 400 }
    );
  }

  if (nick.length > NICKNAME_MAX || text.length > CONTENT_MAX) {
    return NextResponse.json(
      { error: `nickname <= ${NICKNAME_MAX}, content <= ${CONTENT_MAX}` },
      { status: 400 }
    );
  }

  try {
    const comment = await createComment(articleId, nick, text, parentId);
    return NextResponse.json({ comment });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
