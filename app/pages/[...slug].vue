<script setup lang="ts">
// 兜底路由：任何没有对应页面的路径都在这里抛 404。
//
// 为什么需要它：本站没有 `pages/[...slug].vue` 时，vue-router 在服务端解析
// 一个不存在的路径会直接报 `[VUE_ROUTER_R0004] No match found for location`；
// 有了这条 catch-all，路由总能匹配上，再由 createError 走正常的 404 流程
// （error.vue 保留站点外壳）。
//
// 注意：prerender 的路由由 build/post-index.ts 显式枚举，这条不会被预渲染。
throw createError({
  statusCode: 404,
  statusMessage: '页面不存在',
  fatal: true,
});
</script>

<template>
  <div />
</template>
