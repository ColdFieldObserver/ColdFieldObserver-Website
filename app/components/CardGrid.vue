<script setup lang="ts">
import type { Post } from '#shared/types/post';

// 文章网格：与 UPageGrid 的 auto-fill 密度规则一致，
// 列数交给容器宽度决定，不需要写单列媒体查询。
withDefaults(
  defineProps<{
    posts: Post[];
    emptyText?: string;
  }>(),
  { emptyText: '暂无内容' },
);
</script>

<template>
  <div class="card-grid grid grid-cols-[repeat(auto-fill,minmax(min(290px,100%),1fr))] gap-4">
    <p v-if="!posts.length" class="col-span-full py-11 text-center text-sm text-dimmed">
      {{ emptyText }}
    </p>
    <template v-else>
      <PostCard v-for="post in posts" :key="post.url" :post="post" />
    </template>
  </div>
</template>
