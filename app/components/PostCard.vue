<script setup lang="ts">
import { computed } from 'vue';
import type { Post } from '#shared/types/post';

const props = defineProps<{ post: Post }>();

// 封面：外链原样输出，站内相对路径补 base
const coverSrc = computed(() => {
  const cover = props.post.cover;
  if (!cover) return withBase('/images/default_cover.svg');
  if (/^(?:https?:|data:)/i.test(cover)) return cover;
  return withBase(cover.startsWith('/') ? cover : `/${cover}`);
});

/** 分类只取第一个：卡片信息行保持单行 */
const primaryCategory = computed(() => props.post.categories[0] ?? '');
</script>

<template>
  <!--
    卡片结构：封面通栏 + 三行信息（标题 / 分类 · 日期 / 摘要）
    分层只靠描边 + hover 阴影，不用底色差 —— 页面底与卡片白只差约 1% 亮度，
    靠底色分层等于没有边界。
  -->
  <NuxtLink
    class="group flex w-full flex-col overflow-hidden rounded-xl border border-default bg-default transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/55"
    :to="post.url"
  >
    <div class="relative aspect-video w-full overflow-hidden bg-muted">
      <UBadge
        v-if="post.stickypost"
        class="absolute top-2 left-2 z-1"
        color="primary"
        size="sm"
        label="置顶"
      />
      <img
        :src="coverSrc"
        :alt="post.title"
        loading="lazy"
        decoding="async"
        class="size-full object-cover"
      />
    </div>

    <div class="flex flex-1 flex-col gap-3 p-5">
      <h3 class="line-clamp-2 text-base leading-[1.5] font-semibold text-highlighted">
        {{ post.title }}
      </h3>

      <div class="flex flex-wrap items-center gap-1.5 text-[12.5px] text-dimmed">
        <span v-if="primaryCategory" class="font-medium text-primary">{{ primaryCategory }}</span>
        <span v-if="primaryCategory" aria-hidden="true">·</span>
        <time>{{ post.date }}</time>
      </div>

      <p v-if="post.description" class="line-clamp-2 text-[13.5px] leading-[1.7] text-toned">
        {{ post.description }}
      </p>
    </div>
  </NuxtLink>
</template>
