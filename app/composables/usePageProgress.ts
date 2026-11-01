// ============================================================
// 顶部页面加载进度条
//
// 进度来自真实加载状态，而不是固定节拍的模拟动画：
//   - 首屏：document.readyState → window.load → 字体/图片就绪
//   - 站内跳转：layout 监听 Nuxt 的 page:loading:start / page:loading:end
//     推进进度，页面入场后再等字体与新页面图片就绪，最后到 100%。
// 任何环节异常都有兜底，进度条不会永久卡住。
// ============================================================

import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

/** 进度条最短可见时长，避免极快的加载一闪而过 */
const MIN_VISIBLE_MS = 320;
/** 页面文档/模块加载阶段的上限，剩余进度留给渲染与资源 */
const LOADING_CAP = 55;
/** 页面渲染阶段的上限，最后一段在完成后补齐到 100 */
const READY_CAP = 92;
/** 每完成一个资源请求推进的进度 */
const RESOURCE_STEP = 4;
/** 整轮加载的兜底超时 */
const SAFETY_MS = 15000;
/** 图片迟迟不结束时，最长等待时间 */
const SETTLE_TIMEOUT_MS = 1500;
/** 100% 后淡出动画时长 */
const FADE_OUT_MS = 480;

export interface PageProgressState {
  progress: Ref<number>;
  active: Ref<boolean>;
  done: Ref<boolean>;
  /** 新页面已完成入场动画，等待字体与图片等真实资源就绪 */
  completeRendering: () => void;
  /** 导航开始（layout 挂在 page:loading:start 上） */
  start: (initial: boolean) => void;
  /** 导航结束（layout 挂在 page:loading:end 上） */
  markPageLoaded: () => void;
}

