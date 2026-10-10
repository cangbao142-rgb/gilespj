# Giles博客 - 项目文档

> 最后更新：2026-10-11 · 线上地址：https://gilesbk.icu

## 项目简介

基于 Next.js 16 + Supabase 的个人交易博客，从原静态站点 gilesbk.icu 迁移而来。包含文章/盘解发布、点赞、评论、实时看盘（K线+画图工具）、暗色模式、背景音乐、管理后台。

**技术栈：**
- Next.js 16 (App Router) — SSR 框架
- React 19 — UI 库
- TypeScript — 类型安全
- Tailwind CSS 4 — 样式（辅助，主体为自定义 CSS）
- Supabase — 数据库 + 存储 + 后台登录认证
- ECharts 5.6（CDN）— K 线图
- GitHub + Vercel — 版本管理与部署

---

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 本地开发
npm run dev
# 打开 http://localhost:3000

# 3. 类型检查（无独立 typecheck 命令）
npx tsc --noEmit

# 4. 代码检查
npm run lint
```

本地连接的是**线上 Supabase**（无本地数据库），点赞/评论会写真实数据。

---

## 日常更新与部署

**正式发布流程（GitHub 自动部署）：**

```bash
git add -A
git commit -m "说明改了什么"
git push origin main
# → Vercel 自动构建，约 1~2 分钟后 gilesbk.icu 更新
```

**验证部署状态：**
```bash
vercel inspect gilesbk.icu    # 查看最新部署状态（status: Ready 即成功）
```

**备用手动部署**（不常用，gilesbk-blog.vercel.app 预览项目）：
```bash
vercel --prod
```

> 网络提示：本机访问 github.com / *.vercel.app 可能超时，push 失败多重试几次即可；gilesbk.icu 是自定义域名，国内可直连。

---

## 项目结构

```
gilesbk-blog/
├── .env.local                    # 环境变量（Supabase 密钥，勿提交）
├── next.config.ts                # Next.js 配置（图片域名 + /admin 重写）
├── PROJECT.md                    # 本文档
│
├── src/
│   ├── app/
│   │   ├── layout.tsx            # 根布局（导航+页脚+背景+音乐+主题防闪脚本）
│   │   ├── page.tsx              # 首页（SSR）
│   │   ├── globals.css           # 全局样式（含暗色变量、看盘页样式）
│   │   ├── icon.svg              # 网站图标（品牌 G，浏览器标签显示）
│   │   │
│   │   ├── article/[id]/page.tsx # 文章详情（SSR + OG 元数据 + 图片懒加载）
│   │   ├── daily/page.tsx        # 今日盘解（SSR）
│   │   ├── chart/
│   │   │   ├── layout.tsx        # 看盘页浅色锁定（暗色模式不进入此页）
│   │   │   └── page.tsx          # 实时看盘（ECharts K线 + 画图工具）
│   │   ├── about/page.tsx        # 关于我（SSR）
│   │   │
│   │   ├── api/
│   │   │   ├── articles/route.ts # 文章列表（分页/分类，pageSize 上限 50）
│   │   │   ├── likes/route.ts    # 点赞查询/切换
│   │   │   ├── comments/route.ts # 评论列表/发表（长度校验）
│   │   │   └── binance/route.ts  # 币安行情代理（K线/实时价，多镜像容错）
│   │   │
│   │   ├── sitemap.ts            # 自动生成 sitemap.xml
│   │   └── robots.ts             # 自动生成 robots.txt
│   │
│   ├── components/               # 可复用组件
│   │   ├── Navbar.tsx            # 导航栏（含主题切换按钮）
│   │   ├── Footer.tsx / BackgroundPattern.tsx / Showcase.tsx
│   │   ├── CategoryTabs.tsx / PostList.tsx / DailyTabs.tsx
│   │   ├── LikeButton.tsx        # 点赞按钮（指纹防重复）
│   │   ├── CommentSection.tsx    # 评论区（嵌套回复，React 文本转义防 XSS）
│   │   └── MusicPlayer.tsx       # 背景音乐（右下角浮动按钮）
│   │
│   └── lib/                      # 数据层
│       ├── supabase.ts           # Supabase 客户端（服务端/浏览器）
│       ├── articles.ts           # 文章查询（getExcerpt 摘要等）
│       ├── likes.ts              # 点赞（走 toggle_like 数据库函数）
│       ├── comments.ts           # 评论（树形结构）
│       └── types.ts              # 类型定义
│
└── public/
    ├── music/bgm.mp3             # 背景音乐（见下方「更换背景音乐」）
    ├── admin/                    # 旧版管理后台（保留自旧静态站）
    │   ├── login.html / dashboard.html / post.html
    ├── js/                       # 后台依赖脚本（auth/config/articles/utils）
    └── css/style.css             # 后台样式
