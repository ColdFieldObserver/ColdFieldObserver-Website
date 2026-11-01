<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { TOOL_LINKS } from '#shared/site';
import { EGGY_EXAMPLE, useEggyPartyMapText } from '~/composables/useEggyPartyMapText';

// ============================================================
// 工具页：输入 -> 操作 -> 结果
// ------------------------------------------------------------
// 操作区一律放在输入框**下面**（先填内容再选动作，符合阅读顺序）：
//   · 编解码类工具：编码 / 解码是「模式」，切换后结果实时重算；
//   · 蛋仔地图文案：处理 / 短视频文案是一次性动作，结果不随输入实时变化
//     （文案里有随机成分，实时重算会让结果在打字时不断跳动）。
// ============================================================
const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ''));
const tool = computed(() => TOOL_LINKS.find((item) => item.slug === slug.value));

if (!tool.value) {
  throw createError({ statusCode: 404, statusMessage: '工具不存在', fatal: true });
}

/** 每个工具的示例输入：既是输入框的 placeholder，也是「加载示例」填进去的内容 */
const EXAMPLES: Record<string, string> = {
  base64: '你好，蛋仔派对！',
  unicode: '你好，蛋仔派对！',
  timestamp: '1793461870',
  url: 'https://pidanui.eggycore.top/posts/?q=蛋仔派对',
  'eggyparty-map-text': EGGY_EXAMPLE,
};

const example = computed(() => EXAMPLES[slug.value] ?? '');

const input = ref('');
const mode = ref<'encode' | 'decode'>('encode');
const copied = ref(false);

const isEggy = computed(() => slug.value === 'eggyparty-map-text');
const eggy = useEggyPartyMapText();

/** 编解码类工具的实时结果；蛋仔地图文案走「点按钮才算」 */
const liveOutput = computed(() => {
  const text = input.value;
  if (!text.trim()) return '';
  try {
    switch (slug.value) {
      case 'base64':
        return mode.value === 'encode'
          ? btoa(String.fromCharCode(...new TextEncoder().encode(text)))
          : new TextDecoder().decode(Uint8Array.from(atob(text.trim()), (c) => c.charCodeAt(0)));
      case 'unicode':
        return mode.value === 'encode'
          ? [...text].map((ch) => `\\u${ch.codePointAt(0)!.toString(16).padStart(4, '0')}`).join('')
          : text.replace(/\\u\{?([0-9a-fA-F]{1,6})\}?/g, (_, hex: string) =>
              String.fromCodePoint(Number.parseInt(hex, 16)),
            );
      case 'url':
        return mode.value === 'encode' ? encodeURIComponent(text) : decodeURIComponent(text);
      case 'timestamp': {
        const raw = text.trim();
        const num = Number(raw);
        if (Number.isFinite(num) && raw !== '') {
          const ms = raw.length >= 13 ? num : num * 1000;
          const date = new Date(ms);
          if (Number.isNaN(date.getTime())) return '无法解析该时间戳';
          return `本地：${date.toLocaleString('zh-CN', { hour12: false })}\nUTC ：${date.toISOString()}`;
        }
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) return '无法解析该时间';
        return `秒  ：${Math.floor(date.getTime() / 1000)}\n毫秒：${date.getTime()}`;
      }
      default:
        return '';
    }
  } catch {
    return '解析失败：请检查输入内容';
  }
});

const output = computed(() => (isEggy.value ? eggy.result.value : liveOutput.value));

const MODES: Record<string, [string, string] | null> = {
  base64: ['编码', '解码'],
  unicode: ['文本 → 码点', '码点 → 文本'],
  url: ['编码', '解码'],
  timestamp: null,
  'eggyparty-map-text': null,
};

/** 切工具时清空上一条结果，避免两个工具的内容串在一起 */
watch(slug, () => {
  input.value = '';
  mode.value = 'encode';
  eggy.reset();
});

function loadExample(): void {
  input.value = example.value;
  eggy.reset();
}

function clear(): void {
  input.value = '';
  eggy.reset();
}

async function copy(): Promise<void> {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    copied.value = true;
    window.setTimeout(() => (copied.value = false), 1500);
  } catch {
    copied.value = false;
  }
}

useHead({ title: computed(() => tool.value?.name ?? '工具') });
</script>

<template>
  <div class="mx-auto max-w-page">
    <header class="mb-6 border-b border-default pb-5">
      <h1 class="text-[clamp(24px,3.4vw,32px)] font-extrabold tracking-tight text-highlighted">
        {{ tool?.name }}
      </h1>
      <p class="mt-1.5 text-sm text-dimmed">{{ tool?.desc }}</p>
    </header>

    <UCard>
      <label class="mb-2 block text-xs font-medium text-dimmed">
        {{ slug === 'timestamp' ? '时间戳或日期时间（如 2026-10-25 10:00:00）' : '输入' }}
      </label>
      <textarea
        v-model="input"
        rows="6"
        class="w-full resize-y rounded-lg border border-default bg-muted p-3 font-mono text-[13px] text-default outline-none transition-colors focus:border-primary"
        :placeholder="example ? `示例：${example}` : '在此输入…'"
      />

      <!-- 操作区：都在输入框下面 -->
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <template v-if="isEggy">
          <UButton size="sm" label="处理文本" @click="eggy.process(input)" />
          <UButton
            size="sm"
            variant="soft"
            label="处理文本为短视频文案"
            @click="eggy.process(input, true)"
          />
          <UButton size="sm" variant="outline" color="neutral" label="加载示例" @click="loadExample" />
          <UButton size="sm" variant="ghost" color="neutral" label="清空" @click="clear" />
        </template>

        <template v-else>
          <UButton
            v-for="(label, index) in MODES[slug] ?? []"
            :key="label"
            :variant="(index === 0 ? 'encode' : 'decode') === mode ? 'solid' : 'outline'"
            :color="(index === 0 ? 'encode' : 'decode') === mode ? 'primary' : 'neutral'"
            size="sm"
            :label="label"
            @click="mode = index === 0 ? 'encode' : 'decode'"
          />
          <UButton size="sm" variant="ghost" color="neutral" label="加载示例" @click="loadExample" />
        </template>
      </div>

      <div class="mt-5 mb-2 flex items-center justify-between">
        <span class="text-xs font-medium text-dimmed">
          结果
          <span v-if="isEggy && eggy.resultType.value === 'error'" class="ml-1 text-error">（未识别）</span>
        </span>
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          :disabled="!output"
          :label="copied ? '已复制' : '复制结果'"
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          @click="copy"
        />
      </div>
      <pre
        class="min-h-[92px] overflow-x-auto rounded-lg border border-default bg-muted p-3 font-mono text-[13px] whitespace-pre-wrap text-toned"
      >{{ output || (isEggy ? '填写上面的分享文本，再点「处理文本」' : '（结果会实时显示在这里）') }}</pre>
    </UCard>
  </div>
</template>