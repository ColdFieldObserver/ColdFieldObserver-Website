<script setup lang="ts">
import { computed } from 'vue';
import { useAllPosts, usePagedPosts } from '~/composables/usePosts';

const props = defineProps<{ page?: number }>();

const all = useAllPosts();
const { pagePosts, totalPages, page } = usePagedPosts(
  () => props.page ?? 1,
  () => all.value,
);

const summary = computed(
  () => `共 ${all.value.length} 篇文章 · 第 ${page.value} / ${totalPages.value} 页`,
);

useHead({ title: '博客文章' });
</script>

<template>
  <ListPage
    title="博客文章"
    :summary="summary"
    :posts="pagePosts"
    :current="page"
    :total-pages="totalPages"
    first-href="/posts/"
    page-prefix="/posts/page/"
    show-chips
    show-search
    empty-text="还没有文章"
  />
</template>
