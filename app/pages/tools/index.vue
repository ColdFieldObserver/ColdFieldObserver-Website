<script setup lang="ts">
import { TOOL_LINKS } from '#shared/site';

useHead({ title: '工具箱' });
</script>

<template>
  <div class="mx-auto max-w-page">
    <header class="mb-6 border-b border-default pb-5">
      <h1 class="text-[clamp(24px,3.4vw,32px)] font-extrabold tracking-tight text-highlighted">工具箱</h1>
      <p class="mt-1.5 text-sm text-dimmed">纯前端运行，数据不上传服务器</p>
    </header>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-4">
      <NuxtLink
        v-for="tool in TOOL_LINKS"
        :key="tool.slug"
        class="group flex flex-col rounded-xl border border-default bg-default p-5 transition-colors hover:border-primary/40 hover:bg-elevated"
        :to="`/tools/${tool.slug}`"
      >
        <h2 class="flex items-center gap-2 text-base font-semibold text-highlighted">
          <UIcon name="i-lucide-wrench" class="size-[18px] text-primary" aria-hidden="true" />
          {{ tool.name }}
        </h2>
        <p class="mt-2 flex-1 text-[13.5px] leading-[1.7] text-toned">{{ tool.desc }}</p>
        <span class="mt-3 inline-flex items-center gap-1 text-sm text-primary">
          打开
          <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
        </span>
      </NuxtLink>
    </div>
  </div>
</template>
