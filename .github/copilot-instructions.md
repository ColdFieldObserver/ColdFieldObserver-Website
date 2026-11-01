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

### 一致性
- 文章列表（新闻 / 分类 / 标签 / 搜索 / 首页最新日志）**必须复用同一套卡片机制**：`PostCard` + `CardGrid` + `Pagination` + `usePagedPosts`。归档页例外（按年分页 + 按月分组）。
- 卡片信息固定为三行：**标题 / 分类 · 日期 / 摘要**。封面通栏 16:9，不加 hover 缩放。
- 站点导航的单一数据源是 `app/data/nav.ts`：
  - **顶栏只有一级入口**：首页 / 博客 / 工具（`NAV_ITEMS`）；
  - **归档 / 分类 / 标签是博客子导航**（`BLOG_SUB_NAV`），只出现在博客列表页顶部（`ChipsNav`），**顶栏与底栏都不要放**；
  - 归档 / 分类 / 标签 / 搜索这些路径在顶栏统一高亮「博客」（`activeNavKey` 的 `isBlogSection`）。
- 「个人档案 / 身份主线 / 友情链接 / 社交账号」集中在 `app/data/profile.ts`；「项目 / 游戏 ID / 站点说明」在 `app/data/home.ts`。不要在组件里另写一份文案。
- 移动端导航是 `UHeader` 的 `#bottom` 下拉面板（`grid-rows-[0fr]↔[1fr]` + `inert`），**不是抽屉**：不要引入 `UDrawer` / `USlideover` / 边缘手势。

## 项目概况

| 项 | 值 |
| --- | --- |
| 定位 | 个人站点，纯静态（SSG），部署于 GitHub Pages |
| 线上地址 | https://coldfieldobserver.github.io（`app.baseURL = '/'`，URL 不带 `.html` 与尾斜杠） |
| 技术栈 | Nuxt `4.6.3` + Vue 3 + TypeScript `~7.0.2` + Tailwind CSS `4.3.3` + **Nuxt UI `4.12`** + @nuxt/content `3.16` |
| 包管理器 | pnpm 12（依赖构建设置在 `pnpm-workspace.yaml` 的 `allowBuilds`） |
| 发布流程 | 推送到 `master` → `.github/workflows/deploy.yml` 构建并部署 `.output/public` |
| 许可证 | MIT |

> 样式由 Nuxt UI 4 接管，**只在确有特殊定制时才手写 CSS**。图标走 Nuxt UI 内置的 `@nuxt/icon`（不要另装 `@nuxt/icon`，两份实例会让 clientBundle 失效）。

## 常用命令

```bash
pnpm dev                       # 本地开发（默认 http://localhost:3000）
pnpm build                     # 生产构建 = nuxt generate，产物在 .output/public
pnpm exec nuxt prepare         # 生成 .nuxt 类型与 #build/ui.css（改 nuxt.config / app.config 后跑一次）
```

- **构建必须零错误零警告**：`nitro.prerender.failOnError: true`，任何预渲染路由 404 都会让构建失败。
- `nuxt generate` 只产出 `.output/public`（没有 server 产物），因此 `pnpm preview` 不可用；本地验收静态站点请用支持「无扩展名 → `.html` 回退」的静态服务器。
- 构建前若 `.output` 已存在且很大，先 `rm -rf .output`：部分环境里 Nitro 的清理逻辑走回收站会超时。
- 项目没有测试，验收方式：`pnpm build` 通过 + 浏览器实看。

## 目录结构

```
app/
├─ app.vue                        # <UApp> + 全局 titleTemplate（withSiteSuffix）
├─ app.config.ts                  # Nuxt UI 主题映射（ui.colors / header / pageGrid）+ icon.mode
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
public/                           # 图片（logo.webp / avatar.svg）、favicon、giscus 主题
server/routes/                    # atom.xml、rss.xml、api/posts.json、api/search.json
shared/                           # site.ts（SITE / TOOL_LINKS / PAGE_SIZE / GISCUS）、types/、utils/
build/post-index.ts               # 构建期 fs 枚举：prerender 路由全集
content.config.ts / nuxt.config.ts
```

不要提交 `.nuxt/`、`.output/`、`.data/`、`debug.log` 等产物与日志（已在 `.gitignore`）。

## 路由与页面机制

