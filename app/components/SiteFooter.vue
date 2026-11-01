<script setup lang="ts">
import { SITE } from '#shared/site';
import { NAV_ITEMS } from '~/data/nav';
import { FRIEND_LINKS, SOCIAL_LINKS } from '~/data/profile';

// ============================================================
// 全站底栏：品牌 + 站点导航（同时承担无 JS 时的导航兜底）
//            + 友情链接 + 订阅 / 社交
// 原 /about 页的「版权与说明」压缩成 #left 里的一行，页面本身已删除。
// ============================================================
// 这里的 year 必须使用固定字符串，而不是用Date相关方法动态获取
const year: string = "2026";
</script>

<template>
  <UFooter class="mt-16 border-t border-default bg-elevated/40">
    <template #top>
      <UContainer class="max-w-page">
        <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <!-- 品牌 + 站点导航 -->
          <div class="min-w-0 lg:col-span-1">
            <NuxtLink class="flex items-center gap-2.5 text-lg font-bold text-default" to="/">
              <img
                class="size-8 rounded-lg object-contain"
                :src="withBase('/images/logo.webp')"
                :alt="SITE.brand"
                width="32"
                height="32"
                decoding="async"
                loading="lazy"
              />
              <span>{{ SITE.brand }}</span>
            </NuxtLink>
            <p class="mt-3 max-w-xs text-sm leading-relaxed text-toned">
              {{ SITE.description }}
            </p>
            <nav class="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="页脚导航">
              <NuxtLink
                v-for="item in NAV_ITEMS"
                :key="item.key"
                class="text-sm text-toned transition-colors hover:text-primary"
                :to="item.to"
                >{{ item.label }}</NuxtLink
              >
            </nav>
          </div>

          <!-- 友情链接 -->
          <div class="min-w-0 md:col-span-1 lg:col-span-2">
            <h2 class="mb-3 text-[13px] font-bold tracking-[0.5px] text-dimmed uppercase">友情链接</h2>
            <div class="grid gap-2 sm:grid-cols-2">
              <a
                v-for="link in FRIEND_LINKS"
                :key="link.url"
                class="flex items-center gap-2.5 rounded-lg border border-default px-2.5 py-2 text-sm text-toned transition-colors hover:border-primary/35 hover:text-primary"
                :href="link.url"
                target="_blank"
                rel="noopener"
              >
                <UIcon :name="link.icon" class="size-4 shrink-0" aria-hidden="true" />
                <span class="truncate">{{ link.name }}</span>
              </a>
            </div>
          </div>

          <!-- 订阅与社交 -->
          <div class="min-w-0">
            <h2 class="mb-3 text-[13px] font-bold tracking-[0.5px] text-dimmed uppercase">订阅与社交</h2>
            <div class="grid gap-2">
              <!-- RSS 订阅 -->
              <a
                :key="withBase('/atom.xml')"
                class="flex items-center gap-2.5 rounded-lg border border-default px-2.5 py-2 text-sm text-toned transition-colors hover:border-primary/35 hover:text-primary"
                :href="withBase('/atom.xml')"
                target="_blank"
                type="application/atom+xml"
              >
                <UIcon name="i-lucide-rss" class="size-4 shrink-0" aria-hidden="true" />
                <span>RSS 订阅</span>
              </a>
              <a
                v-for="link in SOCIAL_LINKS"
                :key="link.url"
                class="flex items-center gap-2.5 rounded-lg border border-default px-2.5 py-2 text-sm text-toned transition-colors hover:border-primary/35 hover:text-primary"
                :href="link.url"
                target="_blank"
                rel="noopener"
              >
                <UIcon :name="link.icon" class="size-4 shrink-0" aria-hidden="true" />
                <span>{{ link.name }}</span>
              </a>
            </div>
          </div>
        </div>
      </UContainer>
    </template>

    <template #left>
      <!-- 开源声明 -->
      <p class="text-sm text-dimmed">
        {{ year }} {{ SITE.brand }} · 网站代码以 MIT 许可证开源
      </p>
    </template>
  </UFooter>
</template>