```

---

## 路由说明

| 路径 | 页面 | 渲染 | 说明 |
|------|------|------|------|
| `/` | 首页 | SSR | Showcase 精选 + 文章列表 + 分类筛选 |
| `/article/[id]` | 文章详情 | SSR | 正文 + OG 元数据 + 点赞 + 评论 |
| `/daily` | 今日盘解 | SSR | 当天盘解/操作记录 |
| `/chart` | 实时看盘 | 客户端 | ECharts K线 + 画图工具（浅色锁定） |
| `/about` | 关于我 | SSR | 介绍 + 统计 + 后台入口 |
| `/api/articles` | 文章接口 | 服务端 | ?category=&page=&pageSize= |
| `/api/likes` | 点赞接口 | 服务端 | GET 查数量 / POST 切换 |
| `/api/comments` | 评论接口 | 服务端 | GET 列表 / POST 发表 |
| `/api/binance` | 行情代理 | 服务端 | ?endpoint=klines\|ticker&symbol=&interval= |
| `/admin/login` 等 | 管理后台 | 静态 | 重写到 public/admin/*.html |
| `/sitemap.xml` `/robots.txt` | SEO | 自动生成 | |

---

## 功能说明

### 文章 / 盘解
- 分类：article（文章）/ daily（盘解）/ operation（操作记录）
- 支持置顶（is_pinned）；首页 Showcase 取有封面的前 3 篇
- 文章详情自动生成 OG 分享元数据（标题/摘要/封面/时间），正文图片懒加载

### 点赞
- 无需登录，浏览器生成指纹（localStorage `fp`）防同一人重复点赞
- 走数据库函数 `toggle_like(article_id, fingerprint)` 成对点赞/取消
- RLS 禁止匿名直接增删改 likes 表（防刷防破坏，详见安全章节）

### 评论
- 无需登录，昵称 ≤30 字、内容 ≤1000 字（API + 数据库 RLS 双重校验）
- 支持嵌套回复（最多两级）；React 文本渲染，天然防 XSS
- 评论只增不删（匿名无删除权限）；垃圾评论去 Supabase 后台删

### 背景音乐 ★ 更换方法

音乐文件位置：**`public/music/bgm.mp3`**（当前约 3.6MB）

**方法一：同名替换（推荐，零代码）**
1. 准备好新的 MP3 文件（建议 ≤5MB，太大影响首次加载速度）
2. 重命名为 `bgm.mp3`，直接覆盖 `public/music/bgm.mp3`
3. `git add public/music/bgm.mp3 && git commit -m "更换背景音乐" && git push`
4. 约 1~2 分钟后线上生效

**方法二：换文件名 / 用外链**
修改 `src/components/MusicPlayer.tsx` 顶部一行：
```ts
const MUSIC_URL = "/music/bgm.mp3";   // 改成新文件路径或 https:// 外链
```
新文件放 `public/music/` 下（如 `public/music/bg2.mp3`），MUSIC_URL 改为 `"/music/bg2.mp3"`，然后推送。

**可调参数**（都在 `src/components/MusicPlayer.tsx`）：

| 参数 | 当前值 | 位置 |
|------|--------|------|
| 音量 | `audio.volume = 0.3`（0~1） | 第一个 useEffect |
| 循环播放 | `audio.loop = true` | 同上 |
| 预加载 | `preload="none"`（点击才下载，建议保留） | `<audio>` 标签 |

**播放行为说明：**
- 浏览器安全策略禁止网页打开就出声，本站方案为「用户首次点击/按任意键后自动播放」
- 右下角按钮随时暂停/继续（加载中点击也立即生效）

### 暗色模式
- 导航栏太阳/月亮按钮切换，默认跟随系统偏好，选择存 localStorage
- 首次绘制前由 layout.tsx 内联脚本设置主题（无闪烁）
- **看盘页例外**：强制保持浅色（`chart/layout.tsx` 的 `.chart-page-lock`），ECharts 颜色不需适配

### 实时看盘
- 数据源：币安公开接口（经 `/api/binance` 代理，5 个镜像容错，无需密钥）
- 币种：预设下拉（BTC/ETH/SOL/BNB/DOGE/XRP/AVAX/LINK）+ 手动输入任意交易对
- 周期：1分钟 ~ 月线 15 档
- 画图工具：选择 / 趋势线 / 水平线 / 斐波那契 / 矩形 / 清除（点击图上取点）
- 无回测功能（按需求移除）

### 管理后台（旧版保留）
- 入口：https://gilesbk.icu/admin/login （关于页也有链接）
- 邮箱 + 密码登录（Supabase Auth）；账号在 Supabase Dashboard → Authentication → Users 中创建
- 可发布/编辑/置顶文章（dashboard.html / post.html），数据写入 articles 表
- 文件是纯静态 HTML（public/admin + public/js + public/css），与 Next.js 页面互不干扰

---

## Supabase 数据库

```
URL:  https://ljyktooeikwjdhwcxazm.supabase.co
密钥: 见 .env.local（anon key 本就公开，受 RLS 保护）
```

**articles 表**（已有）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| title | text | 标题 |
| content | text | HTML 内容 |
| cover_url | text | 封面图 URL |
| category | text | article / daily / operation |
| is_pinned | boolean | 是否置顶 |
| created_at / updated_at | timestamp | 时间戳 |

**likes / comments 表**：已于 2026-10-11 执行带 RLS 的建表 SQL（功能与权限实测通过）。完整 SQL 如下——**换新 Supabase 项目时照此执行**：

```sql
-- likes 表（fingerprint 存 SHA-256 哈希）
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
REVOKE INSERT, UPDATE, DELETE ON public.likes FROM anon, authenticated;

