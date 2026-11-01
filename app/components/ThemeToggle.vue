<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useTheme, type ThemeMode } from '~/composables/useTheme';

// 主题开关：Nuxt UI 的 USwitch，三态循环（跟随系统 -> 浅色 -> 深色）。
//
// 用 USwitch 而不是 UColorModeSwitch：本站主题是自建的 useTheme
// （写 data-theme + .dark/.light），nuxt.config 里 ui.colorMode 是关掉的，
// UColorModeSwitch 依赖 @nuxtjs/color-mode 的 useColorMode()，这里没有。
//
// 三态在二值开关上的表达：
//   滑块位置 = 当前实际是否深色（resolvedDark，跟随系统时随系统走）
//   滑块图标 = 当前模式（跟随系统 = 太阳+月亮，浅色 = 太阳，深色 = 月亮）
//   点击一律按 auto -> light -> dark -> auto 循环，不读开关回传的布尔值
const { mode, resolvedDark, cycle } = useTheme();

// 服务端没有 localStorage 也没有 prefers-color-scheme，只能渲染 auto + 浅色；
// 挂载后再切到真实状态，避免 aria-label / 图标与 SSR 不一致触发 hydration 警告
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

const LABELS: Record<ThemeMode, string> = {
  auto: '跟随系统',
  light: '浅色模式',
  dark: '深色模式',
};

const shownMode = computed<ThemeMode>(() => (mounted.value ? mode.value : 'auto'));
const label = computed(() => LABELS[shownMode.value]);
const isDark = computed(() => mounted.value && resolvedDark.value);

// 跟随系统时两侧都用「太阳+月亮」，让滑块自身也能读出这是自动模式
const AUTO_ICON = 'i-lucide-sun-moon';
const checkedIcon = computed(() => (shownMode.value === 'auto' ? AUTO_ICON : 'i-lucide-moon'));
const uncheckedIcon = computed(() => (shownMode.value === 'auto' ? AUTO_ICON : 'i-lucide-sun'));
</script>

<template>
  <USwitch
    size="lg"
    color="primary"
    :model-value="isDark"
    :checked-icon="checkedIcon"
    :unchecked-icon="uncheckedIcon"
    :title="`当前：${label}（点击切换）`"
    :aria-label="`切换主题，当前${label}`"
    @update:model-value="cycle"
  />
</template>