export function usePageProgress(): PageProgressState {

  const progress = ref(0);
  const active = ref(false);
  const done = ref(false);

  let runId = 0;
  let startedAt = 0;
  let resourceCount = 0;
  let renderRequested = false;
  let renderedRun = -1;
  let ticker: number | undefined;
  let safetyTimer: number | undefined;
  let finishTimer: number | undefined;
  let hideTimer: number | undefined;
  let settleTimer: number | undefined;
  let observer: PerformanceObserver | undefined;
  let windowLoadHandler: (() => void) | undefined;
  let readyStateHandler: (() => void) | undefined;

  function setProgress(value: number) {
    if (value > progress.value) progress.value = Math.min(value, 100);
  }

  function stopLoadingSignals() {
    if (ticker !== undefined) {
      window.clearInterval(ticker);
      ticker = undefined;
    }
    observer?.disconnect();
    observer = undefined;
    if (windowLoadHandler) {
      window.removeEventListener('load', windowLoadHandler);
      windowLoadHandler = undefined;
    }
    if (readyStateHandler) {
      document.removeEventListener('readystatechange', readyStateHandler);
      readyStateHandler = undefined;
    }
  }

  function clearTimers() {
    if (safetyTimer !== undefined) {
      window.clearTimeout(safetyTimer);
      safetyTimer = undefined;
    }
    if (finishTimer !== undefined) {
      window.clearTimeout(finishTimer);
      finishTimer = undefined;
    }
    if (hideTimer !== undefined) {
      window.clearTimeout(hideTimer);
      hideTimer = undefined;
    }
    if (settleTimer !== undefined) {
      window.clearTimeout(settleTimer);
      settleTimer = undefined;
    }
  }

  function reset() {
    stopLoadingSignals();
    clearTimers();
    active.value = false;
    done.value = false;
    progress.value = 0;
    renderRequested = false;
    renderedRun = -1;
  }

  /** 页面文档或路由模块加载完成，进入渲染阶段 */
  function markPageLoaded() {
    if (!active.value || done.value) return;
    stopLoadingSignals();
    setProgress(LOADING_CAP);
    if (renderRequested) completeRendering();
  }

  function start(isInitial = false) {
    reset();
    const id = ++runId;
    resourceCount = 0;
    startedAt = performance.now();
    active.value = true;
    done.value = false;
    progress.value = 8;

    // 真实资源请求（路由 chunk、图片、字体等）每完成一个，进度前进一步
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        observer = new PerformanceObserver((list) => {
          if (id !== runId) return;
          resourceCount += list.getEntries().length;
          setProgress(8 + Math.min(LOADING_CAP - 8, resourceCount * RESOURCE_STEP));
        });
        observer.observe({ entryTypes: ['resource'] });
      } catch {
        observer = undefined;
      }
    }

    // 等待加载期间按真实耗时缓慢逼近阶段上限；完成点仍由加载事件决定
    ticker = window.setInterval(() => {
      if (id !== runId) return;
      const elapsed = performance.now() - startedAt;
      setProgress(8 + Math.min(LOADING_CAP - 8, Math.sqrt(elapsed) * 1.8));
    }, 100);

    // 首屏没有 onBeforePageLoad，改由文档就绪状态驱动
    if (isInitial) {
      const onReadyStateChange = () => {
        if (id !== runId) return;
        if (document.readyState === 'complete') markPageLoaded();
        else if (document.readyState === 'interactive') setProgress(32);
      };
      const onWindowLoad = () => {
        if (id === runId) markPageLoaded();
      };
      readyStateHandler = onReadyStateChange;
      windowLoadHandler = onWindowLoad;
      document.addEventListener('readystatechange', onReadyStateChange);
      window.addEventListener('load', onWindowLoad);
      onReadyStateChange();
    }

    safetyTimer = window.setTimeout(() => {
      if (id === runId) finish();
    }, SAFETY_MS);
  }

  /** 新页面已挂载：等待字体与新页面中的图片，全部就绪后收尾 */
  function completeRendering() {
    if (!active.value || done.value) return;
    if (progress.value < LOADING_CAP) {
      // 页面模块尚未加载完成，等 markPageLoaded 再继续
      renderRequested = true;
      return;
    }
    if (renderedRun === runId) return;
    const id = runId;
    renderedRun = id;
    renderRequested = false;
    stopLoadingSignals();
    setProgress(LOADING_CAP);

    const tasks: Promise<unknown>[] = [];
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      tasks.push(document.fonts.ready.catch(() => undefined));
    }
    tasks.push(...pendingImageTasks());

    if (tasks.length === 0) {
      finish();
      return;
    }

    let settled = 0;
    for (const task of tasks) {
      task.then(() => {
        if (renderedRun !== id) return;
        settled += 1;
        setProgress(LOADING_CAP + (READY_CAP - LOADING_CAP) * (settled / tasks.length));
      });
    }

    Promise.allSettled(tasks).then(() => {
      if (renderedRun === id) finish();
    });

    // 网络挂起或懒加载的图片不应无限阻塞进度条
    settleTimer = window.setTimeout(() => {
      settleTimer = undefined;
      if (renderedRun === id && active.value && !done.value) finish();
    }, SETTLE_TIMEOUT_MS);
  }

  function finish() {
    if (!active.value || done.value) return;
    stopLoadingSignals();
    clearTimers();
    const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - startedAt));
    finishTimer = window.setTimeout(() => {
      finishTimer = undefined;
      setProgress(100);
      done.value = true;
      hideTimer = window.setTimeout(() => {
        hideTimer = undefined;
        active.value = false;
        done.value = false;
        progress.value = 0;
        renderedRun = -1;
      }, FADE_OUT_MS);
    }, wait);
  }

  onMounted(() => {
    // 首屏页面由服务端渲染完成后才挂载，这里只负责展示加载状态
    start(true);
  });

  onBeforeUnmount(() => {
    reset();
  });

  return { progress, active, done, completeRendering, start, markPageLoaded };
}

/** 收集新页面中尚未加载完成的图片（视口外的懒加载图片不参与） */
function pendingImageTasks(): Promise<unknown>[] {
  const tasks: Promise<unknown>[] = [];
  const images = Array.from(document.querySelectorAll<HTMLImageElement>('#content img'));
  for (const img of images) {
    if (img.complete) continue;
    if (img.loading === 'lazy' && img.getBoundingClientRect().top > window.innerHeight) {
      continue;
    }
    tasks.push(
      new Promise<void>((resolve) => {
        const handle = () => {
          img.removeEventListener('load', handle);
          img.removeEventListener('error', handle);
          resolve();
        };
        img.addEventListener('load', handle, { once: true });
        img.addEventListener('error', handle, { once: true });
      }),
    );
  }
  return tasks;
}
