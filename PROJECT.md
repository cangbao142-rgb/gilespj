# Giles博客 - 项目文档

## 项目简介

基于 Next.js 16 + Supabase 的个人交易博客，从原静态站点 gilesbk.icu 迁移而来。

**技术栈：**
- Next.js 16 (App Router) — SSR 框架
- React 19 — UI 库
- TypeScript — 类型安全
- Tailwind CSS 4 — 样式（辅助）
- Supabase — 后端数据库 + 存储
- Vercel — 部署平台

---

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 本地开发
npm run dev
# 打开 http://localhost:3000

# 3. 构建
npm run build

# 4. 部署到 Vercel
vercel --prod
```

---

## 项目结构

```
gilesbk-blog/
├── .env.local                    # 环境变量（Supabase 密钥）
├── next.config.ts                # Next.js 配置
├── package.json                  # 依赖和脚本
├── tsconfig.json                 # TypeScript 配置
│
├── src/
│   ├── app/                      # 路由和页面
│   │   ├── layout.tsx            # 根布局（导航 + 页脚 + 背景）
│   │   ├── page.tsx              # 首页（SSR）
│   │   ├── globals.css           # 全局样式（从原站迁移）
│   │   │
│   │   ├── article/[id]/
│   │   │   └── page.tsx          # 文章详情页（SSR）
│   │   │
│   │   ├── daily/
│   │   │   └── page.tsx          # 今日盘解页（SSR）
│   │   │
│   │   ├── chart/
│   │   │   └── page.tsx          # 实时看盘页（客户端，ECharts K线图）
│   │   │
│   │   ├── about/
│   │   │   └── page.tsx          # 关于我页（SSR）
│   │   │
│   │   ├── api/
│   │   │   └── articles/
│   │   │       └── route.ts      # 文章列表 API
│   │   │
│   │   ├── sitemap.ts            # 自动生成 sitemap.xml
│   │   └── robots.ts             # 自动生成 robots.txt
│   │
│   ├── components/               # 可复用组件
│   │   ├── Navbar.tsx            # 导航栏（响应式，客户端）
│   │   ├── Footer.tsx            # 页脚
│   │   ├── BackgroundPattern.tsx # 背景装饰（滚动文字 + 光球 + 鼠标光晕）
│   │   ├── Showcase.tsx          # 首页精选卡片
│   │   ├── CategoryTabs.tsx      # 分类筛选标签（客户端）
│   │   ├── PostList.tsx          # 文章列表 + 分页（客户端）
│   │   └── DailyTabs.tsx         # 盘解/操作记录切换（客户端）
│   │
│   └── lib/                      # 工具和数据层
│       ├── supabase.ts           # Supabase 客户端初始化
│       ├── articles.ts           # 文章数据操作（CRUD）
│       ├── likes.ts              # 点赞数据操作
│       ├── comments.ts           # 评论数据操作（树形结构）
│       └── types.ts              # TypeScript 类型定义
│
│   └── components/               # 可复用组件
│       ├── Navbar.tsx            # 导航栏（响应式，客户端）
│       ├── Footer.tsx            # 页脚
│       ├── BackgroundPattern.tsx # 背景装饰（滚动文字 + 光球 + 鼠标光晕）
│       ├── Showcase.tsx          # 首页精选卡片
│       ├── CategoryTabs.tsx      # 分类筛选标签（客户端）
│       ├── PostList.tsx          # 文章列表 + 分页（客户端）
│       ├── DailyTabs.tsx         # 盘解/操作记录切换（客户端）
│       ├── LikeButton.tsx        # 点赞按钮（客户端）
│       ├── CommentSection.tsx    # 评论区（客户端，嵌套回复）
│       └── MusicPlayer.tsx       # 背景音乐播放器（客户端，右下角浮动）
│
└── public/                       # 静态资源
```

---

## 路由说明

| 路径 | 页面 | 渲染方式 | 说明 |
|------|------|----------|------|
| `/` | 首页 | SSR | 文章列表 + Showcase + 分类筛选 |
| `/article/[id]` | 文章详情 | SSR | 文章内容 + 返回按钮 |
| `/daily` | 今日盘解 | SSR | 当天的盘解和操作记录 |
| `/chart` | 实时看盘 | 客户端 | ECharts K线图 |
| `/about` | 关于我 | SSR | 个人介绍 + 统计数据 |
| `/api/articles` | API | 服务端 | 文章列表接口 |
| `/api/likes` | API | 服务端 | 点赞查询/切换接口 |
| `/api/comments` | API | 服务端 | 评论列表/发表接口 |
| `/sitemap.xml` | Sitemap | 自动生成 | SEO 站点地图 |
| `/robots.txt` | Robots | 自动生成 | 搜索引擎规则 |

---

## Supabase 数据库

### 连接信息
```
URL:  https://ljyktooeikwjdhwcxazm.supabase.co
Key:  见 .env.local 文件
```

### 数据表

**articles 表**（已有）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| title | text | 标题 |
| content | text | HTML 内容 |
| cover_url | text | 封面图 URL |
| category | text | 分类：article / daily / operation |
| is_pinned | boolean | 是否置顶 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

**likes 表**（待建——在 Supabase SQL Editor 执行以下全部 SQL 后生效）
```sql
-- 1. likes 表（点赞）：fingerprint 列存 SHA-256 哈希，不存原始指纹
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL,
  fingerprint text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_id, fingerprint)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY likes_public_read ON public.likes
  FOR SELECT TO anon, authenticated USING (true);

