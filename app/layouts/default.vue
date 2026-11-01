<script setup lang="ts">
import { useScrollReveal, scheduleScrollRevealRefresh } from '~/composables/useScrollReveal';
import { initTheme } from '~/composables/useTheme';

// ============================================================
// 全站壳层：顶栏 + 主内容 + 底栏
// ------------------------------------------------------------
// 滚动模型：body 自然滚动，顶栏 UHeader 自带 sticky top-0。
// 页面容器只负责宽度与内边距，不再承担「唯一滚动容器」的角色
// —— 旧的 height:100vh + overflow-y:auto 的 .site-main 已移除，
// 相应地路由滚动、锚点、返回顶部全部改回监听 window。
//
// 注意：这里不能用顶层 await —— layout 不在 <Suspense> 内，
// 异步 setup 会让客户端 hydration 一直挂起（表现为页面卡死）。
// ============================================================
const nuxtApp = useNuxtApp();
const route = useRoute();
const {
  progress,
  active: progressActive,
  done: progressDone,
  completeRendering,
  start: startProgress,
  markPageLoaded,
} = usePageProgress();

// 站内跳转的真实加载进度（首屏没有全屏 loader，只保留这条细进度条）
const offLoadingStart = nuxtApp.hook('page:loading:start', () => startProgress(false));
const offLoadingEnd = nuxtApp.hook('page:loading:end', () => markPageLoaded());

// 新页面已挂载：等字体 / 图片就绪后收尾进度条，并重新给区块打标
const offPageFinish = nuxtApp.hook('page:finish', () => {
  completeRendering();
  // 用异步补刷而不是立即执行 —— 从页面中部跳转时，新页的滚动回顶发生在
  // 这一帧之后；立刻量尺寸会把所有块误判成「已在视口上方」而跳过动画
  scheduleScrollRevealRefresh();
  // 跨页带 hash：此时新页 DOM 已就绪，交给 usePostEnhance 精确对齐
  if (route.hash) {
    document.dispatchEvent(new CustomEvent('cfo:anchor', { detail: route.hash }));
  }
});

// 过渡结束后再补一次：out-in 期间量到的位置带着过渡位移，不可靠。
// 回顶也必须放在这里 —— 放在 page:finish 会让旧页在淡出时突然跳到顶部。
const offTransitionFinish = nuxtApp.hook('page:transition:finish', () => {
  if (!route.hash) window.scrollTo({ top: 0, behavior: 'auto' });
  scheduleScrollRevealRefresh();
});

// 全站区块的滚动入场（首屏交错 + 视口外按需淡入）
useScrollReveal();

onMounted(() => {
  initTheme();
  if (!route.hash) window.scrollTo({ top: 0, behavior: 'auto' });
  completeRendering();
});

onBeforeUnmount(() => {
  offPageFinish();
  offTransitionFinish();
  offLoadingStart();
  offLoadingEnd();
});
</script>

<template>
  <PageProgress :progress="progress" :active="progressActive" :done="progressDone" />

  <!-- 纵向三段式：顶栏 sticky、主区撑满剩余高度、底栏留在文档流末尾 -->
  <div class="flex min-h-dvh flex-col">
    <SiteHeader />

    <!-- 主内容地标：浏览器阅读模式据此定位正文，忽略顶栏与底栏 -->
    <main id="content" class="flex-1" role="main">
      <UContainer class="page-shell py-6 sm:py-8 lg:py-10">
        <slot />
      </UContainer>
    </main>

    <SiteFooter />
  </div>

  <BackToTop />
  <SearchDialog />
</template>
