import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { href, getPublications, getPeople, getCentres, getEvents } from '../lib/content';
import { url, plainText, categoryLabel, formatDate, categories } from '../lib/site';

/* Everything the search page can find, built fresh on every deploy. */
export const GET: APIRoute = async () => {
  const [pages, people, centres, publications, events, programs, learning, impact, media, galleries, reports, openings, updates] = await Promise.all([
    getCollection('pages'),
    getPeople(),
    getCentres(),
    getPublications(),
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
  const body = (text?: string, extra: string[] = []) => `${extra.join(' ')} ${plainText(text ?? '')}`.slice(0, 4000);

  const entries = [
    ...publications.map((p) => ({
      type: categoryLabel('publications', p.data.type, true),
      title: p.data.title,
      summary: p.data.summary ?? '',
      url: url(href.publication(p)),
      date: formatDate(p.data.date),
      body: body(p.body, [...p.data.authors, ...p.data.tags, ...p.data.centres]),
    })),
    ...people.map((p) => ({
      type: 'Person',
      title: p.data.name,
      summary: [p.data.role, p.data.affiliation].filter(Boolean).join(', '),
      url: url(href.person(p)),
      body: body(p.body, [p.data.shortBio ?? '', ...p.data.expertise]),
    })),
    ...centres.map((c) => ({ type: 'Research centre', title: c.data.title, summary: c.data.summary ?? '', url: url(href.centre(c)), body: body(c.body, [...c.data.focusAreas, ...c.data.keyQuestions]) })),
    ...events.map((e) => ({ type: 'Event', title: e.data.title, summary: e.data.summary ?? '', url: url(href.event(e)), date: formatDate(e.data.startDate), body: body(e.body, [...e.data.speakers, e.data.venue ?? '', e.data.type]) })),
    ...programs.map((p) => ({ type: categoryLabel('programs', p.data.category), title: p.data.title, summary: p.data.summary ?? '', url: url(href.program(p)), body: body(p.body, p.data.eligibility) })),
    ...learning.map((l) => ({ type: categoryLabel('learning', l.data.category), title: l.data.title, summary: l.data.summary ?? '', url: url(href.learning(l)), body: body(l.body, l.data.faculty) })),
    ...impact.map((i) => ({ type: categoryLabel('impact', i.data.category), title: i.data.title, summary: i.data.summary ?? '', url: url(href.impact(i)), body: body(i.body, i.data.outcomes) })),
    ...media.map((m) => ({ type: categoryLabel('media', m.data.category), title: m.data.title, summary: m.data.summary ?? '', url: url(href.media(m)), date: formatDate(m.data.date), body: body(m.body, [m.data.outlet ?? '', ...m.data.people]) })),
    ...galleries.map((g) => ({ type: 'Photographs', title: g.data.title, summary: g.data.summary ?? '', url: url(href.gallery(g)), date: formatDate(g.data.date), body: body(g.body) })),
    ...reports.map((r) => ({ type: 'Annual report', title: r.data.title, summary: r.data.summary ?? '', url: url(href.report(r)), body: body(r.body, r.data.highlights) })),
    ...openings.map((o) => ({ type: 'Job opening', title: o.data.title, summary: o.data.summary ?? '', url: url(href.opening(o)), body: body(o.body, o.data.responsibilities) })),
    ...updates.map((u) => ({ type: 'Update', title: u.data.title, summary: u.data.summary ?? '', url: url(href.update(u)), date: formatDate(u.data.date), body: body(u.body) })),
    ...pages.map((p) => ({ type: 'Page', title: p.data.title, summary: p.data.summary ?? '', url: url(href.page(p)), body: body(p.body) })),
    ...(['publications', 'programs', 'learning', 'impact', 'media'] as const).flatMap((section) =>
      categories(section).map((c) => ({ type: 'Section', title: c.label, summary: c.description ?? '', url: url(`/${section}/${c.slug}`), body: '' })),
    ),
  ];

  return new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
