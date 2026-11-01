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

// Atom 1.0 订阅源（构建期预渲染为静态 atom.xml）
export default defineEventHandler(async (event) => {
  const docs = await queryCollection(event, 'posts').all();
  const posts = docs
    .map((doc) => toBasePost(doc as never))
    .sort(byDateDesc)
    .slice(0, FEED_LIMIT);
  const updatedAt = posts[0]?.timestamp ?? 0;
  const updated = new Date(updatedAt > 0 ? updatedAt : Date.now()).toISOString();
  const iso = (timestamp: number): string =>
    new Date(timestamp > 0 ? timestamp : Date.now()).toISOString();

  const entries = docs
    .map((doc) => ({ doc, post: toBasePost(doc as never) }))
    .sort((a, b) => b.post.timestamp - a.post.timestamp)
    .slice(0, FEED_LIMIT)
    .map(({ doc, post }) => {
      const url = absoluteUrl(post.url);
      const html = mdcToHtml((doc as { body?: never }).body);
      return `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${escapeXml(url)}" />
    <id>${escapeXml(url)}</id>
    <updated>${iso(post.timestamp)}</updated>
    <summary>${escapeXml(post.description)}</summary>
    <content type="html">${escapeXml(html)}</content>
  </entry>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="zh-CN">
  <title>${escapeXml(SITE.title)}</title>
  <subtitle>${escapeXml(SITE.description)}</subtitle>
  <link href="${escapeXml(`${SITE.mainUrl}/atom.xml`)}" rel="self" />
  <link href="${escapeXml(SITE.mainUrl)}" />
  <id>${escapeXml(`${SITE.mainUrl}/`)}</id>
  <updated>${updated}</updated>
  <author><name>${escapeXml(SITE.author)}</name></author>
${entries}
</feed>`;

  setHeader(event, 'Content-Type', 'application/atom+xml; charset=utf-8');
  return xml;
});
