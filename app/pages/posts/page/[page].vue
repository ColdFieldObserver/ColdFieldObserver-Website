<script setup lang="ts">
import { computed } from 'vue';
import { useAllPosts, usePagedPosts } from '~/composables/usePosts';

const route = useRoute();
const pageNo = computed(() => Number(route.params.page) || 1);

const all = useAllPosts();
const { pagePosts, totalPages, page } = usePagedPosts(
  () => pageNo.value,
  () => all.value,
);

const summary = computed(
  () => `共 ${all.value.length} 篇文章 · 第 ${page.value} / ${totalPages.value} 页`,
);

useHead({ title: computed(() => `博客文章 · 第 ${pageNo.value} 页`) });
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
    empty-text="还没有日志"
  />
</template>
