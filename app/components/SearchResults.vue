<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue';
import { searchKeyword } from '~/composables/useSearch';
import type { Post } from '#shared/types/post';

// ============================================================
// 检索结果
//   /api/search.json 是构建期固定产物，内容只随部署更新，
//   因此会话内只请求一次；失败不缓存（复位 Promise）以保留重试语义。
// ============================================================
let corpusRequest: Promise<Post[]> | null = null;

function loadCorpus(): Promise<Post[]> {
  corpusRequest ||= $fetch<Post[]>(withBase('/api/search.json')).catch((error) => {
    corpusRequest = null;
    throw error;
  });
  return corpusRequest;
}

const corpus = shallowRef<Post[]>([]);

onMounted(async () => {
  try {
    corpus.value = await loadCorpus();
  } catch {
    corpus.value = [];
  }
});

const tokens = computed(() => searchKeyword.value.toLowerCase().split(/\s+/).filter(Boolean));

const hits = computed(() => {
  if (!tokens.value.length) return [];
  return corpus.value.filter((post) => {
    const haystack = [
      post.title,
      post.description,
      post.categories.join(' '),
      post.tags.join(' '),
      post.content ?? '',
    ].map((text) => text.toLowerCase());
    return tokens.value.every((token) => haystack.some((text) => text.includes(token)));
  });
});

const stats = computed(() => {
  const keyword = searchKeyword.value.trim();
  if (!keyword) return '输入关键词开始检索（支持多个关键词，空格分隔）';
  return `「${keyword}」共命中 ${hits.value.length} 篇`;
});
</script>

<template>
  <div>
    <p class="mb-3 text-sm text-dimmed">{{ stats }}</p>
    <CardGrid :posts="hits" empty-text="没有匹配的文章，换个关键词试试" />
  </div>
</template>
