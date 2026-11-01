// ============================================================
// Nuxt UI 运行时主题配置
// ------------------------------------------------------------
// 色彩体系全部落在项目自己的设计令牌上（见 app/assets/styles/base.css）：
//   primary → accent（机甲蓝 #1260cc 色阶，500/600 对齐 --accent / --accent-deep）
//   neutral → ink   （与 --ink / --line / --bg 逐档对齐的灰阶；
//                    不能叫 neutral —— 那是 Nuxt UI 的保留名，会被 old- 前缀
//                    回退到它自己的 oklch 灰，站点灰阶就对不上了）
//   error   → danger（站点一贯的红，用于表单校验与失败态）
// ============================================================
export default defineAppConfig({
  // 图标一律渲染成内联 <svg>（Nuxt Icon 默认的 css 模式输出 <span class="iconify">，
  // 要等客户端拿到图标数据才有内容；静态站点要首屏就有图标，必须用 svg 模式）
  icon: {
    mode: 'svg',
  },

  ui: {
    colors: {
      primary: 'accent',
      neutral: 'ink',
      error: 'danger',
    },

    /* ---- UHeader ----
       去掉默认的居中容器最大宽度，让顶栏内容与页面主体同宽 */
    header: {
      slots: {
        container: 'max-w-none px-4 sm:px-6 lg:px-8',
        right: 'flex items-center gap-1',
      },
    },

    /* ---- UPageGrid ----
       默认是固定列数（1 / sm:2 / lg:3），卡片宽度会被视口牵着走。
       改为 auto-fill：密度由调用点的 --grid-min 决定，
       min(…, 100%) 顺带兜住窄屏，不需要再写单列媒体查询。
       末尾的 ! 用于压掉主题里的 sm:/lg: 列数 —— 调用点 :ui 是追加，删不掉变体。 */
    pageGrid: {
      base:
        'relative grid gap-4! ' +
        'grid-cols-[repeat(auto-fill,minmax(min(var(--grid-min,290px),100%),1fr))]!',
    },
  },
});
