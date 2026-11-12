# Copilot Instructions

> 本文件仅适用于 **coldfieldobserver.github.io**（冷域观者的个人网站），请勿套用到同作者的其他仓库。

## 项目指南

### 交互与视觉（硬性规则）

- 视觉语言是**现代圆角风 + 机甲蓝**：圆角（`rounded-lg` / `rounded-xl`）、1px 描边、hover 换描边色与阴影、留白充足。**已放弃** `clip-path` 切角、等宽小标签、霓虹外发光那一套，不要再引入。
- 层级只用「描边 + hover 阴影」，**不要用底色差做卡片分层**：页面底 `#eaf1fd` 与卡片白 `#ffffff` 亮度只差约 1%，靠底色分层等于没有边界。
- **不要引入全屏加载动画**：首屏只保留 `PageProgress` 这条细进度条，任何「等 JS 初始化完再显示页面」的实现都会被回退。
- 搜索弹窗用原生 `<dialog>` + `showModal()`（焦点陷阱 / ESC / 滚动锁由浏览器负责），关闭后要清空关键词并把焦点还给触发元素。**不要**迁到 `UModal`：两者都在 top layer，叠放顺序的风险大于视觉收益。
- 新增动效必须遵循系统「减少动态效果」偏好，补 `@media (prefers-reduced-motion: reduce)` 分支。
- 悬浮反馈只用掉颜色、描边、阴影与封面轻微 `scale`；**不要**做位移、旋转一类夸张效果（长列表里会抖）。
- 网格底纹（`--grid-line`）只允许出现在首页 Hero 一处，其余页面用纯色底。

### 禁止注入式增强（硬性规则）

- **禁止在 `public/` 下放 JS / CSS，再通过 `app.head` 的 `link` / `script` 注入它们来做功能增强。** 需要新交互就写 Vue 组件（`app/components/*.vue`）、composable（`app/composables/`）或客户端插件（`app/plugins/*.client.ts`）；需要新样式就写进 `app/assets/styles/` 或组件的 `<style scoped>`。`nuxt.config.ts` 的 `app.head` 只用于**站点元信息**与**首帧标记脚本**，不放本站自己写的逻辑；字体已改为构建期自包含，不再从这里注入 CDN 样式表。
- 为什么（同作者 PidanUI 官网的返工教训：`a3045cc` 引入 `public/custom/{custom.css,custom.js}`，`b5b79b1` 又全部拆回主站代码）：
  - **SPA 不接管**：注入的脚本只在首次加载扫一遍 DOM，站内跳转后新增的页面不会被处理（滚动显现、进度条、返回顶部全部失效），而本站是 Nuxt 客户端路由。
  - **绕开样式分层**：`public/` 里的 CSS 拿不到 Tailwind 的 `@layer`，只能靠 `!important` 和特异性堆叠去压既有规则，改一处坏一片。
  - **不受类型与 lint 覆盖**：`public/` 是原样拷贝，`eslint.config.mjs` 与 `pnpm build` 都不会检查，等于在受管代码之外开了一个无人守的口子。
  - **重复实现**：站内已有 `useScrollReveal` / `PageProgress` 等能力，注入层再写一份必然与它们冲突。
- `public/` 只放**原样发给浏览器、不需要加工的资源**：图片、favicon、Bing 站长验证文件、`giscus/` 下的评论皮肤。例外是 `giscus/*.css`——那是 giscus iframe 跨源拉取的第三方皮肤，必须公网可访问的独立 URL，不属于本站样式（且主题 URL 要跟随实际访问源，见 `GiscusComments.vue`）。

### 一致性

