import { nextTick } from 'vue';
import { initTheme } from '~/composables/useTheme';

// ============================================================
// 文章页客户端增强
//   1. [TOC] 目录：只有作者显式写了 [TOC] 的文章才生成目录
//   2. 页内锚点滚动：统一走 window，偏移交给 CSS 的 scroll-padding-top
//   3. 代码块的语言标签与复制按钮由 components/content/ProsePre.vue 自己负责
// 以上均依赖渲染后的真实 DOM，只能跑在浏览器端，且都是渐进增强。
// ============================================================

// ---- [TOC] 目录 ----

/**
 * `[TOC]` 在 Markdown 里只是一段普通文本（MDC 会把方括号当链接语法吞掉，
 * 最终渲染成 <p><span>TOC</span></p> 或 <p>[TOC]</p>）。
 * 这里在客户端把它换成占位容器，再统一填充。
 *
 * 刻意「不自动生成」：短文章被塞一块没有信息量的目录反而碍事，
 * 因此页面里不再放固定目录容器，位置的唯一来源就是作者写的 [TOC]。
 */
function mountTocPlaceholder(): void {
  if (typeof document === 'undefined') return;
  const content = document.querySelector('.post-content');
  if (!content) return;

  // 同时接受 [TOC] / [[TOC]] / 被 MDC 吞掉方括号后只剩 TOC 的形态
  const TOC_PATTERN = /^\[{0,2}toc\]{0,2}$/i;

  for (const paragraph of Array.from(content.querySelectorAll<HTMLParagraphElement>('p'))) {
    const text = (paragraph.textContent ?? '').replace(/\u200b/g, '').trim();
    if (!TOC_PATTERN.test(text)) continue;
    const box = document.createElement('div');
    box.className = 'post-toc';
    box.dataset.postToc = '';
    paragraph.replaceWith(box);
  }
}

function fillToc(): void {
  if (typeof document === 'undefined') return;

  mountTocPlaceholder();

  const placeholders = document.querySelectorAll<HTMLElement>('[data-post-toc]');
  if (!placeholders.length) return;

  const content = document.querySelector('.post-content');
  if (!content) return;

  const headings = Array.from(content.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
  const wrap = document.createElement('div');
  const title = document.createElement('p');
  title.className = 'post-toc-title';
  title.textContent = '目录';
  wrap.appendChild(title);

  const list = document.createElement('ul');
  list.className = 'post-toc-list';
  for (const heading of headings) {
    const text = (heading.textContent ?? '').replace(/\u200b/g, '').trim();
    if (!text) continue;
    const item = document.createElement('li');
    item.className = `post-toc-item level-${heading.tagName.slice(1)}`;
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = text;
    item.appendChild(link);
    list.appendChild(item);
  }
  wrap.appendChild(list);

  for (const placeholder of placeholders) {
    placeholder.replaceChildren(wrap.cloneNode(true));
  }
}

// ---- 页内锚点滚动 ----
// 滚动权在 window，偏移由 base.css 的 html{scroll-padding-top} 统一提供，
// 这里不再自己算 header 高度（JS 与 CSS 各写一份必然漂移）。

/** 自建 hash 跳转后的一小段时间内忽略 hashchange，避免重复滚动 */
let suppressHashChangeUntil = 0;
let anchorBound = false;

function alignToAnchor(hash: string, smooth: boolean): boolean {
  if (typeof document === 'undefined' || !hash || hash === '#') return false;
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // 非法百分号编码时按原样查找
  }
  const target = document.getElementById(id);
  if (!target) return false;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: smooth && !reduce ? 'smooth' : 'auto', block: 'start' });
  return true;
}

function scrollToAnchor(hash: string, smooth = true): void {
  alignToAnchor(hash, smooth);
}

function bindAnchorScroll(): void {
  if (anchorBound || typeof window === 'undefined') return;
  anchorBound = true;

  document.addEventListener('click', (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    const link = target?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href') ?? '';
    if (!hash || hash === '#') return;

    // 先阻止浏览器的默认 hash 跳转：默认跳转不带 scroll-padding 之外的
    // 任何偏移控制，紧接着手动滚一次会叠加成「跳过头」
    event.preventDefault();

    // replaceState 写 hash：不触发 hashchange，避免第二次重复滚动。
    // 必须保留 vue-router 的 state，裸调用会把它覆盖掉。
    suppressHashChangeUntil = performance.now() + 150;
    try {
      history.replaceState(history.state, '', hash);
    } catch {
      // history API 不可用时仍继续手动滚动
    }
    scrollToAnchor(hash);
  });

  window.addEventListener('hashchange', () => {
    if (performance.now() < suppressHashChangeUntil) return;
    scrollToAnchor(window.location.hash);
  });

  // 跨页带 hash 跳转：新页 DOM 就绪后由 layout 在 page:finish 里派发
  document.addEventListener('cfo:anchor', (event) => {
    const hash = (event as CustomEvent<string>).detail;
    if (hash) scrollToAnchor(hash, false);
  });
}

// ---- 文章入口 ----

/**
 * 文章页挂载 / 路由切换后调用。
 *
 * 只做三件事：填目录、绑定锚点滚动、按 hash 精确对齐。
 *
 * @param routeKey 当前文章标识（如 /posts/<slug>）
 */
export async function enhancePost(routeKey: string): Promise<void> {
  if (typeof document === 'undefined') return;
  void routeKey;
  initTheme();
  bindAnchorScroll();
  await nextTick();
  fillToc();
  scrollToAnchor(window.location.hash, false);
}
