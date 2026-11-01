/**
 * 全站导航的单一数据源：顶栏、移动端下拉面板、底栏共用这一份。
 * 纯数据 + 纯函数，不引入运行时依赖。
 *
 * 分区规则：顶栏只放「一级入口」（首页 / 博客 / 工具）；
 * 归档、分类、标签属于「读文章」的子导航，放在博客页里（见 `BLOG_SUB_NAV`）。
 */

export interface NavItem {
  /** 稳定标识，用于高亮匹配 */
  key: string;
  label: string;
  /** 站内路由（一律走 NuxtLink） */
  to: string;
  /** Iconify 类名（动态绑定，必须登记进 nuxt.config 的 icon.clientBundle.icons） */
  icon: string;
}

/** 顶栏一级导航 */
export const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: '首页', to: '/', icon: 'i-lucide-house' },
  { key: 'blog', label: '博客', to: '/posts/', icon: 'i-lucide-newspaper' },
  { key: 'tools', label: '工具', to: '/tools/', icon: 'i-lucide-wrench' },
];

/** 博客子导航：只出现在博客页与底栏，不占顶栏 */
export const BLOG_SUB_NAV: NavItem[] = [
  { key: 'archives', label: '归档', to: '/archives/', icon: 'i-lucide-archive' },
  { key: 'categories', label: '分类', to: '/categories/', icon: 'i-lucide-folder' },
  { key: 'tags', label: '标签', to: '/tags/', icon: 'i-lucide-tags' },
];

/** 博客分区下所有路径前缀（高亮与「是否在博客分区」共用） */
const BLOG_PREFIXES = ['/posts', '/archives', '/categories', '/tags', '/search'];

/** 当前路径是否属于博客分区 */
export function isBlogSection(path: string): boolean {
  return BLOG_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/** 当前路径命中的导航项 key（未命中返回空串） */
export function activeNavKey(path: string): string {
  // 归档 / 分类 / 标签 / 搜索都算「博客」分区，顶栏高亮不跟着路径乱跳
  if (isBlogSection(path)) return 'blog';

  for (const item of NAV_ITEMS) {
    // 首页只认精确匹配，否则 '/' 前缀会把所有路由都算成首页
    if (item.to === '/') {
      if (path === '/') return item.key;
      continue;
    }
    if (path === item.to || path.startsWith(item.to)) return item.key;
  }
  return '';
}
