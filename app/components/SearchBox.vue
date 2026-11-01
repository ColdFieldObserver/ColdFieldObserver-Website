<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { searchKeyword, syncKeywordFromUrl, writeKeywordToUrl } from '~/composables/useSearch';

/**
 * 全站共享的搜索框。
 * - 搜索弹窗与 /search/ 直达页共用关键词并即时过滤
 * - 输入只用 replaceState 同步地址栏，不触发路由重建
 * - 禁用 JS 时显示降级提示（html:not(.js) 控制显隐）
 */
const props = withDefaults(defineProps<{ autofocus?: boolean }>(), { autofocus: false });

const inputEl = ref<HTMLInputElement | null>(null);
const value = searchKeyword;
const mounted = ref(false);

function onInput(event: Event): void {
  value.value = (event.target as HTMLInputElement).value;
  writeKeywordToUrl();
}

function onSubmit(): void {
  writeKeywordToUrl();
}

function clearKeyword(): void {
  value.value = '';
  writeKeywordToUrl();
  inputEl.value?.focus();
}

onMounted(() => {
  mounted.value = true;
  syncKeywordFromUrl();
  if (props.autofocus) inputEl.value?.focus({ preventScroll: true });
});
</script>

<template>
  <form class="mb-4" role="search" @submit.prevent="onSubmit">
    <!-- 降级提示：普通元素而非 <noscript>，避免 hydration 不一致 -->
    <p class="news-search-noscript hidden text-sm text-dimmed">
      本站搜索需要启用 JavaScript。你可以使用
      <!-- 订阅源由 server/routes 生成，不是页面：用裸 <a>，走 NuxtLink 会让
           vue-router 找不到路由而报 R0004 -->
      <a class="text-primary underline" :href="withBase('/atom.xml')">RSS 订阅</a>
      获取最新文章。
    </p>

    <template v-if="mounted">
      <div
        class="flex items-center gap-2.5 rounded-lg border border-default bg-muted px-3.5 py-2.5 transition-colors focus-within:border-primary"
      >
        <UIcon name="i-lucide-search" class="size-4 shrink-0 text-dimmed" aria-hidden="true" />
        <input
          ref="inputEl"
          class="min-w-0 flex-1 bg-transparent text-sm text-default outline-none placeholder:text-dimmed"
          type="search"
          name="q"
          autocomplete="off"
          placeholder="检索文章标题、正文与标签…"
          :value="value"
          @input="onInput"
        />
        <UButton
          v-if="value"
          variant="ghost"
          color="neutral"
          size="xs"
          square
          icon="i-lucide-x"
          aria-label="清空关键词"
          @click="clearKeyword"
        />
      </div>
    </template>
  </form>
</template>
