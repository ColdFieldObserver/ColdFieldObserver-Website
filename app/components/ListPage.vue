<script setup lang="ts">
import type { Post } from '#shared/types/post';

// 列表页通用壳：标题 + 统计 + 快捷入口 + 卡片网格 + 分页
withDefaults(
  defineProps<{
    title: string;
    summary?: string;
    posts: Post[];
    current: number;
    totalPages: number;
    firstHref: string;
    pagePrefix: string;
    showChips?: boolean;
    showSearch?: boolean;
    emptyText?: string;
  }>(),
  { showChips: false, showSearch: false, emptyText: '暂无内容' },
);
</script>

<template>
  <div class="mx-auto max-w-page">
    <header class="mb-6 border-b border-default pb-5">
      <h1 class="text-[clamp(24px,3.4vw,32px)] font-extrabold tracking-tight text-highlighted">
        {{ title }}
      </h1>
      <p v-if="summary" class="mt-1.5 text-sm text-dimmed">{{ summary }}</p>
    </header>

    <SearchLauncher v-if="showSearch" />
    <ChipsNav v-if="showChips" class="mb-5" />

    <CardGrid :posts="posts" :empty-text="emptyText" />

    <Pagination
      :current="current"
      :total-pages="totalPages"
      :first-href="firstHref"
      :page-prefix="pagePrefix"
    />
  </div>
</template>
