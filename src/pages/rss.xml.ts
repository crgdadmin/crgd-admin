import type { APIRoute } from 'astro';
import { getPublications, href } from '../lib/content';
import { url, orgTitle, orgFullName, categoryLabel } from '../lib/site';

const escape = (v = '') => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const items = (await getPublications()).slice(0, 50);
  const home = new URL(url('/'), site).toString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>${escape(orgTitle)}: publications</title>
  <link>${home}</link>
  <description>${escape(`New research, analysis and commentary from ${orgFullName}.`)}</description>
  <language>en-in</language>
  <atom:link href="${new URL(url('/rss.xml'), site)}" rel="self" type="application/rss+xml" />
${items
  .map((p) => {
    const link = new URL(url(href.publication(p)), site).toString();
    return `  <item>
    <title>${escape(p.data.title)}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <pubDate>${p.data.date.toUTCString()}</pubDate>
    <category>${escape(categoryLabel('publications', p.data.type, true))}</category>
    ${p.data.authors.length ? `<dc:creator>${escape(p.data.authors.join(', '))}</dc:creator>` : ''}
    <description>${escape(p.data.summary ?? '')}</description>
  </item>`;
  })
  .join('\n')}
</channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