- 文章列表（新闻 / 分类 / 标签 / 搜索 / 首页最新日志）**必须复用同一套卡片机制**：`PostCard` + `CardGrid` + `Pagination` + `usePagedPosts`。归档页例外（按年分页 + 按月分组）。
- 卡片信息固定为三行：**标题 / 分类 · 日期 / 摘要**。封面通栏 16:9，不加 hover 缩放。
- 站点导航的单一数据源是 `app/data/nav.ts`：
  - **顶栏只有一级入口**：首页 / 博客 / 工具（`NAV_ITEMS`）；**「工具」是站外链接**（`external: true` → https://www.skystarlight.top/），`target=_blank` + `rel=noopener noreferrer` + ↗ 由 `UNavigationMenu` 自动补，绝不参与 `activeNavKey` 高亮。外链处理与 OpenPidanUI 官网一致；
  - **归档 / 分类 / 标签是博客子导航**（`BLOG_SUB_NAV`），只出现在博客列表页顶部（`ChipsNav`），**顶栏与底栏都不要放**；
  - 归档 / 分类 / 标签 / 搜索这些路径在顶栏统一高亮「博客」（`activeNavKey` 的 `isBlogSection`）。
- 「个人档案 / 身份主线 / 友情链接 / 社交账号」集中在 `app/data/profile.ts`；「项目 / 游戏 ID / 站点说明」在 `app/data/home.ts`。不要在组件里另写一份文案。
- 移动端导航是 `UHeader` 的 `#bottom` 下拉面板（`grid-rows-[0fr]↔[1fr]` + `inert`），**不是抽屉**：不要引入 `UDrawer` / `USlideover` / 边缘手势。

## 项目概况

| 项       | 值                                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 定位     | 个人站点，纯静态（SSG），以 assets-only Worker 部署于 Cloudflare Workers Static Assets                                                          |
| 线上地址 | https://coldfield.skystarlight.top（`app.baseURL = '/'`，URL 不带 `.html` 与尾斜杠）                                                            |
| 技术栈   | Nuxt `4.6.3` + Vue 3 + TypeScript（别名装 TS 6 API，见「代码风格与 CI」）+ Tailwind CSS `4.3.3` + **Nuxt UI `4.12`** + @nuxt/content `3.16`     |
| 包管理器 | pnpm 12（依赖构建设置在 `pnpm-workspace.yaml` 的 `allowBuilds`）                                                                                |
| 发布流程 | 分支 / PR 触发 `.github/workflows/lint.yml`（`format:check` → `lint` → `build`）；部署由 Cloudflare 侧连好 Git 后自动执行，仓库里没有部署流水线 |
| 许可证   | MIT                                                                                                                                             |

> 样式由 Nuxt UI 4 接管，**只在确有特殊定制时才手写 CSS**。图标走 Nuxt UI 内置的 `@nuxt/icon`（不要另装 `@nuxt/icon`，两份实例会让 clientBundle 失效）。

## 常用命令

```bash
pnpm dev                       # 本地开发（默认 http://localhost:3000）
pnpm build                     # nuxi generate + 注入字体 + 产物校验，输出 .output/public
pnpm generate                  # 只跑 nuxi generate（不注入字体 / 不校验，仅供调试）
pnpm preview                   # wrangler dev：按 Cloudflare 的规则跑静态产物
pnpm deploy                    # 构建 + wrangler deploy（本地手动发版兜底）
pnpm exec nuxt prepare         # 生成 .nuxt 类型与 #build/ui.css（改 nuxt.config / app.config 后跑一次）
pnpm lint                      # ESLint：找「可能出错的地方」
pnpm lint:fix                  # ESLint 自动修复（漏分号等）
pnpm format                    # Prettier 全量重排
pnpm format:check              # 只检查不写入（CI 用这个）
```

- **构建必须零错误零警告**：`nitro.prerender.failOnError: true`，任何预渲染路由 404 都会让构建失败；`scripts/verify-output.mjs` 再逐条对账「枚举了但漏产物」的路由，并断言字体自包含、无 `tools/`、无 server 入口。
- `nitro.preset` 显式锁死为 `static`：Cloudflare 构建环境的环境变量会把预设切到 `cloudflare-*`，那套产物带 Worker 入口，`wrangler deploy` 会找不到 assets 目录。
- `pnpm preview` 走 `wrangler dev`，与线上同一套 `html_handling` / `not_found_handling` 规则；不要再用「无扩展名 → `.html` 回退」的第三方静态服务器验收。
- 构建前若 `.output` 已存在且很大，先 `rm -rf .output`：部分环境里 Nitro 的清理逻辑走回收站会超时。
- 项目没有测试，验收方式：`pnpm build` 通过 + `pnpm preview` 浏览器实看。

