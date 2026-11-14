<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { SITE } from '#shared/site';
import { AVATAR, GAME_IDS, HERO_INTRO, PROJECTS, SITE_NOTE } from '~/data/home';
import { PERSONAL_PROFILE, SOCIAL_LINKS, TIMELINE } from '~/data/profile';
import { latestPosts, useAllPosts } from '~/composables/usePosts';

// ============================================================
// 首页：Hero → 关于我 / 身份主线 → 最新文章 → 我的项目
//       → 我的游戏 ID → 关于这个站点
// 「最新文章」「个人档案」原在右侧栏，右栏移除后搬到这里。
// 工具模块已移除：顶栏「工具」现为站外链接，站内不再有 /tools/ 路由。
// ============================================================
const allPosts = useAllPosts();
const latest = computed(() => latestPosts(allPosts.value, 3));

/**
 * 「我的游戏 ID」的跑马灯阈值：超过 3 张卡才滚动。
 * 卡片放大到 515px 后一排只放得下两张，号少时静止平铺更容易看清。
 */
const ID_MARQUEE_MIN = 3;
const idMarqueeActive = computed(() => GAME_IDS.length > ID_MARQUEE_MIN);

// 窄屏判定（<768px）：与 PidanUI 官网 dffe9339 同一套 SSR 安全做法。
// SSR 阶段没有 window，默认 false，与客户端首屏渲染一致，避免 hydration 不匹配；
// 挂载后再用 matchMedia 读真实视口宽度，并监听旋转 / resize 等变化。
const isNarrow = ref(false);
let idMql: MediaQueryList | null = null;
let idMqlHandler: ((e: MediaQueryListEvent) => void) | null = null;
onMounted(() => {
  if (!window.matchMedia) return;
  idMql = window.matchMedia('(max-width: 767px)');
  isNarrow.value = idMql.matches;
  idMqlHandler = (e: MediaQueryListEvent) => (isNarrow.value = e.matches);
  idMql.addEventListener('change', idMqlHandler);
});
onBeforeUnmount(() => {
  if (idMql && idMqlHandler) idMql.removeEventListener('change', idMqlHandler);
});

// 仅「卡片够多 且 非窄屏」时启用跑马灯；窄屏一律退化为静态网格。
const showMarquee = computed(() => idMarqueeActive.value && !isNarrow.value);

useHead({ title: SITE.title });
</script>

