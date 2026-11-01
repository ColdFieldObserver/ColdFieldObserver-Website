<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { SITE } from '#shared/site';
import { NAV_ITEMS, activeNavKey } from '~/data/nav';

// ============================================================
// 全站顶栏：品牌 + 桌面横排导航 + 搜索 / 主题 / 汉堡
// ------------------------------------------------------------
// 移动端（< lg 即 < 1024px）导航收进顶栏正下方的下拉面板 ——
// 刻意不用 UDrawer / USlideover：面板不锁滚动、不拦焦点，
// 收起时用 inert 让它退出 Tab 序列，行为比抽屉更轻。
// ============================================================
const route = useRoute();
const activeKey = computed(() => activeNavKey(route.path));
const mobileOpen = ref(false);

const menuItems = computed(() =>
  NAV_ITEMS.map((item) => ({
    label: item.label,
    icon: item.icon,
    to: item.to,
    active: activeKey.value === item.key,
  })),
);

// 路由切换后自动收起，避免面板停在新页面上空
watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false;
  },
);

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && mobileOpen.value) mobileOpen.value = false;
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
  <UHeader
    :toggle="false"
    :title="SITE.brand"
    to="/"
    :ui="{
      root: 'sticky top-0 z-50 border-b border-default bg-default/85 backdrop-blur',
      container: 'max-w-page mx-auto',
    }"
  >
    <!-- #title 插槽本身是 flex items-end（图标贴底对齐），所以里面包一层
         items-center 的容器让图标与文字垂直居中。
         注释写在插槽外面：写进插槽会变成链接内容的一部分，
         会让无障碍名称里混进这段中文。 -->
    <template #title>
      <span class="flex items-center gap-2">
        <img
          class="size-8 shrink-0 rounded-lg object-contain"
          :src="withBase('/images/logo.webp')"
          :alt="SITE.brand"
          width="32"
          height="32"
          decoding="async"
          fetchpriority="high"
        />
        <span class="text-[17px] font-bold tracking-[1px]">{{ SITE.brand }}</span>
      </span>
    </template>

    <UNavigationMenu :items="menuItems" highlight />

    <template #right>
      <SearchLauncher compact />
      <ThemeToggle />
      <UButton
        class="lg:hidden"
        variant="ghost"
        color="neutral"
        square
        :icon="mobileOpen ? 'i-lucide-x' : 'i-lucide-menu'"
        :aria-label="mobileOpen ? '关闭主导航' : '打开主导航'"
        :aria-expanded="mobileOpen"
        aria-controls="site-mobile-nav"
        @click="mobileOpen = !mobileOpen"
      />
    </template>

    <!-- 顶栏正下方的下拉面板：绝对定位，不撑高 sticky header，滚动不跳动。
         收起态用 grid-rows-[0fr] + inert：内容不占位，也不进键盘 Tab 序列。 -->
    <template #bottom>
      <div
        id="site-mobile-nav"
        class="absolute inset-x-0 top-full grid overflow-hidden border-b border-default bg-default shadow-lg transition-[grid-template-rows] duration-300 lg:hidden"
        :class="mobileOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        :inert="!mobileOpen"
      >
        <div class="min-h-0 overflow-hidden">
          <UNavigationMenu orientation="vertical" :items="menuItems" class="p-2" />
        </div>
      </div>
    </template>
  </UHeader>
</template>
