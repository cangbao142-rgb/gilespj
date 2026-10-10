import { NextRequest, NextResponse } from "next/server";
import { getLikeCount, hasLiked, toggleLike } from "@/lib/likes";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");
  const fingerprint = searchParams.get("fp");

  if (!articleId) {
    return NextResponse.json({ error: "articleId required" }, { status: 400 });
  }

  try {
    const count = await getLikeCount(articleId);
    let liked = false;
    if (fingerprint) {
      liked = await hasLiked(articleId, fingerprint);
    }
    return NextResponse.json({ count, liked });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { articleId, fingerprint } = await request.json();

  if (!articleId || !fingerprint) {
    return NextResponse.json(
      { error: "articleId and fingerprint required" },
      { status: 400 }
    );
  }

  try {
    const result = await toggleLike(articleId, fingerprint);
    const count = await getLikeCount(articleId);
    return NextResponse.json({ ...result, count });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
