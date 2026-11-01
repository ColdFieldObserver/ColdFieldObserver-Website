import { queryCollection } from '@nuxt/content/server';
import { SITE, FEED_LIMIT } from '#shared/site';
import { absoluteUrl, byDateDesc, toBasePost } from '#shared/utils/post';
import { mdcToHtml } from '#shared/utils/mdc';

const escapeXml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const rfc822 = (timestamp: number): string => new Date(timestamp || Date.now()).toUTCString();

// RSS 2.0 订阅源（参考项目只有 Atom，这里按原站行为保留 RSS）
export default defineEventHandler(async (event) => {
  const docs = await queryCollection(event, 'posts').all();
  const items = docs
    .map((doc) => ({ doc, post: toBasePost(doc as never) }))
    .sort((a, b) => byDateDesc(a.post, b.post))
    .slice(0, FEED_LIMIT)
    .map(({ doc, post }) => {
      const url = absoluteUrl(post.url);
      const html = mdcToHtml((doc as { body?: never }).body);
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${rfc822(post.timestamp)}</pubDate>
      <description>${escapeXml(post.description)}</description>
      <content:encoded><![CDATA[${html}]]></content:encoded>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${escapeXml(SITE.mainUrl)}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>zh-CN</language>
    <atom:link href="${escapeXml(`${SITE.mainUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8');
  return xml;
});
