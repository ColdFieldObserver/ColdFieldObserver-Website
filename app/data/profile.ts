/**
 * 个人档案数据：首页「关于我」「身份主线经历」、底栏「友情链接」共用。
 * 纯数据模块，不引入任何运行时依赖。
 */

/** 个人档案（首页「关于我」列表） */
export const PERSONAL_PROFILE: string[] = [
  '兴趣爱好：打游戏、听音乐、看视频、户外散步、偶尔写点东西',
  '喜欢玩的游戏：逃跑吧少年、蛋仔派对、我的世界、植物大战僵尸2、保卫萝卜4、光遇',
  '主阵地：逃少音乐档案馆（B站 & WP 独立站）',
];

/** 身份主线经历的单个节点 */
export interface TimelineEntry {
  /** 时间段或年份（冗余属性，暂时用不到） */
  // period: string;
  /** 身份名 */
  title: string;
  /** 一句说明 */
  description: string;
}

/** 身份主线经历 */
export const TIMELINE: TimelineEntry[] = [
  {
    // period: '2022.02 — 2026.01',
    title: 'AsyncObserver',
    description: '最早的 B 站主号，逃少音乐档案馆的起点，2026 年 1 月注销。',
  },
  {
    // period: '2025.11 — 2026.05',
    title: '栖小光',
    description: '其实这个名字是用AI起的，现在还在作为马甲使用。',
  },
  {
    // period: '2026.05 — 现在',
    title: '冷域观者',
    description: 'ColdFieldObserver，本站与 GitHub 使用的身份。',
  },
];

/** 友情链接条目 */
export interface FriendLink {
  name: string;
  url: string;
  /** 链接图标 Iconify 类名 */
  icon: string;
}

/** 友情链接（顺序即底栏展示顺序） */
export const FRIEND_LINKS: FriendLink[] = [
  {
    name: '逃少音乐档案馆（B站）',
    url: 'https://space.bilibili.com/3632301571311734',
    icon: 'i-simple-icons-bilibili',
  },
  {
    name: '逃少音乐档案馆（WP）',
    url: 'https://dmmdzzmusicarchive.wordpress.com/',
    icon: 'i-lucide-globe',
  },
  {
    name: '冷域观者的B站个人空间',
    url: 'https://space.bilibili.com/3706982592678629',
    icon: 'i-simple-icons-bilibili',
  },
  {
    name: '冷域观者的博客（上线了）',
    url: 'https://coldfieldobserver.mysxl.cn/',
    icon: 'i-lucide-globe',
  },
  {
    name: '冷域观者的博客（WordPress）',
    url: 'https://alonewalkman.wordpress.com/',
    icon: 'i-lucide-globe',
  },
  {
    name: '冷域观者的GitHub',
    url: 'https://github.com/ColdFieldObserver',
    icon: 'i-simple-icons-github',
  },
  {
    name: 'Alone Voyager的GitHub Pages',
    url: 'https://alonevoyager.github.io/',
    icon: 'i-lucide-globe',
  },
  {
    name: '蛋小蓝的博客（建设中）',
    url: 'https://danxiaolan.wordpress.com/',
    icon: 'i-lucide-globe',
  },
];

/** 社交账号（首页 Hero 的按钮 + 底栏） */
export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'B站',
    url: 'https://space.bilibili.com/3632301571311734',
    icon: 'i-simple-icons-bilibili',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/ColdFieldObserver',
    icon: 'i-simple-icons-github',
  },
];
