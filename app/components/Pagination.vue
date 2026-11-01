<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  /** 当前页（从 1 开始） */
  current: number;
  /** 总页数 */
  totalPages: number;
  /** 第 1 页地址，如 /posts/、/archives/ */
  firstHref: string;
  /** 第 n(>=2) 页地址前缀 */
  pagePrefix: string;
}>();

const prevHref = computed(() =>
  props.current <= 2 ? props.firstHref : `${props.pagePrefix}${props.current - 1}`,
);
const nextHref = computed(() => `${props.pagePrefix}${props.current + 1}`);
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="mt-8 flex items-center justify-center gap-3"
    role="navigation"
    aria-label="分页导航"
  >
    <UButton
      v-if="current > 1"
      :to="prevHref"
      variant="outline"
      color="neutral"
      icon="i-lucide-chevron-left"
      label="上一页"
    />
    <UButton v-else variant="outline" color="neutral" icon="i-lucide-chevron-left" label="上一页" disabled />

    <span class="px-1 text-sm text-dimmed">{{ current }} / {{ totalPages }}</span>

    <UButton
      v-if="current < totalPages"
      :to="nextHref"
      variant="outline"
      color="neutral"
      trailing-icon="i-lucide-chevron-right"
      label="下一页"
    />
    <UButton v-else variant="outline" color="neutral" trailing-icon="i-lucide-chevron-right" label="下一页" disabled />
  </nav>
</template>
