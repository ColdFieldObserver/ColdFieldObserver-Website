<script setup lang="ts">
import type { GameIdItem } from '~/data/home';

// 首页「我的游戏 ID」的一张卡。
// 跑马灯形态：宽度固定 515px（原 260px 约放大一倍）+ shrink-0，任何一侧允许收缩都会让图片被压扁。
// 静态网格形态下由父组件的 :deep(.id-card) 覆盖为 100%，撑满列宽 ——
// 容器因此不需要横向滚动，也不会出现横滚动条。
defineProps<{ item: GameIdItem }>();
</script>

<template>
  <UCard class="w-[515px] shrink-0">
    <a
      class="block overflow-hidden rounded-lg border border-default bg-muted"
      :href="item.image"
      target="_blank"
      rel="noopener"
    >
      <img
        :src="item.image"
        :alt="`我的蛋仔派对${item.note}`"
        loading="lazy"
        decoding="async"
        class="w-full"
      />
    </a>
    <div class="mt-3 flex items-center gap-2">
      <UBadge color="primary" variant="soft" size="sm" :label="item.note" />
      <span class="text-sm text-toned">{{ item.name }}</span>
    </div>
  </UCard>
</template>
