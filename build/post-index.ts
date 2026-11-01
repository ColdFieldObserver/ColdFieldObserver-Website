import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { PAGE_SIZE, TOOL_LINKS } from '../shared/site';
import { toArray } from '../shared/utils/term';
import { yearOf } from '../shared/utils/date';

/**
 * 构建期文章索引（供 nuxt.config 的 prerender:routes 使用）。
 *
 * 为什么还要直接读文件：预渲染路由必须在构建早期就能枚举出全集，
 * 而内容库（@nuxt/content）在 `prerender:routes` 阶段还没有同步查询接口。
 * 文章只有个位数，多读一次 frontmatter 的成本可以忽略。
 */

export { PAGE_SIZE };

/** content/posts 的绝对路径（本文件位于 build/ 下） */
export const POSTS_DIR = fileURLToPath(new URL('../content/posts', import.meta.url));

function markdownFiles(): string[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => path.join(POSTS_DIR, file));
}

/** 文章总数（用于计算列表分页页数） */
export function countPosts(): number {
  return markdownFiles().length;
}

/** 统计分类 / 标签下各名称的文章数 */
export function countByField(field: 'categories' | 'tags'): Map<string, number> {
  const counts = new Map<string, number>();
  for (const file of markdownFiles()) {
    const { data } = matter(fs.readFileSync(file, 'utf-8'));
    for (const name of toArray(data[field])) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  return counts;
}

/** 列表分页页数（至少 1 页） */
export function totalPagesOf(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE));
}

/** 有文章的不同年份（倒序），归档按「一年一页」分页 */
let archiveYearsCache: string[] | null = null;

export function archiveYears(): string[] {
  if (archiveYearsCache) return archiveYearsCache;
  const years = new Set<string>();
  for (const file of markdownFiles()) {
    const { data } = matter(fs.readFileSync(file, 'utf-8'));
    const year = yearOf(data.date);
    if (year) years.add(year);
  }
  archiveYearsCache = [...years].sort((a, b) => b.localeCompare(a));
  return archiveYearsCache;
}

/** 归档页数（一年一页，至少 1 页） */
export function countYears(): number {
  return Math.max(1, archiveYears().length);
}

/**
 * 全站可静态化的路由全集。
 * 注意：中文 term 一律传原始 UTF-8（不能预先 encodeURIComponent），
 * 否则 Nitro 会把产物文件名写成 /%E5%85%AC... 的形式。
 */
export function buildRoutes(): string[] {
  const routes = [
    '/',
    '/search/',
    '/posts/',
    '/archives/',
    '/categories/',
    '/tags/',
    '/tools/',
    '/atom.xml',
    '/rss.xml',
    '/api/search.json',
    '/404.html',
  ];

  for (let page = 2; page <= totalPagesOf(countPosts()); page += 1) {
    routes.push(`/posts/page/${page}`);
  }

  // 文章详情页：content 的 path 即 /posts/<slug>
  for (const file of markdownFiles()) {
    routes.push(`/posts/${path.basename(file, '.md')}`);
  }

  for (let page = 2; page <= countYears(); page += 1) {
    routes.push(`/archives/page/${page}`);
  }

  for (const field of ['categories', 'tags'] as const) {
    for (const [name, count] of countByField(field)) {
      const base = `/${field}/${name}`;
      routes.push(base);
      for (let page = 2; page <= totalPagesOf(count); page += 1) {
        routes.push(`${base}/page/${page}`);
      }
    }
  }

  for (const tool of TOOL_LINKS) {
    routes.push(`/tools/${tool.slug}`);
  }

  return routes;
}
