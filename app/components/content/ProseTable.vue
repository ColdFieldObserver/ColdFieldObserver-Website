<script setup lang="ts">
// 覆盖 @nuxt/ui 的 ProseTable：它默认把 <table> 包进一个
// `overflow-x-auto` 的 div（table.root），并给 <table> 套 border-separate。
// 那个滚动容器是 Edge 阅读模式丢表格的元凶 —— 阅读模式会把它当成
// 「非正文」的小部件排除掉。这里改成中性 .table-scroll 包裹（样式在
// prose.css 里，阅读模式不生效），<table> 本身保持干净语义标签。
</script>

<template>
  <div class="table-scroll">
    <table>
      <slot />
    </table>
  </div>
</template>
