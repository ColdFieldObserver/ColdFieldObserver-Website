<script setup lang="ts">
import { computed, ref } from 'vue';

// ============================================================
// 自定义 ProsePre
//   @nuxt/content 默认只输出裸 <pre>，这里给「带语言」的代码块加一条
//   顶部信息栏：语言标签 + 复制按钮。无语言（```）的块保持原样。
//
//   复制逻辑放在组件内，而不是继承 usePostEnhance 里那套
//   `button.copy` + `div[class*="language-"]` 的旧选择器 ——
//   那套是 VitePress 的 DOM 结构，在 MDC 下匹配不到。
// ============================================================
const props = defineProps<{
  code?: string;
  language?: string | null;
  filename?: string | null;
  highlights?: readonly number[];
  meta?: string | null;
  class?: string | null;
}>();

const copied = ref(false);
let timer: number | undefined;

/** 语言标签展示名：mermaid / plain 之类做成可读的大写缩写 */
const langLabel = computed(() => {
  const lang = (props.language ?? '').trim();
  if (!lang) return '';
  const alias: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    md: 'markdown',
    sh: 'shell',
    yml: 'yaml',
  };
  return (alias[lang] ?? lang).toUpperCase();
});

async function copy(): Promise<void> {
  const text = props.code ?? '';
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // 非 HTTPS / 无权限时退化成 textarea + execCommand
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
    } catch {
      // 复制失败就不提示成功
    }
    area.remove();
  }
  copied.value = true;
  if (timer !== undefined) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    copied.value = false;
    timer = undefined;
  }, 1500);
}
</script>

<template>
  <!-- 带语言的代码块：上部信息栏（语言 + 复制） -->
  <div v-if="langLabel" class="code-block">
    <div class="code-head">
      <span class="code-lang">{{ langLabel }}</span>
      <button
        class="code-copy"
        type="button"
        :aria-label="copied ? '已复制' : '复制代码'"
        @click="copy"
      >
        <Icon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" class="size-3.5" aria-hidden="true" />
        <span>{{ copied ? '已复制' : '复制' }}</span>
      </button>
    </div>
    <pre :class="$props.class"><slot /></pre>
  </div>

  <!-- 无语言：保持原样，不额外包一层 -->
  <pre v-else :class="$props.class"><slot /></pre>
</template>

<style scoped>
.code-block {
  margin: 1.2em 0;
  /* 不能用 overflow: hidden —— 它会让 .code-block 成为滚动容器，
     内部的 sticky 头栏就被困在盒子自己的滚动坐标系里，永远贴不住视口 */
  background: var(--code-bg);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

.code-head {
  /* 长代码块滚动时头栏钉在视口顶栏下方（不能是 top:0，会被 sticky 顶栏整个盖住），
     语言与复制按钮始终可点；横向滚动的是内部 <pre>，头栏不受影响 */
  position: sticky;
  top: var(--shell-header-h);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 12px;
  background: var(--code-hd);
  border-bottom: 1px solid var(--line);
  border-radius: calc(var(--radius-md) - 1px) calc(var(--radius-md) - 1px) 0 0;
}

.code-lang {
  font-family: var(--font-code);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.4px;
  color: var(--accent-deep);
}

.code-copy {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-family: var(--font-code);
  font-size: 11px;
  letter-spacing: 0.5px;
  color: var(--ink-3);
  border: 1px solid transparent;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.code-copy:hover {
  color: var(--accent-deep);
  background: var(--accent-soft);
  border-color: var(--line);
}

.code-copy:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent) 55%, transparent);
  outline-offset: 2px;
}

/* 代码块本体：外层的内边距与边框由 .code-block 承担 */
.code-block pre {
  margin: 0;
  padding: 14px 16px;
  border: 0;
  background: transparent;
  border-radius: 0 0 calc(var(--radius-md) - 1px) calc(var(--radius-md) - 1px);
}
</style>
