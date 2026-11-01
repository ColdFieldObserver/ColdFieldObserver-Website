<script setup lang="ts">
import type { NuxtError } from '#app';

// 自定义错误页：保留站点外壳，正文统一展示 404 视图，避免暴露堆栈
const props = defineProps<{ error: NuxtError }>();

// 错误页的 useHead 不经过 app.vue 的 titleTemplate，这里直接写完整标题
const ERROR_TITLE = '404 · 信号丢失 · 冷域观者的个人网站';
useHead({ title: ERROR_TITLE });

if (import.meta.dev && props.error?.statusCode !== 404) {
  console.error(props.error);
}
</script>

<template>
  <NuxtLayout>
    <div class="mx-auto max-w-2xl py-16 text-center">
      <p class="text-sm font-semibold tracking-[1px] text-primary">404</p>
      <h1 class="mt-3 text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight text-highlighted">
        信号丢失
      </h1>
      <p class="mt-3 text-toned">你要找的页面不存在，或者已经被移除了。</p>
      <div class="mt-7 flex justify-center gap-2.5">
        <UButton to="/" icon="i-lucide-house" label="回到首页" />
        <UButton to="/posts/" variant="outline" color="neutral" label="看看日志" />
      </div>
    </div>
  </NuxtLayout>
</template>
