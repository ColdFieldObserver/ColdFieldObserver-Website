import { computed, ref } from 'vue';

// ============================================================
// 主题模式（浅色 / 深色 / 跟随系统）
//
// 同时写两套标记：
//   <html data-theme> —— 驱动项目自己的设计令牌（base.css 的 :root 覆盖）
//   .dark / .light    —— 驱动 Nuxt UI 的 --ui-* 语义变量与 dark: 变体
// 只写其中一套的话，深色下另一套仍是浅色皮肤（顶栏、卡片会发白）。
// localStorage 持久化选择；auto 模式走 prefers-color-scheme 跟随系统。
// 首帧防闪烁由 nuxt.config.ts 的 <head> 内联脚本读取同一 storage key。
// ============================================================

export type ThemeMode = 'auto' | 'light' | 'dark';

/** 循环切换顺序 */
export const THEME_MODES: ThemeMode[] = ['auto', 'light', 'dark'];

/** 必须与 nuxt.config.ts 首帧脚本里的 key 完全一致 */
const STORAGE_KEY = 'cfo-theme';

function readStored(): ThemeMode {
  // SSR / Node 环境没有 window，回退 auto
  if (typeof window === 'undefined') return 'auto';
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'auto') return value;
  } catch {
    // localStorage 不可用（隐私模式 / 禁用 Cookie）时回退 auto
  }
  return 'auto';
}

const mode = ref<ThemeMode>(readStored());
const systemDark = ref(false);

/** 当前实际是否为深色（auto 时取系统偏好） */
export const resolvedDark = computed(
  () => mode.value === 'dark' || (mode.value === 'auto' && systemDark.value),
);

type ThemeListener = (dark: boolean) => void;
const listeners = new Set<ThemeListener>();
let bound = false;

function apply(): void {
  if (typeof document === 'undefined') return;
  const dark = resolvedDark.value;
  const root = document.documentElement;
  root.setAttribute('data-theme', mode.value);
  root.classList.toggle('dark', dark);
  root.classList.toggle('light', !dark);
  for (const listener of listeners) listener(dark);
}

function bindSystem(): void {
  if (bound || typeof window === 'undefined') return;
  bound = true;
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  systemDark.value = query.matches;
  query.addEventListener?.('change', (event) => {
    systemDark.value = event.matches;
    apply();
  });
}

/** 初始化：绑定系统监听并落地当前主题（幂等，可在任意组件 setup 调用） */
export function initTheme(): void {
  if (typeof window === 'undefined') return;
  bindSystem();
  apply();
}

export function setThemeMode(next: ThemeMode): void {
  mode.value = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // 持久化失败不影响本次切换
  }
  apply();
}

/** 三态循环：auto → light → dark → auto */
export function cycleThemeMode(): void {
  const index = THEME_MODES.indexOf(mode.value);
  setThemeMode(THEME_MODES[(index + 1) % THEME_MODES.length] ?? 'auto');
}

/** 订阅主题变化（返回取消订阅函数），供 Giscus / Mermaid 等第三方渲染同步 */
export function onThemeChange(listener: ThemeListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme() {
  initTheme();
  return {
    mode,
    resolvedDark,
    setMode: setThemeMode,
    cycle: cycleThemeMode,
  };
}
