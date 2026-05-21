-- ========== Supabase 数据库初始化 SQL ==========
-- 在 Supabase 控制台的 SQL Editor 中执行以下内容

-- 1. 创建文章表
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_url TEXT,
  category TEXT NOT NULL DEFAULT 'article',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 添加置顶字段（如已有表，执行此 ALTER）
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_is_pinned ON articles(is_pinned DESC);

-- 4. 启用 RLS (Row Level Security)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 5. 创建策略：所有人可以读取
CREATE POLICY "Anyone can read articles" ON articles
  FOR SELECT USING (true);

-- 6. 创建策略：只有登录用户可以增删改
CREATE POLICY "Authenticated users can insert" ON articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update" ON articles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete" ON articles
  FOR DELETE USING (auth.role() = 'authenticated');

-- 7. 创建存储桶（用于上传图片）
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- 8. 存储策略：所有人可以查看图片
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

-- 9. 存储策略：登录用户可以上传图片
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- 10. 存储策略：登录用户可以删除图片
CREATE POLICY "Authenticated users can delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