- **路由 = 文件**，没有 `frontmatter.layout` 分派。页面壳只做三件事：取数据、写 `useHead` 标题、`throw createError` 校验参数。
- 路由表：

| URL | 文件 |
| --- | --- |
| `/`、`/search/` | `pages/index.vue`、`search.vue` |
| `/posts/`、`/posts/page/:n`、`/posts/:slug` | `pages/posts/index.vue`、`posts/page/[page].vue`、`posts/[slug].vue` |
| `/archives/`、`/archives/page/:n` | `pages/archives/**`（第 n 页 = 第 n 个年份） |
| `/categories/`、`/categories/:name(/page/:n)` | `pages/categories/**` |
| `/tags/`、`/tags/:tag(/page/:n)` | `pages/tags/**` |
| `/tools/`、`/tools/:slug` | `pages/tools/**`（5 个纯前端工具，单页分派） |

- **没有 `/about`**：关于信息拆到首页「关于我 / 关于这个站点」与底栏版权行。要加回整页必须先改这里与 `buildRoutes()`。
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
- 站点信息、工具清单、Giscus 配置在 `shared/site.ts`；个人信息与首页内容在 `app/data/*.ts`。
- **目录只在正文显式写 `[TOC]` 时才生成**：`usePostEnhance` 的 `mountTocPlaceholder()` 会把内容为 `[TOC]`（或被 MDC 吞掉方括号后只剩 `TOC`）的段落替换成 `div.post-toc[data-post-toc]`。页面里**不要**再放固定的目录容器，否则会出现两个目录。
- 文章内增强由 `usePostEnhance.ts` 在客户端完成：目录填充、页内锚点接管（`preventDefault` + `replaceState`，避免「默认跳转 + 手动对齐 + hashchange」三重滚动）。**Mermaid 已移除**，图表请用图片或外链。

## 样式与 Nuxt UI 约定

- 全局样式在 `app/assets/styles/`：`main.css`（入口）→ `tokens.css`（`@theme` 令牌）→ `base.css`（真值变量 + Preflight 之后的补丁）→ `prose.css` / `animation.css`。页面与组件样式写在各自 `.vue` 的 `<style scoped>`。
- `main.css` 顺序即正确性，**不要动**：

  ```css
  @layer theme, base, components, utilities;
  @import "tailwindcss/theme.css" layer(theme);
  @import "tailwindcss/preflight.css" layer(base);
  @import "tailwindcss/utilities.css" layer(utilities);
  @import "@nuxt/ui";   /* 必须在 tokens.css 之前，让自定义 @custom-variant dark 覆盖它 */
  ```

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

- 字体走 CDN（`nuxt.config.ts` 的 `app.head`），**仓库不保留字体文件**，且 `ui.fonts: false` 不允许 @nuxt/fonts 接管：
  - HarmonyOS Sans SC（`harmonyos-sans-sc-webfont-splitted@1.1.0` 的 `Regular` / `Medium` / `Bold` 三个 unicode-range 分片）—— 正文与 UI；
  - Cascadia Code（`@fontsource/cascadia-code@5.2.3`）—— 代码块等宽。
  回退链定义在 `base.css` 的 `--font-ui` / `--font-code`。
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

- **不要直接向 `master` 推送**：改动走「分支 + PR」，`master` 只接受合并（部署 workflow 由 `master` 触发）。
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
3. 浏览器实看：`/`、`/posts/`、`/archives/`、`/categories/`、`/tags/`、`/search/`、`/tools/`、一篇 `/posts/<slug>`。
4. 桌面与 ≤1024px 各过一遍：汉堡下拉开合（收起时 `inert`）、搜索弹窗（`Ctrl / ⌘ + K` 与 `/`）、主题三态切换、返回顶部。
5. 顶栏与底栏都只有「首页 / 博客 / 工具」；归档 / 分类 / 标签只在博客页顶部出现。
6. 站内跳转不整页刷新（Network 里不应出现 document 请求）；跳页从顶部开始，后退回到原位置。
7. 新增图标已登记进 `icon.clientBundle.icons`；新增颜色 / 圆角来自变量；新增动效有 reduced-motion 分支。
8. 目录行为正确：没写 `[TOC]` 的文章不出目录，写了的只出一个、且就在写的位置。
9. 没有提交构建产物、缓存或临时文件。
