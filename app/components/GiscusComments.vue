<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { GISCUS, SITE } from '#shared/site';
import { initTheme, onThemeChange, resolvedDark } from '~/composables/useTheme';

// Giscus 评论：客户端按路由动态注入脚本，兼容 SPA 导航。
// 三处增强（与参考项目一致）：
//   1. 懒初始化 —— 评论区在页面底部，滚到附近（rootMargin 400px）才拉脚本，
//      打开文章本身不再请求 giscus.app
//   2. 加载占位骨架屏 —— iframe 就绪前保持视觉填充
//   3. 配色跟随站点主题 —— 用 public/giscus/{light,dark}.css 这套机甲蓝皮肤
//
// 皮肤不生效的几个常见原因，这里都兜住了：
//   - 注入脚本时用的主题取决于 resolvedDark，而 resolvedDark 依赖 matchMedia 的
//     首次读取；先 initTheme() 再取 -> 首帧就是正确皮肤
//   - iframe 加载完成后 giscus 会用 data-theme 重新渲染，若首帧主题被忽略
//     （例如暗色系统下拿到 light），这里在 iframe load 与主题变化时各补一次
//     postMessage，保证最终配色与站点一致
//   - 主题 CSS 由 giscus 的 iframe 跨源拉取，域名迁移后旧域名 301 会丢掉 CORS
//     响应头，样式表被浏览器拦掉就退回默认皮肤；见 giscusTheme()
const route = useRoute();
const container = ref<HTMLElement | null>(null);
const loading = ref(true);

const GISCUS_ORIGIN = 'https://giscus.app';

let observer: MutationObserver | null = null;
let visibilityObserver: IntersectionObserver | null = null;
let stopThemeWatch: (() => void) | null = null;
let fallbackTimer: number | null = null;

/**
 * 当前应使用的机甲配色 giscus 样式表（绝对地址，giscus 只接受公网可访问 URL）。
 *
 * 必须随实际访问源走，不能写死域名：giscus 是在它自己的 iframe 里以 CORS 方式
 * 拉取这份 CSS 的，而带 Origin 的跳转响应（例如域名迁移后旧站 301 到新站）
 * 不带 Access-Control-Allow-Origin，浏览器会直接拦掉跨源样式表，giscus 于是
 * 退回默认皮肤 —— 表现就是「主题失效」。用当前 https 源可天然免疫域名迁移；
 * http（本地预览）与 SSR 场景退回 SITE.mainUrl。
 */
function giscusTheme(): string {
  const theme = resolvedDark.value ? 'dark' : 'light';
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const base = origin.startsWith('https://') ? origin : SITE.mainUrl;
  return new URL(`/giscus/${theme}.css`, `${base}/`).href;
}

/** 已加载的 iframe 无法改属性，需通过 postMessage 通知它切换配色 */
function syncGiscusTheme(): void {
  const frame = container.value?.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
  frame?.contentWindow?.postMessage(
    { giscus: { setConfig: { theme: giscusTheme() } } },
    GISCUS_ORIGIN,
  );
}

function clearFallback(): void {
  if (fallbackTimer !== null) {
    window.clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }
}

function mountGiscus(): void {
  const el = container.value;
  if (!el) return;
  // 每次路由变化都重建，避免评论串页
  el.innerHTML = '';
  loading.value = true;
  clearFallback();

  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  const attrs: Record<string, string> = {
    'data-repo': GISCUS.repo,
    'data-repo-id': GISCUS.repoId,
    'data-category': GISCUS.category,
    'data-category-id': GISCUS.categoryId,
    'data-mapping': GISCUS.mapping,
    'data-strict': GISCUS.strict,
    'data-reactions-enabled': GISCUS.reactionsEnabled,
    'data-emit-metadata': GISCUS.emitMetadata,
    'data-input-position': GISCUS.inputPosition,
    'data-theme': giscusTheme(),
    'data-lang': GISCUS.lang,
    'data-loading': GISCUS.loading,
  };
  for (const [key, value] of Object.entries(attrs)) {
    script.setAttribute(key, value);
  }
  el.appendChild(script);

  // giscus 异步注入 iframe：等它 load 后再收起骨架屏，并补一次主题同步
  observer?.disconnect();
  observer = new MutationObserver(() => {
    const frame = el.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (!frame || frame.dataset.bound === '1') return;
    frame.dataset.bound = '1';
    frame.addEventListener('load', () => {
      loading.value = false;
      clearFallback();
      syncGiscusTheme();
    });
    observer?.disconnect();
    observer = null;
  });
  observer.observe(el, { childList: true, subtree: true });

  // 兜底：脚本被拦截 / 长期未就绪时也收起骨架屏
  fallbackTimer = window.setTimeout(() => {
    loading.value = false;
    fallbackTimer = null;
  }, 10000);
}

onMounted(() => {
  // 先落地主题，再取 giscusTheme()，否则暗色系统首帧会拿到 light
  initTheme();
  stopThemeWatch = onThemeChange(syncGiscusTheme);

  const host = container.value;
  if (!host || typeof IntersectionObserver === 'undefined') {
    void nextTick(mountGiscus);
    return;
  }

  visibilityObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      visibilityObserver?.disconnect();
      visibilityObserver = null;
      void nextTick(mountGiscus);
    },
    { rootMargin: '400px 0px' },
  );
  visibilityObserver.observe(host);
});

watch(
  () => route.fullPath,
  () => {
    // 已经加载过（用户滚到过评论区）时，切文章要重建评论
    if (visibilityObserver) return;
    void nextTick(mountGiscus);
  },
);

onBeforeUnmount(() => {
  observer?.disconnect();
  visibilityObserver?.disconnect();
  visibilityObserver = null;
  clearFallback();
  stopThemeWatch?.();
  if (container.value) container.value.innerHTML = '';
});
</script>

<template>
  <div>
    <!-- 加载占位：骨架条降低「页面底部空白」的观感 -->
    <div v-if="loading" class="flex flex-col gap-3 py-1.5" aria-hidden="true">
      <div class="h-3.5 w-[30%] animate-pulse bg-line" />
      <div class="h-3.5 w-full animate-pulse bg-line" />
      <div class="h-3.5 w-[70%] animate-pulse bg-line" />
    </div>
    <div ref="container" />
  </div>
</template>
