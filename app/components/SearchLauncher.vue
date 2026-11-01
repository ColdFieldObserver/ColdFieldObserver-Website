<script setup lang="ts">
import { openSearchDialog } from '~/composables/useSearch';

// 搜索入口有两种形态：
//   compact —— 顶栏图标按钮
//   默认    —— 列表页顶部的整行输入框样式按钮
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });
</script>

<template>
  <UButton
    v-if="compact"
    class="search-launcher"
    variant="ghost"
    color="neutral"
    square
    icon="i-lucide-search"
    aria-label="搜索"
    aria-haspopup="dialog"
    @click="openSearchDialog($event.currentTarget as HTMLElement)"
  />

  <div v-else class="mb-5">
    <UButton
      class="search-launcher w-full justify-start"
      variant="outline"
      color="neutral"
      size="lg"
      icon="i-lucide-search"
      aria-haspopup="dialog"
      @click="openSearchDialog($event.currentTarget as HTMLElement)"
    >
      <span class="flex-1 text-left text-toned">检索文章标题、正文与标签…</span>
      <UKbd size="sm">Ctrl K</UKbd>
    </UButton>

    <!-- 无 JS 时上面的弹窗打不开，退化成站内搜索页链接 -->
    <NuxtLink class="search-launcher-fallback hidden text-primary underline" to="/search/">
      打开搜索页
    </NuxtLink>
  </div>
</template>
