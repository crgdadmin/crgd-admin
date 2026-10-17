import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { href, getEvents } from '../lib/content';
import { url, categories, isoDate } from '../lib/site';

export const GET: APIRoute = async ({ site }) => {
  const [pages, people, centres, publications, events, programs, learning, impact, media, galleries, reports, openings, updates] = await Promise.all([
    getCollection('pages'),
    getCollection('people'),
    getCollection('centres'),
    getCollection('publications'),
    getEvents(),
    getCollection('programs'),
    getCollection('learning'),
    getCollection('impact'),
    getCollection('media'),
    getCollection('galleries'),
    getCollection('reports'),
    getCollection('openings'),
    getCollection('updates'),
  ]);

  const entry = (path: string, lastmod?: Date) => ({ path, lastmod });
  const list = [
    entry('/'),
    ...['/people', '/research', '/learning', '/programs', '/publications', '/impact', '/events', '/events/upcoming', '/events/past', '/media', '/media/photographs', '/annual-reports', '/careers', '/locations', '/updates', '/search'].map((p) => entry(p)),
    ...categories('people').map((c) => entry(`/people/${c.slug}`)),
    ...(['learning', 'programs', 'publications', 'impact', 'media'] as const).flatMap((s) => categories(s).filter((c) => c.slug !== 'photographs').map((c) => entry(`/${s}/${c.slug}`))),
    ...pages.map((p) => entry(href.page(p), p.data.updated)),
    ...people.map((p) => entry(href.person(p))),
    ...centres.map((c) => entry(href.centre(c))),
    ...publications.map((p) => entry(href.publication(p), p.data.updated ?? p.data.date)),
    ...events.map((e) => entry(href.event(e))),
    ...programs.map((p) => entry(href.program(p))),
    ...learning.map((l) => entry(href.learning(l))),
    ...impact.map((i) => entry(href.impact(i))),
    ...media.filter((m) => m.data.category !== 'photographs').map((m) => entry(href.media(m), m.data.date)),
    ...galleries.map((g) => entry(href.gallery(g))),
    ...reports.map((r) => entry(href.report(r))),
    ...openings.map((o) => entry(href.opening(o))),
    ...updates.map((u) => entry(href.update(u), u.data.date)),
  ];
  const seen = new Set<string>();
  const unique = list.filter((e) => (seen.has(e.path) ? false : (seen.add(e.path), true)));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique.map((e) => `  <url><loc>${new URL(url(e.path), site).toString()}</loc>${e.lastmod ? `<lastmod>${isoDate(e.lastmod)}</lastmod>` : ''}</url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