## 代码风格与 CI

- **硬约束：语句结束必须写分号。** 两处一起兜：Prettier 的 `"semi": true` 负责排版时补上，ESLint 的 `@stylistic/semi: ['error', 'always']` 负责当场报红（手写或粘贴代码漏分号会直接失败，不用等 `format:check`）。**不要**把任何一方改成 `false` / `'never'`。
- 分工固定：**Prettier 管排版（缩进、引号、换行、分号），ESLint 只管可能出错的地方**（未定义变量、无效 Vue 用法、可疑 TS 写法）。职责重叠的规则由 `eslint-config-prettier` 关掉，所以不要把格式化规则加回 ESLint，否则两个工具会互相改来改去。
- 配置文件：`.prettierrc.json`（`singleQuote`、`printWidth: 100`、`endOfLine: auto`）+ `.prettierignore` + `eslint.config.mjs`（flat config）。`content/` 与 `public/` 不进 Prettier：MDC 组件、KaTeX 公式和中文长句经不起换行重排，giscus 皮肤属于外部资源。
- `endOfLine: auto` 是刻意的：仓库里存的是 LF（CI 检出 LF），Windows 工作区是 CRLF，写死 `lf` 会让本机 `format:check` 全红。
- **CI 只有 `.github/workflows/lint.yml` 一条**：`format:check` → `lint` → `build`（含产物校验），所有 `push` / `pull_request` / `workflow_dispatch` 都跑。部署已交给 Cloudflare 的 Git 集成，仓库里不再有 `deploy.yml` / 预览部署工作流，也不需要 `CLOUDFLARE_*` secrets；检查不过就不该发版，所以构建校验挂在门禁里而不是部署流水线里。
- **TypeScript 是别名安装的**：`"typescript": "npm:@typescript/typescript6@^6.0.2"`。原因是类型化 lint 的 `typescript-eslint` 目前硬性拒绝 TS 7（启动即抛错），官方给的做法就是让 lint 工具走 TS 6 的 API（见 TS 7.0 发布说明「Running Side-by-Side with TypeScript 6.0」）。本项目构建用 `nuxi generate`、不跑 `tsc`，所以拿不到 TS 7 的 `tsc` 没有影响；**升级 TypeScript 前先确认 typescript-eslint 已支持 TS 7**，否则 `pnpm lint` 会直接崩。

## 部署（Cloudflare Workers）

- 仓库里**没有部署流水线**：GitHub Pages 时期的 `.github/workflows/deploy.yml`（`upload-pages-artifact` / `deploy-pages`、`pages: write` + `id-token: write` 权限、`github-pages` environment）已整体删除，仓库里也不再有 `.nojekyll` / CNAME 之类 Pages 专属文件。CI 只保留 `lint.yml` 这一条质量门禁。
- 部署由 Cloudflare 侧**一次性设置**完成（Workers Builds 连接 GitHub 仓库），之后每次推送自动执行：
  - 生产分支 `master`；构建命令 `pnpm build`；部署命令 `npx wrangler deploy`；产物目录由 `wrangler.jsonc` 的 `assets.directory` 指定，不需要另填根目录。
  - **预览部署**：在 Cloudflare 设置里开启非生产分支 / PR 预览；`wrangler.jsonc` 的 `previews: {}` 声明启用 Worker Previews，预览实例与生产 Worker 相互隔离，不会把流量切走，也不需要仓库里的预览工作流。
  - 构建环境用 Node 22 + pnpm（版本由 `package.json` 的 `packageManager` 决定）；`pnpm-workspace.yaml` 的 `allowBuilds` 已放行 `workerd` / `better-sqlite3` 等安装脚本，不要加 `--ignore-scripts`。
