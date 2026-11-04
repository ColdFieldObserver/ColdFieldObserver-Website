<script setup lang="ts">
// 覆盖 @nuxt/ui 的 ProseUl：去掉 list-disc / ps-6 / marker:text-(--ui-border-accented)
// 等工具类。这些类引用的 --ui-* 令牌在正常站点由 Nuxt UI 提供，但阅读模式剥离
// 全部作者样式后既无用、又可能干扰提取；列表的缩进与项目符号改由 prose.css
// 的元素选择器统一处理。属性（如任务列表的 contains-task-list）仍走 Vue 透传。
</script>

<template>
  <ul>
    <slot />
  </ul>
</template>
