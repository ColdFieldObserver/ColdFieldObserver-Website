/**
 * 站点常量：站点信息、分页与评论配置。
 * 前后端共用（server routes 也会读取），不要在这里 import Node API。
 */
export const SITE = {
  /** 站点名（品牌） */
  brand: '冷域观者',
  /** 作者 */
  author: 'ColdFieldObserver',
  /** 站点主标题 */
  title: '冷域观者的个人网站',
  /** 站点描述 */
  description: '冷域观者的个人网站，提供博客日志与资源导航（支持 RSS 订阅与全站检索）。',
  /** 站点根地址（自定义域名） */
  mainUrl: 'https://coldfield.skystarlight.top',
} as const;

/** 友情链接已迁到 app/data/rightSidebarContent.ts（与侧栏其他内容同源） */

/** 文章列表每页显示数量 */
export const PAGE_SIZE = 9;

/** Atom / RSS 收录条数 */
export const FEED_LIMIT = 20;

/**
 * Giscus 评论配置。
 * repo / repoId / category / categoryId 必须成对匹配，
 * 否则 giscus.app 会报 "giscus is not installed on this repository"。
 */
export const GISCUS = {
  repo: 'PidanEggyTeam/ColdFieldObserver-Website',
  repoId: 'R_kgDOSspP7Q',
  category: 'Announcements',
  categoryId: 'DIC_kwDOSspP7c4DHfe3',
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  lang: 'zh-CN',
  loading: 'lazy',
} as const;
