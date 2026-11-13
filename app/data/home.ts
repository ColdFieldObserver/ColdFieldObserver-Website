/**
 * 首页数据：Hero 文案、我的项目、游戏 ID、站点说明。
 * 纯数据模块，不引入任何运行时依赖。
 */

/** Hero 头像：走 CDN 加载 */
export const AVATAR: string = 'https://img.remit.ee/i/qYHNr12ajXtL';

/** Hero 简介：整段由一个字符串维护，避免模板里散落多段文本 */
export const HERO_INTRO: string =
  '简单介绍一下我自己吧。我是冷域观者，一个逃跑吧少年和蛋仔派对玩家，偶尔也玩我的世界、PVZ2 和保卫萝卜4，这里是我的个人网站。';

/** 我的项目 */
export interface ProjectItem {
  name: string;
  description: string;
  /** Iconify 类名（动态绑定，需登记进 icon.clientBundle.icons） */
  icon: string;
  /** 主链接（外部站点） */
  to: string;
  /** 补充链接（可选） */
  // extra?: { label: string; to: string };
}

export const PROJECTS: ProjectItem[] = [
  /*
  {
    name: 'PidanUI 官网',
    description:
      '《蛋仔派对》风格 Windows 桌面美化项目的官方网站，Nuxt 4 + Nuxt UI 构建，纯静态部署。',
    icon: 'i-lucide-monitor',
    to: 'https://pidanui.eggycore.top',
  },
  */
  {
    name: '逃少音乐档案馆',
    description:
      '自 SS1 赛季起持续归档《逃跑吧！少年》的赛季 BGM。',
    icon: 'i-simple-icons-bilibili',
    to: 'https://space.bilibili.com/3632301571311734',
  },
];

/** 游戏 ID 卡片（蛋仔派对） */
export interface GameIdItem {
  /** 展示用名称 */
  name: string;
  /** 备注（大号 / 小号） */
  note: string;
  /** 图片地址（CDN） */
  image: string;
}

export const GAME_IDS: GameIdItem[] = [
  { name: '实况主灯塔', note: '蛋仔派对', image: 'https://img.remit.ee/i/Kqi2hJUbtHeH' },
  { name: '翌测', note: '蛋仔派对', image: 'https://img.remit.ee/i/v7QTWcHyx1t0' },
];

/** “关于这个站点”文本 */
export const SITE_NOTE: string[] = [
  '这个站点于2026年5月创建，刚开始是纯静态网页，后来因为难维护所以重构成了Vue3 SPA（但是SEO不好），2026年10月10日把框架换成了VitePress，10月25日又换成了Nuxt 4（现在就是这个样子）。',
  '这个站点主要是靠AI搭的，我自己也就改了一些内容和删掉了一些冗余代码（我还是能自己改一些代码的）。',
];
