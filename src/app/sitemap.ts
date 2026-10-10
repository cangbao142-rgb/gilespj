import { MetadataRoute } from "next";

const BASE_URL = "https://gilesbk.icu";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静态页面（不需要数据库连接）
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/daily`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/chart`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // 动态文章页面（运行时生成，构建时跳过）
  try {
    const { createServerSupabaseClient } = await import("@/lib/supabase");
    const supabase = createServerSupabaseClient();

    const { data } = await supabase
      .from("articles")
      .select("id, updated_at")
      .order("created_at", { ascending: false })
      .limit(500);

    const articlePages: MetadataRoute.Sitemap = (data || []).map((article) => ({
      url: `${BASE_URL}/article/${article.id}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...articlePages];
  } catch {
    // 构建时 Supabase 不可用，只返回静态页面
    return staticPages;
  }
}
