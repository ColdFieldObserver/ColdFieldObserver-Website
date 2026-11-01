<script setup lang="ts">
defineProps<{
  progress: number;
  active: boolean;
  done: boolean;
}>();
</script>

<template>
  <div
    class="page-progress"
    :class="{ active, done }"
    :style="{ width: `${progress}%` }"
    role="progressbar"
    aria-label="页面加载进度"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="Math.round(progress)"
    :aria-hidden="active ? undefined : 'true'"
  ></div>
</template>

<style scoped>
/* 顶部固定进度条：层级高于侧栏与抽屉，宽度由真实加载进度驱动 */
.page-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  width: 0;
  z-index: 1001;
  opacity: 0;
  pointer-events: none;
  border-radius: 0 999px 999px 0;
  /* 颜色只用站点 accent 系：旧实现引用的 --brand / --brand-deep 在本项目
     根本不存在，整条 background 会算成 invalid → 进度条完全透明。 */
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--accent) 55%, transparent),
    var(--accent) 45%,
    var(--accent-deep)
  );
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, #fff 35%, transparent),
    0 0 10px color-mix(in srgb, var(--accent) 45%, transparent);
  transition: width 0.25s ease, opacity 0.4s ease;
}

.page-progress.active {
  opacity: 1;
}

.page-progress.done {
  opacity: 0;
  transition: opacity 0.45s ease;
}

@media (prefers-reduced-motion: reduce) {
  .page-progress {
    transition: none;
  }
}
</style>