- `wrangler.jsonc` 是 assets-only Worker（无 `main`、无服务端运行时）：`html_handling: auto-trailing-slash` 兼容本站 `xxx.html` 与 `xxx/index.html` 的混合产物，`not_found_handling: 404-page` 使用预渲染的 `404.html`。
- 本地兜底：`pnpm deploy`（= `pnpm build` + `wrangler deploy`）手动发版，`pnpm preview`（= `wrangler dev`）按线上规则验收静态产物。
- **不要加回** Pages 权限 / artifact 上传步骤，也不要在仓库里引入 `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` 依赖：凭据由 Cloudflare 构建环境自己注入，再配一套 CI 部署只会出现两条链路互相覆盖。

## 目录结构

```
app/
├─ app.vue                        # <UApp> + 全局 titleTemplate（withSiteSuffix）
├─ app.config.ts                  # Nuxt UI 主题映射（ui.colors / header / pageGrid / prose）+ icon.mode
├─ error.vue                      # 404 页（保留站点外壳）
├─ layouts/default.vue            # 壳层：进度条 + 顶栏 + 主内容 + 底栏
├─ pages/                         # 路由即布局（见下）
├─ components/                    # 扁平注册，文件名即标签名
│  ├─ SiteHeader.vue              # UHeader：一级导航 + 搜索 + 主题 + 汉堡下拉
│  ├─ SiteFooter.vue              # UFooter：导航 / 友情链接 / 订阅社交 / 版权
│  ├─ ChipsNav.vue                # 博客子导航（归档 / 分类 / 标签）
│  └─ content/ProsePre.vue        # 代码块信息栏（语言 + 复制）
├─ composables/                   # usePosts / useTheme / useSearch / useScrollReveal / usePostEnhance …
├─ data/                          # nav.ts / profile.ts / home.ts（导航与文案的唯一来源）
├─ plugins/                       # posts（预取文章）、shortcuts.client（搜索快捷键）
├─ utils/base-url.ts              # withBase 垫片
└─ assets/styles/                 # main.css / tokens.css / base.css / prose.css / animation.css
content/posts/*.md                # 文章（唯一内容源）
public/                           # 图片（logo.webp / avatar.svg）、favicon、giscus 主题（只放资源，不放注入式 JS/CSS）
server/routes/                    # atom.xml、rss.xml、api/posts.json、api/search.json
shared/                           # site.ts（SITE / PAGE_SIZE / GISCUS）、types/、utils/
build/post-index.ts               # 构建期 fs 枚举：prerender 路由全集
scripts/                          # sync-fonts.mjs（注入本地字体）、verify-output.mjs（产物断言）
content.config.ts / nuxt.config.ts / wrangler.jsonc
```

不要提交 `.nuxt/`、`.output/`、`.data/`、`.wrangler/`、`debug.log` 等产物与日志（已在 `.gitignore`）。

## 路由与页面机制

- **路由 = 文件**，没有 `frontmatter.layout` 分派。页面壳只做三件事：取数据、写 `useHead` 标题、`throw createError` 校验参数。
- 路由表：

| URL                                           | 文件                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------- |
| `/`、`/search/`                               | `pages/index.vue`、`search.vue`                                      |
| `/posts/`、`/posts/page/:n`、`/posts/:slug`   | `pages/posts/index.vue`、`posts/page/[page].vue`、`posts/[slug].vue` |
| `/archives/`、`/archives/page/:n`             | `pages/archives/**`（第 n 页 = 第 n 个年份）                         |
| `/categories/`、`/categories/:name(/page/:n)` | `pages/categories/**`                                                |
| `/tags/`、`/tags/:tag(/page/:n)`              | `pages/tags/**`                                                      |

