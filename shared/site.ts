/**
 * 站点常量：站点信息、社交 / 友情链接、工具清单、分页与评论配置。
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
  description: '冷域观者的个人网站，提供在线工具、资源导航与博客日志（支持 RSS 订阅与全站检索）。',
  /** 站点根地址（自定义域名，原 GitHub Pages 域名已 301 过来） */
  mainUrl: 'https://coldfield.skystarlight.top',
} as const;

/** 友情链接已迁到 app/data/rightSidebarContent.ts（与侧栏其他内容同源） */

/** 首页 / 工具页共用的工具清单 */
export const TOOL_LINKS = [
  {
    name: 'Base64 编解码',
    slug: 'base64',
    desc: '在文本与 Base64 之间双向转换，支持 UTF-8 中文。',
  },
  {
    name: 'Unicode 编解码',
    slug: 'unicode',
    desc: '文本与 \\uXXXX 码点序列互转，支持代理对。',
  },
  {
    name: '时间戳转换',
    slug: 'timestamp',
    desc: '秒 / 毫秒时间戳与本地时间、UTC 时间互转。',
  },
  {
    name: 'URL 编解码',
    slug: 'url',
    desc: 'encodeURI / encodeURIComponent 全套编码与解码。',
  },
  {
    name: '蛋仔派对地图文本处理',
    slug: 'eggyparty-map-text',
    desc: '把游戏内地图分享文本整理成标准分享文案。',
  },
] as const;

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
  repo: 'ColdFieldObserver/coldfieldobserver.github.io',
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
