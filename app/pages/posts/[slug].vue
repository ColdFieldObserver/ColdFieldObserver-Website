<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useAllPosts } from '~/composables/usePosts';
import { enhancePost } from '~/composables/usePostEnhance';

const route = useRoute();
const all = useAllPosts();

// 页面在 <Suspense> 内，允许顶层 await；只取当前文章，不拉全站正文
const { data: post } = await useAsyncData(`post:${route.path}`, () =>
  queryCollection('posts').path(route.path).first(),
);

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: '文章不存在', fatal: true });
}

const index = computed(() => all.value.findIndex((item) => item.url === route.path));
const prev = computed(() => (index.value > 0 ? all.value[index.value - 1] : undefined));
const next = computed(() =>
  index.value >= 0 && index.value < all.value.length - 1 ? all.value[index.value + 1] : undefined,
);

/** 文章头部的元信息（日期 + 分类 + 标签） */
const meta = computed(() => ({
  date: all.value[index.value]?.date ?? '',
  categories: all.value[index.value]?.categories ?? [],
  tags: all.value[index.value]?.tags ?? [],
}));

// 目录不再由页面决定：正文里写了 [TOC] 才有目录（见 usePostEnhance 的 mountTocPlaceholder）

/**
 * 正文增强：目录填充、锚点精确对齐、代码块复制按钮。
 * 必须在 DOM 就绪后调用；站内跳转时按路由重置内部缓存。
 */
function runEnhance(): void {
  void enhancePost(route.path);
}

onMounted(runEnhance);
watch(
  () => route.path,
  () => requestAnimationFrame(runEnhance),
);

useHead({ title: post.value.title });
</script>

<template>
  <article v-if="post" class="post-view">
    <nav class="mb-4" aria-label="返回文章列表">
      <UButton
        to="/posts/"
        variant="soft"
        color="primary"
        size="sm"
        icon="i-lucide-arrow-left"
        label="返回博客"
      />
    </nav>

    <header class="mb-7">
      <h1 class="post-title">{{ post.title }}</h1>
      <div class="post-meta">
        <time>{{ meta.date }}</time>
        <NuxtLink
          v-for="category in meta.categories"
          :key="category"
          :to="`/categories/${category}`"
        >
          <UBadge color="primary" variant="soft" size="sm">{{ category }}</UBadge>
        </NuxtLink>
        <NuxtLink v-for="tag in meta.tags" :key="tag" :to="`/tags/${tag}`">
          <UBadge color="neutral" variant="soft" size="sm">#{{ tag }}</UBadge>
        </NuxtLink>
      </div>
    </header>

    <div class="post-content">
      <ContentRenderer :value="post" />
    </div>

    <nav
      class="mt-10 flex justify-between gap-4 border-t border-default pt-5"
      aria-label="上一篇 / 下一篇"
    >
      <NuxtLink v-if="prev" class="max-w-[46%] text-sm text-primary hover:underline" :to="prev.url">
        ← {{ prev.title }}
      </NuxtLink>
      <span v-else />
      <NuxtLink
        v-if="next"
        class="ml-auto max-w-[46%] text-right text-sm text-primary hover:underline"
        :to="next.url"
      >
        {{ next.title }} →
      </NuxtLink>
    </nav>

    <section class="mt-10" aria-label="评论">
      <GiscusComments />
    </section>
  </article>
</template>
