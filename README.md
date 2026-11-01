<div align="center">

# coldfieldobserver.github.io

![Last Commit](https://img.shields.io/github/last-commit/ColdFieldObserver/coldfieldobserver.github.io?label=Last%20Commit)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.6.3-00DC82?logo=Nuxt&logoColor=white)](https://nuxt.com/)
[![Nuxt UI](https://img.shields.io/badge/Nuxt%20UI-4.12-00DC82?logo=Nuxt&logoColor=white)](https://ui.nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.5.44-4FC08D?logo=Vue.js&logoColor=white)](https://cn.vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?logo=TypeScript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.3.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
![License](https://img.shields.io/badge/License-MIT-blue)
[![BiliBili](https://img.shields.io/badge/BiliBili-冷域观者-FF69B4?logo=bilibili&logoColor=F5F5F5)](https://space.bilibili.com/3632301571311734)
[![GitHub](https://img.shields.io/badge/GitHub-ColdFieldObserver-blue?logo=github&logoColor=F5F5F5)](https://github.com/ColdFieldObserver)

冷域观者的个人网站，使用 Nuxt 4 + Nuxt UI + @nuxt/content + TypeScript + Tailwind CSS 构建，通过 `nuxt generate` 静态生成（SSG）后部署到 GitHub Pages。现代圆角版式 + 机甲蓝主题色，无后端、无第三方统计脚本。

</div>

## 网站结构

版式是「顶栏 → 内容 → 底栏」三段式，全站只有 window 一条滚动条。

- **顶栏**：品牌 + 一级导航（首页 / 博客 / 工具）+ 搜索 / 主题切换；≤1024px 收成汉堡下拉面板。
- **首页**：`/`，圆形头像与自我介绍、身份主线经历、最新日志、我的项目、游戏 ID 跑马灯、工具矩阵、关于这个站点。
- **日志**：`/posts/`，由 @nuxt/content 驱动，卡片固定为「封面 + 标题 / 分类 · 日期 / 摘要」；支持分页、站内搜索与 Giscus 评论。
- **博客分区**：`/archives/`（按年分页、页内按月分组）、`/categories/`、`/tags/`（索引页与详情分页）。这三项不占顶栏与底栏，入口只在博客列表页顶部。
- **搜索**：`/search/`，与搜索弹窗共用关键词；语料是构建期固化的静态 JSON，纯前端匹配。
- **工具箱**：`/tools/`，Base64 / Unicode / 时间戳 / URL / 蛋仔派对地图文本 5 个纯前端小工具（首页「工具矩阵」展示前四个）。
- **底栏**：一级导航、友情链接、订阅与社交、版权说明。
- **没有独立的「关于」页**：关于信息拆在首页与底栏。

## 技术栈

- [Nuxt 4](https://nuxt.com/)（Vite + Nitro 预渲染 + SSG）
- [Nuxt UI 4](https://ui.nuxt.com/)（组件、主题变量与语义色；`ui.colorMode` / `ui.fonts` 均关闭，主题与字体仍由项目自己掌管）
- [@nuxt/content v3](https://content.nuxt.com/)（Markdown 内容库，MDC + Shiki 双主题）
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)（`@theme` 设计令牌 + 工具类 + **Preflight**）
- [@nuxt/icon](https://nuxt.com/modules/icon)（随 Nuxt UI 内置，Lucide + Simple Icons，构建期内联为 SVG）
- [KaTeX](https://katex.org/)（数学公式，`remark-math` + `rehype-katex`）

## 数据文件

- `content/posts/*.md` —— 全部文章（唯一内容源），frontmatter 字段见 `content.config.ts`。
- `app/data/nav.ts` —— 顶栏一级导航（`NAV_ITEMS`）与博客子导航（`BLOG_SUB_NAV`）。
- `app/data/profile.ts` —— 个人档案、身份主线经历、友情链接、社交账号。
- `app/data/home.ts` —— 首页文案、我的项目、游戏 ID、站点说明、头像路径。
- `shared/site.ts` —— 站点信息、工具清单、分页大小（`PAGE_SIZE`）、Giscus 配置。

## 构建步骤

1. [下载并安装 Node.js](https://nodejs.org/zh-cn)（建议 22 LTS）
2. 安装 `pnpm`：`npm install -g pnpm`（`pnpm --version` 可验证）
3. 在项目文件夹下执行 `pnpm install`
4. `pnpm dev` 启动开发服务器（默认 `http://localhost:3000`）
5. `pnpm build` 生成静态产物，输出在 **`.output/public`**

> [!TIP]
> 如果 `npm install` 安装较慢，可先执行 `npm config set registry https://registry.npmmirror.com` 切换至镜像源。

> [!NOTE]
> `nuxt.config.ts` 或 `app.config.ts` 改动后跑一次 `pnpm exec nuxt prepare`，否则类型与 `#build/ui.css` 是旧的。

## 字体与图标

字体为 HarmonyOS Sans SC（400 / 500 / 700 三个字重，按 unicode-range 分片走 CDN）和 Cascadia Code（代码块等宽），通过 CDN 加载（样式表由 `nuxt.config.ts` 的 `app.head` 注入），仓库不保留字体文件。回退链定义见 `app/assets/styles/base.css` 的 `--font-ui` / `--font-code`。

图标使用随 Nuxt UI 内置的 `@nuxt/icon`（Lucide + Simple Icons），图标集以 `@iconify-json/*` 本地安装，**构建期直接内联为 SVG**（`app.config.ts` 里 `icon.mode: 'svg'`），运行时不请求 Iconify API。

## 样式分层

`app/assets/styles/` 的导入顺序即正确性，详见 `main.css` 顶部注释：

1. `tailwindcss/theme.css` → `tailwindcss/preflight.css` → `tailwindcss/utilities.css`
2. `@nuxt/ui`（必须排在 `tokens.css` 之前，才能用自定义的三路 `dark` 变体覆盖它）
3. `tokens.css`（`@theme static` 令牌、色阶别名、断点沿用默认）→ `base.css`（颜色真值、`--ui-*` 映射、Preflight 之后的补丁）→ `prose.css` / `animation.css`

主题色是机甲蓝：浅色 `#1260cc`、深色 `#2d8cff`，配成完整 50–950 色阶供 Nuxt UI 取用；深浅切换时色阶整体往亮端平移。

## 交互与动效

- 主题三态（跟随系统 / 浅色 / 深色）—— `app/composables/useTheme.ts`，同时写 `data-theme` 与 `.dark` / `.light`，`localStorage` key 为 `cfo-theme`，首帧由 `nuxt.config.ts` 的内联脚本落地，避免深色闪白；
- 页面过渡与滚动淡入（`data-reveal` 契约）—— `app/assets/styles/animation.css` 与 `app/composables/useScrollReveal.ts`，全部遵循 `prefers-reduced-motion`；
- 路由加载进度条、返回顶部浮钮 —— `PageProgress.vue` / `BackToTop.vue`（首屏没有全屏加载动画）；
- `Ctrl / ⌘ + K` 或 `/` 打开搜索 —— `app/plugins/shortcuts.client.ts`（输入框内与输入法组合中不劫持）；
- 移动端（≤1024px）汉堡下拉面板，收起时 `inert`，点击路由自动收起；
- 目录：只有正文里显式写了 `[TOC]` 的文章才会出现目录。

## Stone Badge

下面是这个仓库的[Stone Badge](https://stone.professorlee.work/)。

![Stone Badge](https://stone.professorlee.work/api/stone/ColdFieldObserver/coldfieldobserver.github.io)

## 部署方式

本网站部署于 **GitHub Pages**，通过静态托管对外提供服务。推送到 `master` 后由 `.github/workflows/deploy.yml` 自动执行 `pnpm build` → 上传 `.output/public` → 部署 Pages。站点没有后端，所有内容以静态资源形式存在，更新时需重新构建并推送。

## 许可证

本项目采用 **MIT** 许可证，详见 [LICENSE](LICENSE)。
