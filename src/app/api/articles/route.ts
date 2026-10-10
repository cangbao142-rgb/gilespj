import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { CategoryType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as CategoryType | null;
  // 参数兜底：NaN/负数归 1，单页最多 50 条
  const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("pageSize") || "10") || 10)
  );

  const supabase = createServerSupabaseClient();

  let query = supabase
    .from("articles")
    .select("*", { count: "exact" })
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }

  return NextResponse.json({ data, total: count ?? 0 });
}
