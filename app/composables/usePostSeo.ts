import type { MaybeRefOrGetter } from 'vue';
import { SITE } from '#shared/site';
import { parsePostDate } from '#shared/utils/date';
import { absoluteAsset, absoluteUrl } from '#shared/utils/post';
import { toArray } from '#shared/utils/term';
import { withSiteSuffix } from '#shared/utils/title';

/**
 * 文章页 SEO：标题 / 描述 / OG / article:* / JSON-LD(NewsArticle)。
 *
 * Edge 的「阅读模式」（Immersive Reader）优先读 og:title 与结构化数据里的
 * headline 来定标题；旧实现只给了一个裸 useHead({ title })，缺 og:title /
 * article:* / JSON-LD，阅读模式下标题就会丢。这里对齐 PidanUI 官网的实现，
 * 把标题信号补全，同时给 Edge 一个明确的 Article 结构。
 *
 * <title> 的 `· 冷域观者的个人网站` 后缀由 app.vue 的全局 titleTemplate
 * 追加；og / twitter 标签不经过模板，这里显式补，保持与 <title> 一致。
 */
export function usePostSeo(doc: MaybeRefOrGetter<Record<string, any> | null | undefined>) {
  const d = computed(() => toValue(doc));
  const url = computed(() => absoluteUrl(d.value?.path ?? '/'));
  const title = computed(() => String(d.value?.title ?? SITE.brand));
  const description = computed(() => String(d.value?.description ?? ''));
  const cover = computed(() => absoluteAsset(d.value?.cover || '/images/default_cover.svg'));
  const published = computed(() => {
    const date = parsePostDate(d.value?.date);
    return date ? date.toISOString() : undefined;
  });
  // <title> 的 `· 冷域观者的个人网站` 后缀由 app.vue 的全局 titleTemplate 追加；
  // og / twitter 标签不经过模板，这里显式补，保持与 <title> 一致
  const pageTitle = computed(() => withSiteSuffix(title.value));

  useSeoMeta({
    title,
    description,
    ogType: 'article',
    ogSiteName: SITE.brand,
    ogTitle: pageTitle,
    ogDescription: description,
    ogUrl: url,
    ogImage: cover,
    twitterCard: 'summary_large_image',
    twitterTitle: pageTitle,
    articlePublishedTime: published,
    articleAuthor: [SITE.author],
    articleTag: () => toArray(d.value?.tags),
  });

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: computed(() =>
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: title.value,
            description: description.value,
            mainEntityOfPage: url.value,
            inLanguage: 'zh-CN',
            author: { '@type': 'Organization', name: SITE.author, url: SITE.mainUrl },
            publisher: {
              '@type': 'Organization',
              name: SITE.brand,
              url: SITE.mainUrl,
              logo: { '@type': 'ImageObject', url: absoluteAsset('/images/logo.webp') },
            },
            ...(published.value
              ? { datePublished: published.value, dateModified: published.value }
              : {}),
            image: [cover.value],
          }),
        ),
      },
    ],
  });
}