- **没有 `/about`，也没有 `/tools/`**：关于信息拆到首页「关于我 / 关于这个站点」与底栏版权行；工具模块已整体移除，顶栏「工具」改为站外链接，`buildRoutes()` 里不要再登记 `/tools/` 路由。要加回整页必须先改这里与 `buildRoutes()`。
- 站内链接一律用 `<NuxtLink :to>` 或 `UButton to="…"`；**严禁裸 `<a href>` 指向站内路由**（Nuxt 不拦截，会退化成整页刷新，页面过渡与进度条全失效）。
- 拼链接用 `withBase()`（`app/utils/base-url.ts`）或 `shared/utils/term.ts` 的 `termPath` / `termPagePrefix`；**模板里不能直接调 `withBase`**（会变成 `_ctx.withBase is not a function`），要在 setup 里先取成变量。
- **预渲染路由必须显式登记**：`build/post-index.ts` 的 `buildRoutes()` 由 `nuxt.config.ts` 的 `hooks['prerender:routes']` 注入。新增一类页面时要同步，否则产物里没有该页。
- 中文 term 传给 `prerender:routes` 用原始 UTF-8（`/categories/公告`），不要预先编码，否则产物文件名会变成 `%E5%85%AC...`。
- `nitro.prerender.autoSubfolderIndex: false`：`/posts/xxx` 落成 `posts/xxx.html`，URL 不带尾斜杠（Giscus 的 `pathname` 映射依赖这一点，别改）。

## 滚动模型（改版重点）

- **全站只有 window 一条滚动条**：`body` 是正常文档流（`min-height:100dvh; overflow-x: clip`）。旧的 `.site-main` 唯一滚动容器已移除，`app/router.options.ts` 也已删除，滚动交给 vue-router 默认行为（`savedPosition` / `to.hash` / `to: 0`）。
- `overflow-x` **只能 `clip`，不能 `hidden`**：`hidden` 会让 body 变成滚动容器，`UHeader` 的 `sticky top-0` 直接失效。
- 切页回顶放在 `page:transition:finish` 里做（放在 `page:finish` 会让 out-in 的旧页突然跳到顶部）。
- 锚点偏移由 CSS 提供，不写 JS 魔法数字：`html { scroll-padding-top: calc(var(--shell-header-h) + 16px) }` + 正文标题的 `scroll-margin-top`。`usePostEnhance` 只负责 `scrollIntoView`。
- `html { scrollbar-gutter: stable }` 不能删：页面过渡 out-in 期间总高度会短暂变小，否则整页会左右抖一下。

## 内容与数据

- 文章 frontmatter：`title`、`date`（`YYYY-MM-DD HH:mm:ss`）、`categories`、`tags`、`description`、`stickypost`（仅 `true` 置顶）、`cover`。字段类型在 `content.config.ts` 用 zod 声明，**新增字段先改 schema**。
- `date` 由 YAML 1.2 解析成字符串，**必须**经 `shared/utils/date.ts` 的 `parsePostDate()` 按 UTC 解释，否则构建机时区不同会导致日期漂移。
- 数据链路：`server/routes/api/posts.json.ts`（轻量列表）与 `api/search.json`（检索语料）在构建期查询内容库、预渲染成静态 JSON；前端由 `plugins/posts.ts` 预取进 `useState('posts:all')`，组件通过 `useAllPosts()` 读取。**不要在普通组件里直接调 `queryCollection`**；只有页面在 `<Suspense>` 内（如 `posts/[slug].vue`）才用 `useAsyncData` + `queryCollection`。
- 列表分页统一 `usePagedPosts(getCurrent, getSource)`；`PAGE_SIZE`（9）在 `shared/site.ts`，构建期枚举与前端共用同一常量。
- 站点信息、分页大小、Giscus 配置在 `shared/site.ts`（无工具清单）；个人信息与首页内容在 `app/data/*.ts`。
- **目录只在正文显式写 `[TOC]` 时才生成**：`usePostEnhance` 的 `mountTocPlaceholder()` 会把内容为 `[TOC]`（或被 MDC 吞掉方括号后只剩 `TOC`）的段落替换成 `div.post-toc[data-post-toc]`。页面里**不要**再放固定的目录容器，否则会出现两个目录。
- 文章内增强由 `usePostEnhance.ts` 在客户端完成：目录填充、页内锚点接管（`preventDefault` + `replaceState`，避免「默认跳转 + 手动对齐 + hashchange」三重滚动）。**Mermaid 已移除**，图表请用图片或外链。

## 样式与 Nuxt UI 约定

