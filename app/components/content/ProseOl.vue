<script setup lang="ts">
// 覆盖 @nuxt/ui 的 ProseOl：同 ProseUl，去掉 list-decimal / ps-6 / marker:* 工具类，
// 列表样式交给 prose.css 的元素选择器，保证阅读模式下也是干净的 <ol>。
</script>

<template>
  <ol>
    <slot />
  </ol>
</template>
