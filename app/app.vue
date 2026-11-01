<script setup lang="ts">
import { withSiteSuffix } from '#shared/utils/title';

// ============================================================
// 全局标题模板：所有页面标题统一补「· 冷域观者的个人网站」后缀
//   已含站点全名的标题（首页）不会重复追加，见 withSiteSuffix。
// ============================================================
useHead({
  titleTemplate: (title) => withSiteSuffix(title),
});
</script>

<template>
  <!-- UApp 提供 Toast / Tooltip / 程序化浮层的容器，必须是应用根节点 -->
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
