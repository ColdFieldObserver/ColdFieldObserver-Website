<script setup lang="ts">
import { computed } from 'vue';
import type { TermItem } from '#shared/types/post';

// 分类 / 标签索引页（kind 决定文案与路径）
const props = defineProps<{
  kind: 'categories' | 'tags';
  terms: TermItem[];
  total: number;
}>();

const title = computed(() => (props.kind === 'categories' ? '分类' : '标签'));
const unit = computed(() => (props.kind === 'categories' ? '个分类' : '个标签'));
const icon = computed(() => (props.kind === 'categories' ? 'i-lucide-folder' : 'i-lucide-hash'));
</script>

<template>
  <div class="mx-auto max-w-page">
    <header class="mb-6 border-b border-default pb-5">
      <h1 class="text-[clamp(24px,3.4vw,32px)] font-extrabold tracking-tight text-highlighted">{{ title }}</h1>
      <p class="mt-1.5 text-sm text-dimmed">共 {{ terms.length }} {{ unit }} · {{ total }} 篇文章</p>
    </header>

    <p v-if="!terms.length" class="py-11 text-center text-sm text-dimmed">暂无{{ title }}</p>

    <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-3">
      <NuxtLink
        v-for="term in terms"
        :key="term.path"
        class="group flex items-center gap-3 rounded-lg border border-default bg-default px-4 py-3.5 transition-colors hover:border-primary/40 hover:bg-elevated"
        :to="term.path"
      >
        <UIcon :name="icon" class="size-[18px] shrink-0 text-primary" aria-hidden="true" />
        <span class="min-w-0 flex-1 truncate text-sm text-toned group-hover:text-highlighted">
          {{ term.name }}
        </span>
        <UBadge color="neutral" variant="soft" size="sm" :label="String(term.count)" />
      </NuxtLink>
    </div>
  </div>
</template>