<template>
  <div class="mx-auto max-w-page">
    <!-- 1. Hero：圆形头像 + 标题 + 简介 + 社交按钮 -->
    <section class="hero-grid -mx-4 px-4 py-10 text-center sm:-mx-6 sm:px-6 lg:py-14">
      <img
        class="mx-auto size-28 rounded-full object-cover ring-4 ring-primary/15 lg:size-32"
        :src="AVATAR"
        alt="冷域观者的头像"
        width="512"
        height="512"
        decoding="async"
        fetchpriority="high"
      />
      <h1
        class="mx-auto mt-6 max-w-[22em] text-[clamp(26px,4.6vw,40px)] leading-[1.2] font-extrabold tracking-tight text-highlighted"
      >
        欢迎来到冷域观者的个人网站
      </h1>
      <p class="mx-auto mt-4 max-w-[620px] text-[15.5px] leading-[1.9] text-toned">
        {{ HERO_INTRO }}
      </p>

      <div class="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        <UButton
          v-for="link in SOCIAL_LINKS"
          :key="link.url"
          :to="link.url"
          target="_blank"
          rel="noopener"
          :icon="link.icon"
          :label="link.name"
          size="lg"
          variant="ghost"
          color="neutral"
        />
      </div>
    </section>

    <!-- 2. 关于我 / 身份主线经历 -->
    <section class="mt-4 grid gap-6 lg:grid-cols-2">
      <UCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-bold text-highlighted">
            <UIcon name="i-lucide-info" class="size-5 text-primary" aria-hidden="true" />
            关于我
          </h2>
        </template>
        <ul class="flex flex-col gap-3">
          <li
            v-for="line in PERSONAL_PROFILE"
            :key="line"
            class="flex gap-2 text-sm leading-[1.8] text-toned"
          >
            <UIcon
              name="i-lucide-chevron-right"
              class="mt-1 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{{ line }}</span>
          </li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-bold text-highlighted">
            <UIcon name="i-lucide-tags" class="size-5 text-primary" aria-hidden="true" />
            身份主线经历
          </h2>
        </template>
        <UTimeline :items="TIMELINE" size="sm" />
      </UCard>
    </section>

    <!-- 3. 最新博客文章 -->
    <UPageSection
      class="mt-12"
      title="最新博客文章"
      description="不定时更新的记录、折腾与归档。"
      :ui="{ container: 'py-0! gap-5' }"
    >
      <CardGrid :posts="latest" empty-text="暂无文章" />
      <template #footer>
        <div class="flex justify-center">
          <UButton
            to="/posts/"
            size="lg"
            trailing-icon="i-lucide-arrow-right"
            label="查看全部文章"
          />
        </div>
      </template>
    </UPageSection>

    <!-- 4. 我的项目 -->
    <UPageSection
      class="mt-12"
      title="我的项目"
      description="长期在维护的几个项目。"
      :ui="{ container: 'py-0! gap-5' }"
    >
      <UPageGrid style="--grid-min: 280px">
        <UPageCard
          v-for="project in PROJECTS"
          :key="project.name"
          :icon="project.icon"
          :title="project.name"
          :description="project.description"
          variant="outline"
          spotlight
        >
          <template #footer>
            <div class="flex flex-wrap items-center gap-3">
              <UButton
                :to="project.to"
                target="_blank"
                rel="noopener"
                variant="link"
                trailing-icon="i-lucide-arrow-up-right"
                :label="`打开 ${project.name}`"
                :padded="false"
              />
              <!-- 目前不需要 extra 链接，所以注释掉
              <UButton
                v-if="project.extra"
                :to="project.extra.to"
                target="_blank"
                rel="noopener"
                variant="link"
                color="neutral"
                :label="project.extra.label"
                :padded="false"
              />
              -->
            </div>
          </template>
        </UPageCard>
      </UPageGrid>
    </UPageSection>

    <!-- 5. 我的游戏 ID：卡片够多且非窄屏才跑马灯，否则静态网格（不出现横滚动条） -->
    <UPageSection
      class="mt-12"
      title="我的游戏 ID"
      description="欢迎和我一起组队。"
      :ui="{ container: 'py-0! gap-5' }"
    >
      <!-- 与 PidanUI 官网 dffe9339 同一套规则：窄屏(<768px)一律退化为静态网格。
           卡片放大到 515px 后，静止态用网格平铺，容器不再需要横向滚动。 -->
      <UMarquee v-if="showMarquee" :repeat="2" pause-on-hover :overlay="false" class="id-marquee">
        <GameIdCard v-for="item in GAME_IDS" :key="item.name" :item="item" />
      </UMarquee>

      <!-- 静态网格：窄屏一行一张卡片，桌面按 515px 目标宽度自动分列；
           卡片撑满列宽，容器任何视口下都不会出现横向滚动条。 -->
      <div v-else class="id-static" role="list" aria-label="我的游戏 ID 卡片列表">
        <GameIdCard
          v-for="item in GAME_IDS"
          :key="item.name"
          :item="item"
          class="id-card"
          role="listitem"
        />
      </div>
    </UPageSection>

    <!-- 6. 关于这个站点 -->
    <UPageSection
      class="mt-12 mb-4"
      title="关于这个站点"
      description="有关这个站点背后的一些故事。"
      :ui="{ container: 'py-0! gap-5' }"
    >
      <UCard>
        <div class="flex flex-col gap-3 text-[15px] leading-[1.9] text-toned">
          <p v-for="(seg, index) in SITE_NOTE" :key="index">{{ seg }}</p>
        </div>
        <template #footer>
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              to="https://github.com/PidanEggyTeam/ColdFieldObserver-Website"
              target="_blank"
              rel="noopener"
              variant="ghost"
              color="neutral"
              icon="i-lucide-folder-git-2"
              label="站点源代码"
            />
          </div>
        </template>
      </UCard>
    </UPageSection>
  </div>
</template>

<style scoped>
/* Hero 区域的网格底纹：机甲时代留下的唯一一处纹理，只在这里用。
   网格画在 ::before 上而不是 section 自身的 background 上：
   mask-image 会作用于元素**及其全部后代**，直接给 section 加 mask 会让
   底部的社交按钮跟着网格一起淡出（表现为按钮被一层渐变「盖住」）。
   拆成伪元素后，淡出只影响背景，内容永远是不透明的。 */
.hero-grid {
  position: relative;
  isolation: isolate;
}

.hero-grid::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  background-image:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 36px 36px;
  background-position: center;
  /* 四边淡出，避免网格在区块边界被硬切 */
  mask-image: radial-gradient(120% 100% at 50% 0%, #000 45%, transparent 100%);
  content: '';
  pointer-events: none;
}

/* UMarquee 默认 gap 是 64px、一圈 20s；这里与卡片间距对齐并放慢。
   卡片从 260px 放大到 515px 后一圈距离约翻倍，时长同步调到 80s 保持线速度。 */
.id-marquee {
  --gap: 16px;
  --duration: 80s;
}

/* 静态网格（非跑马灯形态）：容器不设 overflow-x，放不下就换行，
   任何视口宽度下都不会出现横向滚动条。
   - 窄屏(<768px)：单列、一行一张卡片，游戏 ID 卡需要足够大；
   - 桌面(>=768px)：按 515px 目标宽度自动分列，放不下就少放一列。
   卡片自身的 w-[515px] shrink-0 由 :deep 覆盖：width 跟随列宽、
   上限 515px 居中，跑马灯里仍保留固定宽。 */
.id-static {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  justify-items: center;
}

.id-static :deep(.id-card) {
  width: 100%;
  min-width: 0;
  max-width: 515px;
}

@media (min-width: 768px) {
  .id-static {
    grid-template-columns: repeat(auto-fit, minmax(min(515px, 100%), 1fr));
  }
}
</style>