-- 点赞/取消赞唯一入口
CREATE OR REPLACE FUNCTION public.toggle_like(p_article_id uuid, p_fingerprint text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM likes WHERE article_id = p_article_id AND fingerprint = p_fingerprint) THEN
    DELETE FROM likes WHERE article_id = p_article_id AND fingerprint = p_fingerprint;
    RETURN false;
  ELSE
    INSERT INTO likes (article_id, fingerprint) VALUES (p_article_id, p_fingerprint);
    RETURN true;
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.toggle_like(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.toggle_like(uuid, text) TO anon, authenticated;

-- comments 表
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
REVOKE UPDATE, DELETE ON public.comments FROM anon, authenticated;
```

---

## 环境变量

`.env.local`（**不要提交到 git**，已被 .gitignore 排除）：
```
NEXT_PUBLIC_SUPABASE_URL=https://ljyktooeikwjdhwcxazm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Vercel 上的 `blog` 项目已配置同样两个变量（Settings → Environment Variables）。换新 Supabase 项目时两边都要改。

---

## 样式说明

全局样式在 `src/app/globals.css`（MiMo 风格暖色系）：

- **主色 砂米**：`#dcc9a9`（大面积填充/浅底）
- **强调 砖红**：`#b83a2d`（文字/描边/可点元素，hover `#8f2a20`）
- **辅助 灰绿**：`#4e6851`
- **背景**：`#f6f0e4`；文字 `#2c261c`；卡片白底圆角 12px
- **暗色模式**：`html[data-theme="dark"]` 覆盖变量（暖夜色 `#1a1610` 底 + 米色文字）
- **背景装饰**：滚动文字水印（知行合一/顺势而为）+ 浮动渐变光球 + 鼠标光晕
- **导航**：毛玻璃 sticky；**字体** Inter（正文）+ JetBrains Mono（数字）

CSS 变量命名（换肤只改 `:root` 和暗色块）：`--bg --card-bg --text --text-2/3/4 --border --ink --primary --accent --glass-bg` 等。

---

## 安全加固记录（2026-10-11）

- SQL 注入：全站 supabase-js 参数化查询，无裸 SQL（实测注入字符串无害）
- articles 表 RLS：匿名只读，写入被拒（实测 401）
- likes/comments：匿名有限写入，改删权限全部回收（实测 401）
- API：评论/昵称长度限制、pageSize 上限 50、错误信息不外泄
- 评论渲染：React 文本节点转义，无 XSS
- 待接受风险：点赞指纹可伪造（可刷赞，个人博客可接受）；无接口限频

---

## 部署信息

**正式站（GitHub 自动部署）：**
- 仓库：github.com/cangbao142-rgb/gilespj（推送 main 即自动部署）
- Vercel 项目：blog（框架 Next.js，含环境变量）
- 域名：https://gilesbk.icu ✅

**备用项目：** gilesbk-blog → https://gilesbk-blog.vercel.app（预览用，可删除）

**自定义图标**：替换 `src/app/icon.svg`（SVG 即可，浏览器标签/收藏夹显示）

---

## 注意事项

1. **Supabase 免费版闲置会自动暂停**，长时间不用需到 Dashboard 唤醒，否则网站数据读取报错
2. **换机器**：node_modules 不备份，`npm install` 即可恢复；`.env.local` 需手动拷贝
3. **chart 页必须 "use client"**（ECharts 只能浏览器运行），且保持浅色锁定
4. **构建含类型检查**：推上去的代码若 tsc 不过，Vercel 构建失败（线上保持旧版，不会挂站）
5. **管理后台账号**在 Supabase Dashboard 创建；忘记密码也在那里重置