- 全局样式在 `app/assets/styles/`：`main.css`（入口）→ `tokens.css`（`@theme` 令牌）→ `base.css`（真值变量 + Preflight 之后的补丁）→ `prose.css` / `animation.css`。页面与组件样式写在各自 `.vue` 的 `<style scoped>`。
- `main.css` 顺序即正确性，**不要动**：

  ```css
  @layer theme, base, components, utilities;
  @import 'tailwindcss/theme.css' layer(theme);
  @import 'tailwindcss/preflight.css' layer(base);
  @import 'tailwindcss/utilities.css' layer(utilities);
  @import '@nuxt/ui'; /* 必须在 tokens.css 之前，让自定义 @custom-variant dark 覆盖它 */
  @import '@fontsource/cascadia-code/400.css'; /* 等宽字体自包含，交给 Vite 打包 */
  @import '@fontsource/cascadia-code/700.css';
  ```

- **引用块默认正体**：Nuxt UI 的 `ProseBlockquote` 主题带 `italic` 工具类（extend 合并，空串压不掉），在 `app.config.ts` 的 `ui.prose.blockquote.base` 用 `not-italic` 同组覆盖；正文里 `*强调*` → `<em>` 仍按元素自身渲染为斜体。引用块的边框 / 背景 / 内边距仍由 `prose.css` 独占。
- **颜色阶数是硬依赖**：`--color-*: initial` 会连带清掉 Nuxt UI 生成的 `primary-*` / `neutral-*` / `error-*`，因此 `tokens.css` 必须把三套 50–950 阶补回，真值在 `base.css` 的 `--accent-*` / `--ink-*` / `--danger-*`。缺任何一档，对应的按钮 / 徽章会**静默变透明**。
- `--ui-*` 全部指向项目令牌（`--ui-primary: var(--accent)` 等），所以深浅自动翻转；`--ui-error` 必须自己定义（Nuxt UI 从不定义它）。
- **只用 `bg-primary` / `text-primary` / `ring-primary/25`，禁止 `bg-primary-600` 这类带阶数的写法**：带阶数就失去「浅色更深、深色更亮」的翻转能力。
- `tokens.css` 用 `@theme static`，且**不要清空 `--shadow-*`**（Nuxt UI 组件内部用 `shadow-sm/lg/xl`，清空后浮层全无阴影）。
- 补了 `--ease-out` / `--ease-in-out` 两条别名（Nuxt UI 的折叠 / 弹窗动画简写依赖它们，缺了动画会瞬间完成）。
- 颜色真值只写在 `base.css` 的 `:root`，深色写两份（`[data-theme='dark']` 与 `prefers-color-scheme`），**两份必须逐字一致**。
- 项目文件**故意不进 `@layer`**（`prose.css` / `animation.css` 例外）：未分层规则优先级高于 utilities，加工具类时要同时删掉被取代的声明。
- 断点**遵循 Tailwind / Nuxt UI 默认值**（`sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280 / `2xl` 1536），不要自定义像素断点；移动端临界就是 `lg`。
- 注释风格：中文、`/* ==== */` 分节横幅，只解释「为什么」，不复述代码。

## 主题（三态）

- `<html data-theme="auto|light|dark">` 与 `.dark` / `.light` class **必须同时写**：前者驱动项目令牌（`base.css`），后者驱动 Nuxt UI 的 `--ui-*` 与 `dark:` 变体。只写一套 → 深色下顶栏、卡片仍是浅色皮肤。
- 落地点只有两处，改逻辑要同步改：`app/composables/useTheme.ts` 的 `apply()` 与 `nuxt.config.ts` 里 `app.head.script` 的首帧脚本。`localStorage` key 是 `cfo-theme`。
- `@custom-variant dark` 是三路命中（`[data-theme='dark']` / `.dark` / 系统深色），不要简化成只认 `.dark`。

## Markdown 渲染（@nuxt/content）

- `app/components/content/ProsePre.vue` 定义了代码块的 DOM 契约，`prose.css` 与复制逻辑都依赖它：
  `div.code-block.language-* > .code-head(span.code-lang + button.code-copy) + pre.shiki`。
  语言标签在信息栏内，信息栏 `position: sticky`，**`top` 必须是 `var(--shell-header-h)`**（写 `top:0` 会被 sticky 顶栏整个盖住，复制按钮点不到）。
  无语言（` ``` `）的代码块不加信息栏。