-- 不给匿名任何直接写/改/删权限（不建对应 policy + 显式回收）
REVOKE INSERT, UPDATE, DELETE ON public.likes FROM anon, authenticated;

-- 赞/取消赞只能走此函数：按 article_id+fingerprint 成对操作
CREATE OR REPLACE FUNCTION public.toggle_like(p_article_id uuid, p_fingerprint text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM likes
    WHERE article_id = p_article_id AND fingerprint = p_fingerprint
  ) THEN
    DELETE FROM likes
    WHERE article_id = p_article_id AND fingerprint = p_fingerprint;
    RETURN false;
  ELSE
    INSERT INTO likes (article_id, fingerprint) VALUES (p_article_id, p_fingerprint);
    RETURN true;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.toggle_like(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.toggle_like(uuid, text) TO anon, authenticated;
```

**comments 表**（待建——同一次 SQL Editor 里一起执行）
```sql
-- 2. comments 表（评论，支持嵌套回复）
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY comments_public_read ON public.comments
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY comments_insert_limited ON public.comments
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(nickname) BETWEEN 1 AND 30
    AND char_length(content) BETWEEN 1 AND 1000
  );

-- 匿名禁止改/删评论；清理垃圾评论请在 Supabase 后台操作
REVOKE UPDATE, DELETE ON public.comments FROM anon, authenticated;
```

---

## 渲染策略

| 页面 | 策略 | 原因 |
|------|------|------|
| 首页 | `force-dynamic` | 每次请求从 Supabase 获取最新文章 |
| 文章详情 | `force-dynamic` | 每篇文章内容可能不同 |
| 今日盘解 | `force-dynamic` | 每天内容变化 |
| 实时看盘 | 客户端渲染 | 需要实时交互，ECharts 只能在浏览器运行 |
| 关于我 | `force-dynamic` | 统计数据实时更新 |
| 静态页面 | 预渲染 | sitemap、robots、404 |

---

## 环境变量

`.env.local` 文件：
```
NEXT_PUBLIC_SUPABASE_URL=https://ljyktooeikwjdhwcxazm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Vercel 部署时需同步配置：**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --type config
```

---

## 样式说明

全局样式在 `src/app/globals.css`，从原站完整迁移：

- **主色**：`#0095ff`（蓝）+ `#42d392`（绿）
- **渐变**：`linear-gradient(135deg, #0095ff 0%, #33adff 100%)`
- **背景**：滚动文字水印（知行合一/顺势而为）+ 浮动渐变光球 + 鼠标光晕
- **导航**：毛玻璃效果，sticky 定位
- **卡片**：圆角 12px，hover 阴影
- **字体**：Inter（正文）+ JetBrains Mono（数字/代码）

---

## 部署信息

**正式站（GitHub 自动部署）：**
- 仓库：github.com/cangbao142-rgb/gilespj（推送 main 即自动部署）
- Vercel 项目：blog（框架已设为 Next.js，含 Supabase 环境变量）
- 域名：https://gilesbk.icu ✅ 新版已上线（2026-10-11）

**备用项目：** gilesbk-blog → https://gilesbk-blog.vercel.app（早期预览用，可随时删除）

**旧版管理后台（保留自旧静态站）：**
- 入口：https://gilesbk.icu/admin/login（邮箱密码登录，Supabase Auth）
- 文件：public/admin/*.html + public/js/ + public/css/style.css
- next.config.ts 有 /admin/* 无扩展名重写

---

## 常见操作

### 本地开发
```bash
npm run dev          # 启动开发服务器 http://localhost:3000
npm run build        # 构建生产版本
npm start            # 启动生产服务器
```

### Vercel 部署
```bash
vercel               # 部署到预览环境
vercel --prod        # 部署到生产环境
vercel logs          # 查看日志
vercel logs --level error  # 查看错误日志
```

### 环境变量管理
```bash
vercel env ls                    # 列出所有环境变量
vercel env add NAME production   # 添加环境变量
vercel env rm NAME production    # 删除环境变量
```

---

## 已完成功能

- [x] 点赞系统（代码完成；需执行上方 likes 建表 SQL 后才能真正生效）
- [x] 评论系统（代码完成，支持嵌套回复；需执行上方 comments 建表 SQL 后才能真正生效）
- [x] 背景音乐播放器（右下角浮动按钮 + 首次交互自动播放，MP3 在 public/music/bgm.mp3）
- [x] 文章详情页动态 Metadata（OG 标签，generateMetadata + getExcerpt）
- [x] 图片懒加载（正文插图 loading="lazy"，首屏封面保持立即加载）
- [x] 暗色模式（导航栏切换按钮，默认跟随系统；实时看盘页强制保持浅色，见 chart/layout.tsx）
- [x] API 输入校验加固（评论/昵称长度限制、pageSize 上限、错误信息不外泄）

## 待完成功能

- [ ] （无）—— likes/comments 建表 SQL 已执行，功能与权限防护均已实测通过（2026-10-11）

---

## 注意事项

1. **Supabase 项目**：免费版会自动暂停，长时间不用需手动恢复
2. **Vercel 免费额度**：100GB 流量/月，足够个人博客
3. **SSR vs 客户端**：chart 页面必须用 `"use client"`，因为 ECharts 只能在浏览器运行
4. **环境变量**：`NEXT_PUBLIC_` 前缀的变量会暴露给客户端，Supabase anon key 设计上就是公开的（受 RLS 保护）
5. **node_modules**：不在 M 盘备份中，换机器后 `npm install` 即可恢复
