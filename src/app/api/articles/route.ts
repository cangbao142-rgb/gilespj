import { NextRequest, NextResponse } from "next/server";
import { getArticles } from "@/lib/articles";
import type { CategoryType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category");
  const category = (categoryParam || undefined) as CategoryType | undefined;
  // 参数兜底：NaN/负数归 1，单页最多 50 条
  const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("pageSize") || "10") || 10)
  );

  try {
    // 不传 category 时走首页可见分类白名单（见 lib/articles.ts）
    const { data, total } = await getArticles({ category, page, pageSize });
    return NextResponse.json({ data, total });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
