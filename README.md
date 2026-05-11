# 交易笔记 - 个人博客网站

免费的个人交易博客，支持发布文章、每日盘解、操作记录和图片上传。

## 功能

- 📝 发布/编辑/删除文章
- 📈 每日盘解记录
- 📋 操作记录管理
- 🖼️ 图片上传
- 🔒 管理后台登录保护
- 📱 手机/电脑自适应

## 部署步骤

### 第一步：注册 Supabase（免费后端）

1. 打开 https://supabase.com ，点击 Sign Up 注册账号
2. 登录后点击 **New Project** 创建项目
3. 填写项目名称（如 `my-blog`），设置数据库密码，选择地区
4. 等待项目创建完成（约1-2分钟）

### 第二步：初始化数据库

1. 在 Supabase 控制台，点击左侧菜单 **SQL Editor**
2. 点击 **New query**
3. 复制 `supabase-setup.sql` 文件中的全部内容，粘贴到编辑器
4. 点击 **Run** 执行

### 第三步：获取 API 密钥

1. 在 Supabase 控制台，点击左侧菜单 **Project Settings** → **API**
2. 复制 **Project URL**（类似 `https://xxxxx.supabase.co`）
3. 复制 **anon public** key（以 `eyJ` 开头的长字符串）

### 第四步：配置项目

1. 打开 `js/config.js` 文件
2. 替换两行配置：

```javascript
const SUPABASE_URL = '你的Project URL';
const SUPABASE_ANON_KEY = '你的anon key';
```

### 第五步：创建管理员账号

1. 在 Supabase 控制台，点击左侧菜单 **Authentication**
2. 点击 **Users** → **Add user**
3. 输入你的邮箱和密码，点击 **Create user**
4. 这个邮箱密码就是你登录管理后台的账号

### 第六步：部署到 Vercel（免费托管）

**方式一：通过 GitHub（推荐）**

1. 注册 https://github.com 账号
2. 创建新仓库，上传整个 `blog` 文件夹的内容
3. 注册 https://vercel.com 账号（用 GitHub 登录）
4. 点击 **New Project** → 选择你的仓库 → **Deploy**
5. 等待部署完成，获得网站地址（如 `xxx.vercel.app`）

**方式二：直接上传**

1. 注册 https://vercel.com 账号
2. 安装 Vercel CLI：`npm i -g vercel`
3. 在 blog 目录执行 `vercel` 按提示操作

### 第七步：访问网站

- 前台首页：`https://你的域名.vercel.app/index.html`
- 管理后台：`https://你的域名.vercel.app/admin/login.html`
- 用第五步创建的邮箱密码登录管理后台

## 文件结构

```
blog/
├── index.html          # 首页
├── article.html        # 文章详情页
├── daily.html          # 盘解列表页
├── about.html          # 关于页面
├── admin/
│   ├── login.html      # 管理员登录
│   ├── dashboard.html  # 管理后台
│   └── post.html       # 发布/编辑内容
├── css/
│   └── style.css       # 全局样式
├── js/
│   ├── config.js       # Supabase 配置（需要修改）
│   ├── auth.js         # 认证模块
│   ├── articles.js     # 文章模块
│   └── utils.js        # 工具模块
├── supabase-setup.sql  # 数据库初始化 SQL
└── README.md           # 本文件
```

## 使用说明

### 发布内容
1. 访问管理后台 `/admin/login.html`
2. 登录后点击「发布文章」「发布盘解」或「发布操作记录」
3. 填写标题、内容（支持 HTML），可上传封面图片
4. 点击发布

### 编辑/删除
1. 在仪表盘可以看到所有已发布的内容
2. 点击「编辑」修改内容，点击「删除」删除内容

### 图片上传
- 在发布内容时，可以上传封面图片
- 在内容编辑器中点击「图片」按钮可插入图片到正文

## 常见问题

**Q: 免费额度够用吗？**
A: Supabase 免费套餐提供 500MB 数据库 + 1GB 存储，个人博客完全够用。

**Q: 可以绑定自己的域名吗？**
A: 可以。在 Vercel 项目设置中添加自定义域名即可。

**Q: 忘记密码怎么办？**
A: 在 Supabase 控制台 Authentication 页面重置密码。
