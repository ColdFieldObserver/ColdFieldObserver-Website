<script setup lang="ts">
import { BLOG_SUB_NAV } from '~/data/nav';

// 博客分区子导航：归档 / 分类 / 标签
// 这三项不再占顶栏位置，统一收在博客列表页顶部（底栏也不放，保持「一级入口」的克制）。
const route = useRoute();
const isActive = (path: string) => route.path.startsWith(path);
</script>

<template>
  <nav class="flex flex-wrap gap-2" aria-label="博客分区导航">
    <UButton
      v-for="item in BLOG_SUB_NAV"
      :key="item.key"
      :to="item.to"
      :icon="item.icon"
      :label="item.label"
      :variant="isActive(item.to) ? 'solid' : 'soft'"
      :color="isActive(item.to) ? 'primary' : 'neutral'"
      size="sm"
    />
  </nav>
</template>
