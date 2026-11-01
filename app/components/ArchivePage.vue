<script setup lang="ts">
import { computed } from 'vue';
import type { Post } from '#shared/types/post';

// 归档：一年一页（与 build/post-index 的分页口径一致）
const props = defineProps<{ posts: Post[]; page: number }>();

/** 所有年份（倒序） */
const years = computed(() => {
  const set = new Set(props.posts.map((post) => post.date.slice(0, 4)));
  return [...set].filter(Boolean).sort((a, b) => b.localeCompare(a));
});

const totalPages = computed(() => Math.max(1, years.value.length));
const currentYear = computed(() => years.value[props.page - 1] ?? '');
const yearPosts = computed(() =>
  props.posts.filter((post) => post.date.startsWith(currentYear.value)),
);

/** 按月份分组（同一年内） */
const months = computed(() => {
  const map = new Map<string, Post[]>();
  for (const post of yearPosts.value) {
    const month = post.date.slice(5, 7);
    const list = map.get(month) ?? [];
    list.push(post);
    map.set(month, list);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, list]) => ({ month: `${Number(month)} 月`, list }));
});
</script>

<template>
  <div class="mx-auto max-w-page">
    <header class="mb-6 border-b border-default pb-5">
      <h1 class="text-[clamp(24px,3.4vw,32px)] font-extrabold tracking-tight text-highlighted">归档</h1>
      <p class="mt-1.5 text-sm text-dimmed">
        共 {{ posts.length }} 篇 · {{ totalPages }} 个年份 · 第 {{ page }} / {{ totalPages }} 页
      </p>
    </header>

    <h2 v-if="currentYear" class="mb-5 flex items-baseline gap-2">
      <span class="text-[26px] leading-none font-extrabold text-highlighted">{{ currentYear }}</span>
      <span class="text-sm text-dimmed">年 · {{ yearPosts.length }} 篇</span>
    </h2>

    <p v-if="!months.length" class="py-11 text-center text-sm text-dimmed">暂无归档内容</p>

    <div v-else class="flex flex-col gap-8">
      <section v-for="group in months" :key="group.month">
        <h3 class="mb-3 text-sm font-semibold text-primary">{{ group.month }}</h3>
        <CardGrid :posts="group.list" />
      </section>
    </div>

    <Pagination
      :current="page"
      :total-pages="totalPages"
      first-href="/archives/"
      page-prefix="/archives/page/"
    />
  </div>
</template>
