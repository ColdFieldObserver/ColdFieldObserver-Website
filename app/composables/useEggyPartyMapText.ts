import { ref } from 'vue';

// ============================================================
// 蛋仔派对地图文本处理
// ------------------------------------------------------------
// 与 StarLight-7693.github.io.react 的 useEggyPartyMapTextProcessor 保持同一套
// 解析与文案生成规则：
//   地图名 → 文本里的《…》
//   地图码 → 「地图码1234-5678」，退一步再认「1234-5678」
//   输出   → 普通格式（多行信息）或短视频格式（随机开头 + 引导语 + 随机标签）
//
// 这里刻意做成「点击处理」而不是随输入实时计算：随机文案每次处理都不同，
// 实时计算会让结果在打字过程中不断跳动。
// ============================================================

/** 示例输入：与 StarLight 的 loadExample 一致 */
export const EGGY_EXAMPLE = '复制打开【蛋仔派对】，游玩地图《此图菜鸟都能过！》，地图码6040-1745。';

const EXTRA_INFORMATION = [
  '长按复制这段内容，打开蛋仔派对，玩视频内同款地图~',
  '想体验这张超好玩的地图吗？长按复制这段内容，打开蛋仔派对就可以了~',
  '小蛋仔，想要体验这张地图吗？只需要长按复制这段内容，然后打开蛋仔派对就能玩喽~',
  '想要挑战自己的极限吗？长按复制这段内容，打开蛋仔派对，开启你的冒险之旅吧~',
  '想要和你的蛋搭子一起玩这张地图？没问题！长按复制这段内容，打开蛋仔派对，然后约上你的蛋搭子和你一起玩就可以了~',
  '想要检验自己的技术实力吗？长按复制这段内容，打开蛋仔派对，来挑战这张地图吧~',
  '这张地图太难了，希望你能来挑战一下！长按复制这段内容，打开蛋仔派对，来试试你的技术吧~',
  '这张地图太好玩了，你也来试试吧！长按复制这段内容，打开蛋仔派对，来体验一下吧~',
  '如果你觉得不开心的话，不妨来玩一下这张地图吧！长按复制这段内容，打开蛋仔派对，撞走不开心~',
  '还在为找不到好玩的地图而发愁吗？那么你一定要来玩玩这张地图！长按复制这段内容，打开蛋仔派对，一起来玩吧~',
];

const VIDEO_PREFIX = [
  '快来快来！我发现了一张超好玩的地图',
  '挖到宝藏蛋仔地图啦',
  '被这张蛋仔地图狠狠拿捏住了',
  '蛋仔必玩宝藏地图分享',
  '谁还没玩过这张神仙蛋仔地图',
  '安利一款超有意思的蛋仔闯关图',
  '蛋仔地图推荐｜亲测好玩不踩雷',
  '闲得无聊？试试这张蛋仔地图',
  '蛋搭子速来集合！优质地图奉上',
  '近期玩过体验感拉满的蛋仔地图',
];

const TAGS = [
  '蛋仔派对_',
  '蛋仔日常',
  '蛋仔派对地图打卡',
  '蛋仔宝藏地图',
  '蛋仔地图推荐',
  '蛋仔奇思妙想计划',
  '蛋仔旅行家',
  '蛋仔带你看世界',
  '蛋仔派对创计划',
  '可爱蛋仔',
];

function pick(list: readonly string[]): string {
  return list[Math.floor(Math.random() * list.length)] ?? '';
}

function extractMapName(text: string): string {
  const match = text.match(/《([^》]+)》/);
  if (match?.[1]) return match[1].trim();
  throw new Error('未找到地图名（未匹配到《地图名》）');
}

function extractMapCode(text: string): string {
  const direct = text.match(/地图码(\d+-?\d+)/);
  if (direct?.[1]) return direct[1].trim();
  const loose = text.match(/(\d{4,}-\d+)/);
  if (loose?.[1]) return loose[1];
  throw new Error('未找到地图码');
}

/** 随机抽 3 个不重复标签并加 # */
function randomTags(): string {
  const shuffled = [...TAGS].sort(() => Math.random() - 0.5);
  return shuffled
    .slice(0, 3)
    .map((tag) => `#${tag}`)
    .join(' ');
}

function generateOutput(mapName: string, mapCode: string, shortVideoMode: boolean): string {
  if (shortVideoMode) {
    return `${pick(VIDEO_PREFIX)}《${mapName}》，地图码是${mapCode}。${pick(EXTRA_INFORMATION)} #蛋仔派对 ${randomTags()}`;
  }
  return `【蛋仔派对】地图《${mapName}》试玩

相关游戏：蛋仔派对
地图名：${mapName}
地图码：${mapCode}
${pick(EXTRA_INFORMATION)}
(EggyPartyCopyMapTextProcessor for CFO's Website Generate)`;
}

export function useEggyPartyMapText() {
  const result = ref('');
  const resultType = ref<'success' | 'error' | ''>('');

  function process(input: string, shortVideoMode = false): void {
    const text = input.trim();
    if (!text) {
      result.value = '请输入要处理的文本';
      resultType.value = 'error';
      return;
    }
    try {
      const mapName = extractMapName(text);
      const mapCode = extractMapCode(text);
      result.value = generateOutput(mapName, mapCode, shortVideoMode);
      resultType.value = 'success';
    } catch (error) {
      result.value = error instanceof Error ? error.message : '处理失败';
      resultType.value = 'error';
    }
  }

  function reset(): void {
    result.value = '';
    resultType.value = '';
  }

  return { result, resultType, process, reset };
}
