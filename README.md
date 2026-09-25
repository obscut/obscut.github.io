# 个人主页

Astro + 手写 CSS 的极简个人站点，纯静态，托管在 GitHub Pages。

- **技术栈**：Astro（无框架、零 JS 运行时）+ 原生 CSS
- **板块**：首页 / 研究 / 论文 / 项目 / 博客 / 刷题 / 简历
- **博客**：Markdown，放在 `src/content/blog/`
- **刷题数据**：构建时从 LeetCode 官方接口拉取，失败自动降级到兜底值
- **主题**：黑白灰 + 单强调色，支持深浅切换

---

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
```

改文件即时热更新。

## 构建

```bash
npm run build     # 产物在 dist/
npm run preview   # 本地预览构建结果
```

---

## 部署到 GitHub Pages（一次配置，之后 push 即生效）

1. 在 GitHub 上新建一个仓库，名字必须叫 **`obscut.github.io`**（`obscut` 换成你的用户名）。
   仓库名决定了访问地址 `https://obscut.github.io`。

2. 本地初始化并推送：

   ```bash
   git init
   git add .
   git commit -m "init: personal homepage"
   git branch -M main
   git remote add origin https://github.com/obscut/obscut.github.io.git
   git push -u origin main
   ```

3. 在 GitHub 仓库页面：**Settings → Pages → Build and deployment → Source**
   选 **`GitHub Actions`**（不是 "Deploy from a branch"）。

4. 推完代码后，Actions 会自动跑 `.github/workflows/deploy.yml`，
   几十秒后站点上线。可以在仓库的 **Actions** 标签页看进度。

之后每次 `git push` 都会自动重新部署。

### 想用自定义域名？
把域名写进 `public/CNAME` 文件，然后在域名商处加一条 CNAME 记录指向 `obscut.github.io`。
如果站点不在根路径（比如用项目仓库 `xxx/repo`），需要在 `astro.config.mjs` 里配置 `base: '/repo'`。

---

## 日常维护

### 改个人信息、研究方向、论文、项目、技能

全部在 **`site.config.ts`** 一个文件里，改完 push 即可。

### 写一篇博客

在 `src/content/blog/` 下新建 `.md`：

```markdown
---
title: 文章标题
date: 2026-09-20
summary: 列表页显示的一句话摘要
tags: ['标签1']
draft: false   # true 则生产构建时隐藏
---

正文，支持 **Markdown**、代码块、表格、图片。
```

文件名建议 `YYYY-MM-DD-标题.md`，URL 就是 `/blog/2026-09-20-标题/`。

### 改配色

`src/styles/global.css` 最顶部的 `:root` 里改 `--accent` 一行（浅色）和
`[data-theme='dark']` 里的 `--accent`（深色）。

### 改 LeetCode 用户名

`site.config.ts` → `leetcode.username`。
注意填 **用户名**（profile 链接里 `/u/xxx/` 的那段），不是主页上显示的昵称。
抓不到数据时页面会显示兜底值，不会构建失败。

### 加导航项

`site.config.ts` → `nav` 数组。

---

## 目录结构

```
.
├── site.config.ts              # ← 所有内容都在这里改
├── astro.config.mjs
├── src/
│   ├── content.config.ts       # 博客 Schema
│   ├── content/blog/*.md       # ← 博客文章
│   ├── layouts/Base.astro      # 页头 / 页脚 / SEO
│   ├── components/ThemeToggle.astro
│   ├── lib/leetcode.ts         # 刷题数据抓取
│   ├── lib/format.ts
│   ├── pages/                  # 各页面路由
│   └── styles/global.css       # ← 设计变量与样式
├── public/                     # 静态资源
└── .github/workflows/deploy.yml
```