- `.code-block` **不能用 `overflow: hidden`**：它会成为滚动容器，内部 sticky 头栏就贴不住视口。
- Shiki 双主题必须配成 `highlight.theme = { default, light, dark }`（产物里是 `--shiki-light` / `--shiki-dark`，`prose.css` 按这两个变量取值）。
- 数学公式走 `remark-math` + `rehype-katex`（构建期出 HTML + MathML），样式在 `prose.css` 的 `.katex*` 段。
- 正文不允许内联裸 HTML（MDC 会丢弃）；需要结构化块时用 Vue 组件或 MDC 语法。

## 字体与图标

- 字体**全部自包含，不再走 CDN**，仓库依旧不保留字体文件，且 `ui.fonts: false` 不允许 @nuxt/fonts 接管：
  - HarmonyOS Sans SC（`harmonyos-sans-sc-webfont-splitted@1.1.0` 的 `Regular` / `Medium` / `Bold` 三档分片）—— 正文与 UI。构建期由 `scripts/sync-fonts.mjs` 灌注到 `.output/public/fonts/` 并合成 `harmonyos.css`，`app.head` 只引这一个本地样式表；dev 下由 `nitro.publicAssets` 直接挂 npm 包目录。
  - Cascadia Code（`@fontsource/cascadia-code`）—— 代码块等宽，`main.css` 引 `400.css` / `700.css` 交给 Vite 打包。
    回退链定义在 `base.css` 的 `--font-ui` / `--font-code`。
  - `scripts/verify-output.mjs` 会断言产物里有 `fonts/harmonyos.css` 且首页不再出现 `cdn.jsdelivr.net`；改字体链路时先确认这两条断言仍成立。
- 图标统一 `<Icon name="i-lucide-xxx" />` / `<UIcon>`（品牌图标 `i-simple-icons-xxx`）。
- **新增动态 `:name` 图标必须同步 `nuxt.config.ts` 的 `icon.clientBundle.icons`**：`scan` 只认模板里的字面量，动态绑定的不登记会退化成运行时取图。
- `app.config.ts` 的 `icon.mode: 'svg'` 保证构建期内联 `<svg>`，**别改成 `css`**。
- 网站 Logo 是 `public/images/logo.webp`；首页头像是 `public/images/avatar.svg`（纯几何占位，换图只改 `app/data/home.ts` 的 `AVATAR`）。

## 无障碍与降级

- 图标一律 `aria-hidden="true"` 并配文字或 `aria-label`；可切换按钮补 `aria-expanded` / `aria-controls` / `aria-current`。
- 主内容使用 `<main id="content" role="main">`；`<html class="js">` 只在 JS 可用时由 head 内联脚本添加，`html:not(.js)` 的降级样式必须保持可用。
- 无 JS 降级规则统一写在 `base.css` 末尾的「无 JavaScript 降级」段，**不要写进组件的 `<style scoped>`**（Vue scoped 会把 `:global(html:not(.js)) .foo` 收窄错）。
- 不要在模板里用 `<noscript>` 做降级（会造成 hydration mismatch），统一走 `html:not(.js)` + CSS。
- 响应式显隐用 `lg:hidden` 这类 class，**不要用 `hidden` 属性**：Preflight 给 `[hidden]` 加了 `display:none !important`，工具类救不回来。

## 动效契约

- 滚动淡入的契约是 **`data-reveal="hidden|shown"`**（`useScrollReveal` 打标，`animation.css` 消费），选择器为 `#content .page-shell > * > *`。**页面结构必须保持「UContainer.page-shell → 视图根 div → section」这三层**，否则淡入静默失效（元素仍可见，很难发现）。
- 页面过渡由 `app.pageTransition` 的 `.page-enter-*` / `.page-leave-*` 提供，不再有 `clip-path` 舱门动画。

## 配置与类型（易踩坑）

