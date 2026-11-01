import tailwindcss from '@tailwindcss/vite';
import { buildRoutes } from './build/post-index';
import { rehypeExternalLinksBlank } from './build/rehype-external-links';

// ============================================================
// 冷域观者的个人网站 · Nuxt 站点配置
//   - 纯静态站点：`nuxt generate` 产出 .output/public，部署 GitHub Pages
//   - 内容由 @nuxt/content v3 驱动（content/posts/*.md）
//   - 样式由 Nuxt UI 4 接管（圆角 + 描边 + hover 阴影），
//     主题色与字体栈仍来自项目令牌（app/assets/styles/base.css）
// ============================================================
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  ssr: true,
  devtools: { enabled: false },

  modules: ['@nuxt/content', '@nuxt/ui'],

  // ============================================================
  // Nuxt UI 接入策略
  //   - fonts: false —— 字体由 app.head 的 CDN <link> 提供，
  //     不交给 @nuxt/fonts 接管（否则会自建 @font-face 并改字体栈）
  //   - colorMode: false —— 主题三态仍由 useTheme.ts 独占。
  //     开着会注入第二个首帧脚本，按系统偏好写 .dark，与 "cfo-theme" 打架
  //   - theme.colors 只生成实际用到的语义色，减小产物体积
  // ============================================================
  ui: {
    fonts: false,
    colorMode: false,
    theme: {
      colors: ['primary', 'error'],
    },
    experimental: {
      componentDetection: true,
    },
  },

  app: {
    baseURL: '/',
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      // 默认标题：页面各自 useHead 覆盖，error.vue / 404 等没有设标题时兜底
      title: '冷域观者的个人网站',
      meta: [
        { name: 'author', content: 'ColdFieldObserver' },
        {
          name: 'keywords',
          content:
            'ColdFieldObserver, 冷域观者, 逃少音乐档案馆, 逃跑吧少年背景音乐, CFObserver, 在线工具, Base64, Unicode, 时间戳, URL编码, 蛋仔派对',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/images/favicon.ico' },
        { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: '' },
        // Giscus 评论区在文章页底部，懒加载触发时才注入 iframe；
        // 预连接可省掉首次展开评论时的 DNS + TCP + TLS 握手
        { rel: 'preconnect', href: 'https://giscus.app' },
        // 字体全部走 CDN，仓库不保留字体文件：
        //   HarmonyOS Sans SC（400/500/700，unicode-range 分片）+ Cascadia Code（代码块）
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/harmonyos-sans-sc-webfont-splitted@1.1.0/dist/Regular.css',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/harmonyos-sans-sc-webfont-splitted@1.1.0/dist/Medium.css',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/harmonyos-sans-sc-webfont-splitted@1.1.0/dist/Bold.css',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/@fontsource/cascadia-code@5.2.3/index.min.css',
        },
        {
          rel: 'alternate',
          type: 'application/atom+xml',
          title: '冷域观者的个人网站 · Atom 订阅',
          href: '/atom.xml',
        },
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: '冷域观者的个人网站 · RSS 订阅',
          href: '/rss.xml',
        },
      ],
      script: [
        // 首帧同步脚本：把用户选择的主题同时写进 <html data-theme> 与 .dark/.light。
        // 两套标记必须同时落地 —— data-theme 驱动本项目令牌，
        // class 驱动 Nuxt UI 的 --ui-* 语义变量，漏一个深色首屏就会闪白。
        // storage key 与 app/composables/useTheme.ts 保持一致。
        {
          innerHTML:
            'try{var t=localStorage.getItem("cfo-theme")||"auto";var d=t==="dark"||(t==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.setAttribute("data-theme",t);r.classList.toggle("dark",d);r.classList.toggle("light",!d)}catch(e){var r=document.documentElement;r.setAttribute("data-theme","auto");r.classList.add("light")}',
          tagPriority: 'critical',
        },
        // 首帧同步脚本：DOM 解析时立即给 <html> 加 .js。
        // 禁用 JS 时此脚本不执行，所有 html:not(.js) 的降级规则自动生效。
        {
          innerHTML: 'document.documentElement.classList.add("js");',
          tagPriority: 'critical',
        },
      ],
    },
    // 保住 .page-enter-from / .page-leave-to 等类名（见 animation.css）
    pageTransition: { name: 'page', mode: 'out-in', appear: true },
  },

  css: ['katex/dist/katex.min.css', '~/assets/styles/main.css'],

  // 内容渲染：目录深度、双主题代码高亮、数学公式（KaTeX 替代旧的 mathjax3）
  content: {
    build: {
      markdown: {
        toc: { depth: 3, searchDepth: 3 },
        highlight: {
          // 键名必须是 light / dark：产物才是 --shiki-light / --shiki-dark，
          // 与 prose.css 里自行的双主题规则对齐；default 是类型要求的基础主题
          theme: { default: 'github-light', light: 'github-light', dark: 'github-dark' },
          langs: [
            'bash',
            'css',
            'diff',
            'html',
            'js',
            'json',
            'md',
            'scss',
            'shell',
            'ts',
            'vue',
            'xml',
            'yaml',
          ],
        },
        remarkPlugins: { 'remark-math': {} },
        rehypePlugins: {
          'rehype-katex': {},
          // 站外链接补 target="_blank" rel="noopener noreferrer"（见 build/rehype-external-links.ts）
          'rehype-external-links-blank': { instance: rehypeExternalLinksBlank },
        },
      },
    },
  },

  // 组件按文件名注册（<ListView> / <PostCard> …），模板保持零改动
  components: [{ path: '~/components', pathPrefix: false }],

  // 图标：只用本地 @iconify-json 集合，构建期直接内联 SVG。
  // 动态绑定（:name="item.icon"）扫描不到，必须显式登记。
  icon: {
    serverBundle: { collections: ['lucide', 'simple-icons'] },
    clientBundle: {
      scan: true,
      sizeLimitKb: 256,
      icons: [
        'lucide:archive',
        'lucide:arrow-right',
        'lucide:arrow-up',
        'lucide:arrow-up-right',
        'lucide:check',
        'lucide:chevron-right',
        'lucide:copy',
        'lucide:folder',
        'lucide:gamepad-2',
        'lucide:globe',
        'lucide:hash',
        'lucide:house',
        'lucide:info',
        'lucide:menu',
        'lucide:monitor',
        'lucide:moon',
        'lucide:newspaper',
        'lucide:rss',
        'lucide:search',
        'lucide:sun',
        'lucide:sun-moon',
        'lucide:tags',
        'lucide:wrench',
        'lucide:x',
        'simple-icons:bilibili',
        'simple-icons:github',
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    // Tailwind v4 官方支持矩阵；低于此版本的自定义属性 / color-mix 会静默降级
    build: {
      cssTarget: ['chrome111', 'edge111', 'firefox128', 'safari16.4', 'ios16.4'],
    },
  },

  nitro: {
    prerender: {
      // 路由由 build/post-index.ts 显式枚举，不靠爬虫
      crawlLinks: false,
      failOnError: true,
      // /posts/xxx → posts/xxx.html（无尾斜杠、无子目录 index）
      autoSubfolderIndex: false,
    },
  },

  // 唯一的路由枚举入口：build/post-index.ts 在构建期读 frontmatter
  hooks: {
    'prerender:routes'(ctx) {
      for (const route of buildRoutes()) ctx.routes.add(route);
    },
  },

  experimental: {
    payloadExtraction: 'client',
  },
});
