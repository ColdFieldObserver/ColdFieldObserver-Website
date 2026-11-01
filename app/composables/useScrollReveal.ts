import { onBeforeUnmount, onMounted } from 'vue';

// ============================================================
// 滚动入场（reveal on scroll）
// ------------------------------------------------------------
// 每个页面里「页面容器 → 视图根节点 → 区块」这一层的块，进入视口时淡入上浮，
// 同屏的块逐个错开 80ms。只过渡 opacity / transform，时长与曲线走站点令牌，
// 且全部挂在 motion-safe 之下（系统要求「减少动态效果」时不打任何标记）。
//
// 契约：
//   data-reveal="hidden" → 透明并下移（见 animation.css）
//   data-reveal="shown"  → 播放 reveal-up
// 无 JS 时不打标，元素保持默认可见 —— 降级路径不需要额外样式。
// ============================================================

/** 层级与页面过渡一致：#content 里的 UContainer.page-shell → 视图根 → 区块 */
const SELECTOR = '#content .page-shell > * > *';
/** 同屏区块的错开步长 */
const STAGGER = 80;
/** 首屏最多等这么久，再往下就靠 IntersectionObserver 逐块出现 */
const MAX_DELAY = 400;

let observer: IntersectionObserver | null = null;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** 已经滚过去的块（整体在视口上方）永远不可能再进入视口 */
function aboveViewport(el: HTMLElement): boolean {
  return el.getBoundingClientRect().bottom <= 0;
}

/** 视口内（含首屏下沿 10% 的容差）即视为「已在视野里」 */
function inViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
}

function reveal(el: HTMLElement, delay: number): void {
  el.style.setProperty('--reveal-delay', `${Math.round(delay)}ms`);
  el.dataset.reveal = 'shown';
}

/**
 * 给当前页面的区块打标并开始观察：
 * 首屏内的块立即显示（交错延迟），视口外的块先隐藏，进入视口后再显示。
 *
 * 两条「必须显示」的例外，都是路由切换时的坑：
 * - 已经在视口上方的块（从页面中部跳转、新页比旧页短）：观察器永远不会
 *   再触发它，压成 hidden 就等于把内容藏了，所以直接显示；
 * - 同一页面重复刷新时不清掉已有的 shown 标记。
 */
export function refreshScrollReveal(): void {
  if (typeof window === 'undefined' || !observer) return;

  let index = 0;
  for (const el of document.querySelectorAll<HTMLElement>(SELECTOR)) {
    // 已经显示过的块不再回退成隐藏态（路由切回同一页时会重跑）
    if (el.dataset.reveal === 'shown') continue;
    // 没有布局盒的元素（display:none 的兜底链接等）不打标：
    // 观察不到它，打了标反而会让它以后露出来时是透明的
    if (el.getClientRects().length === 0) continue;

    if (aboveViewport(el) || inViewport(el)) {
      reveal(el, Math.min(index * STAGGER, MAX_DELAY));
      index += 1;
      continue;
    }

    el.dataset.reveal = 'hidden';
    observer.observe(el);
  }
}

/**
 * 异步补刷：路由切换时「新页 DOM 就绪」与「滚动回顶」不在同一帧，
 * 直接在 page:finish 里量尺寸会量到旧滚动位置。等两帧再刷一次，
 * 且幂等 —— 已经 shown 的块不会被重新隐藏。
 */
export function scheduleScrollRevealRefresh(): void {
  if (typeof window === 'undefined' || !observer) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      refreshScrollReveal();
      // 回顶后仍在视口上方的块直接点亮，避免极端情况下留一块透明区域
      for (const el of document.querySelectorAll<HTMLElement>(SELECTOR)) {
        if (el.dataset.reveal === 'hidden' && aboveViewport(el)) reveal(el, 0);
      }
    });
  });
}

/**
 * 全站唯一的入场动画入口，在 layout 的 setup 里调用一次。
 * 页面切换后由 layout 的钩子再调 scheduleScrollRevealRefresh() 补刷。
 */
export function useScrollReveal(): void {
  onMounted(() => {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;

    observer = new IntersectionObserver(
      (entries) => {
        let i = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target as HTMLElement, i * STAGGER);
          i += 1;
          observer?.unobserve(entry.target);
        }
      },
      // 元素露出 12% 才开始，避免刚贴边就闪一下
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );

    refreshScrollReveal();
    scheduleScrollRevealRefresh();
  });

  // 视口尺寸变化后，原本在屏幕外的块可能已经进入视野；
  // IntersectionObserver 会自己补发回调，这里只做清理。
  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
  });
}