- `tsconfig.json` 只 `extends ./.nuxt/tsconfig.json`；别名：`~` / `@` → `app/`，`~~` → 仓库根，`#shared` → `shared/`，`#server` → `server/`。
- 改了影响类型 / 别名的 `nuxt.config.ts` 或 `app.config.ts` 后跑一次 `pnpm exec nuxt prepare`（`#build/ui.css` 也靠它生成）。
- `@nuxt/content` 需要 `better-sqlite3` 原生绑定：已在 `pnpm-workspace.yaml` 的 `allowBuilds` 放行，**不要在 CI 上加 `--ignore-scripts`**。
- 服务端路由里查询内容库必须 `queryCollection(event, 'posts')`（带 event）；JSON 路由用 `api/xxx.json.ts`，不要写 `[slug].json.ts`（Nitro 会把后缀并进参数）。
- `:to="/"` 是非法绑定（会被当成正则），写 `to="/"`。
- `ui.colorMode: false` 与 `ui.fonts: false` 都不能打开：前者会注入第二个首帧脚本（按系统偏好写 `.dark`）与 `cfo-theme` 打架，后者会接管字体栈。

## Git 与协作

- **不要直接向 `master` 推送**：改动走「分支 + PR」，`master` 只接受合并（`master` 的推送由 Cloudflare 的 Git 集成自动部署，非生产分支 / PR 自动生成预览）。
- 分支命名 `feat/<简述>` / `fix/<简述>` / `refactor/<简述>` / `style/<简述>`；同一主题的多次提交留在同一分支。
- **每个提交都要能独立 `pnpm build` 通过**；改版按「可回滚单元」拆（换组件 → 调样式 → 补文档），便于单独 revert。
- 提交信息用中文，`feat:` / `fix:` / `style:` / `chore:` / `docs:` 前缀；正文写「为什么、影响面」，不复述 diff。中文信息写入 UTF-8（无 BOM）文件后 `git commit -F`。
- 不要提交产物与临时文件；不要为本地调试临时改 `PAGE_SIZE`、`failOnError` 后忘记还原。
- 依赖变更必须同时提交 `pnpm-lock.yaml`；新增需要构建脚本的依赖要在 `pnpm-workspace.yaml` 的 `allowBuilds` 放行。
- 视觉改动请附截图：浅色 + 深色、桌面 + ≤1024px 各一组。
- 不要对已推送的分支 `rebase` / `force-push`；同步用 merge。

## 提交前自检清单

1. `pnpm build` 通过且零警告（`failOnError: true`，任何预渲染 404 都会失败）。
2. `find .output/public -name "*.html"` 与预期路由一致（**没有 `about.html`**）；中文分类 / 标签文件名未被百分号编码。
3. 浏览器实看（`pnpm preview`）：`/`、`/posts/`、`/archives/`、`/categories/`、`/tags/`、`/search/`、一篇 `/posts/<slug>`；确认产物里没有 `tools/`。
4. 桌面与 ≤1024px 各过一遍：汉堡下拉开合（收起时 `inert`）、搜索弹窗（`Ctrl / ⌘ + K` 与 `/`）、主题三态切换、返回顶部。
5. 顶栏与底栏都只有「首页 / 博客 / 工具」，且「工具」为站外链接（新标签页、带 ↗、不高亮）；归档 / 分类 / 标签只在博客页顶部出现。
6. 站内跳转不整页刷新（Network 里不应出现 document 请求）；跳页从顶部开始，后退回到原位置。
7. 新增图标已登记进 `icon.clientBundle.icons`；新增颜色 / 圆角来自变量；新增动效有 reduced-motion 分支。
8. 目录行为正确：没写 `[TOC]` 的文章不出目录，写了的只出一个、且就在写的位置。
9. 没有提交构建产物、缓存或临时文件。
10. `pnpm format:check`、`pnpm lint`、`pnpm build` 都通过（CI 只有这一条门禁，本地先跑一遍省得等）。
11. 字体自包含生效：`.output/public/fonts/harmonyos.css` 存在，产物里没有字体 CDN 链接；`pnpm build` 的 `verify-output` 未报错。
12. `public/` 里只有资源（图片、favicon、giscus 皮肤），没有新增的注入式 JS / CSS。
