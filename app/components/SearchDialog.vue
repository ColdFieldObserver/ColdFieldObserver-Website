<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import {
  clearSearchKeyword,
  closeSearchDialog,
  restoreSearchDialogFocus,
  searchDialogOpen,
} from '~/composables/useSearch';

// ============================================================
// 全站搜索弹窗（原生 <dialog>）
//   焦点陷阱 / ESC / 点击遮罩 / 滚动锁由 showModal() 提供，
//   这里只补三件业务事：关闭后清空关键词、归还焦点、路由变化兜底关闭。
//   不迁到 UModal：两者都在 top layer，视觉统一收益抵不过叠放顺序的风险。
// ============================================================
const dialog = ref<HTMLDialogElement | null>(null);
const contentVisible = ref(false);
const route = useRoute();

watch(searchDialogOpen, async (open) => {
  const el = dialog.value;
  if (!el) return;
  if (open) {
    contentVisible.value = true;
    await nextTick();
    if (!el.open) el.showModal();
  } else if (el.open) {
    el.close();
  }
});

/** 关闭（close 事件）：卸载内容 + 清空关键词 */
function onDialogClose(): void {
  contentVisible.value = false;
  clearSearchKeyword();
  requestAnimationFrame(restoreSearchDialogFocus);
}

/** 只有点在 <dialog> 自身（即 ::backdrop 区域）才关闭 */
function onDialogClick(event: MouseEvent): void {
  if (event.target === dialog.value) closeSearchDialog();
}

/** 点结果里的文章先收弹窗再跳转：结果区只有链接一种可点元素 */
function onResultClick(event: MouseEvent): void {
  const target = event.target;
  if (target instanceof Element && target.closest('a[href]')) closeSearchDialog();
}

// 兜底：任何方式发生路由跳转时收起弹窗
watch(
  () => route.fullPath,
  () => {
    if (searchDialogOpen.value) closeSearchDialog();
  },
);

onBeforeUnmount(() => {
  searchDialogOpen.value = false;
});
</script>

<template>
  <dialog
    ref="dialog"
    class="search-dialog m-auto w-[min(880px,calc(100vw-32px))] rounded-2xl border border-default bg-default p-0 text-default shadow-2xl backdrop:bg-[var(--overlay)] backdrop:backdrop-blur-[4px]"
    aria-labelledby="search-dialog-title"
    @close="onDialogClose"
    @cancel.prevent="closeSearchDialog"
    @click="onDialogClick"
  >
    <template v-if="contentVisible">
      <header class="flex items-center justify-between border-b border-default px-5 py-3.5">
        <h2 id="search-dialog-title" class="flex items-center gap-2 text-sm font-bold">
          <UIcon name="i-lucide-search" class="size-4 text-primary" aria-hidden="true" />
          全站检索
        </h2>
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          square
          icon="i-lucide-x"
          aria-label="关闭搜索"
          @click="closeSearchDialog"
        />
      </header>

      <div class="px-5 py-4">
        <SearchBox autofocus />
        <!-- overscroll-contain：body 已是正常文档流，滚到底时不要穿透到背后页面 -->
        <div class="max-h-[min(58vh,560px)] overflow-y-auto overscroll-contain" @click="onResultClick">
          <SearchResults />
        </div>
      </div>
    </template>
  </dialog>
</template>

<style scoped>
.search-dialog {
  color: var(--ink);
}

.search-dialog[open] {
  animation: dialog-in 0.22s var(--ease-out-soft);
}

@keyframes dialog-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.99);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .search-dialog[open] {
    animation: none;
  }
}
</style>
