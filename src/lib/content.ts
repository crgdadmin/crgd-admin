import { getCollection, type CollectionEntry } from 'astro:content';
import { byOrder, byOrderThen, newestFirst, slugify, todayIST, categories, category } from './site';

/*
 * One place that knows where every kind of entry lives on the website and
 * how entries relate to each other (authors to people, publications to
 * research centres, and so on).
 */

export type Person = CollectionEntry<'people'>;
export type Centre = CollectionEntry<'centres'>;
export type Publication = CollectionEntry<'publications'>;
export type EventEntry = CollectionEntry<'events'>;
export type Program = CollectionEntry<'programs'>;
export type Learning = CollectionEntry<'learning'>;
export type Impact = CollectionEntry<'impact'>;
export type MediaItem = CollectionEntry<'media'>;
export type Gallery = CollectionEntry<'galleries'>;
export type Report = CollectionEntry<'reports'>;
export type Opening = CollectionEntry<'openings'>;
export type Location = CollectionEntry<'locations'>;
export type Update = CollectionEntry<'updates'>;
export type Page = CollectionEntry<'pages'>;

/* ------------------------------- Links --------------------------------- */

export const href = {
  page: (p: Page) => (p.id === 'home' ? '/' : `/${p.id}`),
  person: (p: Person | string) => `/people/${typeof p === 'string' ? p : p.id}`,
  centre: (c: Centre | string) => `/research/${typeof c === 'string' ? c : c.id}`,
  publication: (p: Publication) => `/publications/${p.data.type}/${p.id}`,
  publicationType: (slug: string) => `/publications/${slug}`,
  event: (e: EventEntry) => `/events/${e.id}`,
  program: (p: Program) => `/programs/${p.data.category}/${p.id}`,
  learning: (l: Learning) => `/learning/${l.data.category}/${l.id}`,
  impact: (i: Impact) => `/impact/${i.data.category}/${i.id}`,
  media: (m: MediaItem) => `/media/${m.data.category}/${m.id}`,
  gallery: (g: Gallery) => `/media/photographs/${g.id}`,
  report: (r: Report) => `/annual-reports/${r.id}`,
  opening: (o: Opening) => `/careers/${o.id}`,
  update: (u: Update) => `/updates/${u.id}`,
};

/* ------------------------------ Loaders -------------------------------- */

const byName = byOrderThen<Person>((p) => p.data.name);
const byTitle = <T extends { data: { order?: number; title: string } }>(a: T, b: T) =>
  byOrder(a, b) || a.data.title.localeCompare(b.data.title);

export const getPeople = async () => (await getCollection('people')).sort(byName);
export const getCentres = async () => (await getCollection('centres')).sort(byTitle);
export const getPages = async () => (await getCollection('pages')).sort(byTitle);

export const getPublications = async () =>
  (await getCollection('publications')).sort(newestFirst((p) => p.data.date));

export const getEvents = async () => (await getCollection('events')).sort(newestFirst((e) => e.data.startDate));

export const getPrograms = async () => (await getCollection('programs')).sort(byTitle);
export const getLearning = async () => (await getCollection('learning')).sort(byTitle);
export const getImpact = async () =>
  (await getCollection('impact')).sort((a, b) => byOrder(a, b) || (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0));
export const getMedia = async () => (await getCollection('media')).sort(newestFirst((m) => m.data.date));
export const getGalleries = async () => (await getCollection('galleries')).sort(newestFirst((g) => g.data.date));
export const getReports = async () => (await getCollection('reports')).sort(newestFirst((r) => r.data.date));
export const getOpenings = async () =>
  (await getCollection('openings')).sort((a, b) => Number(a.data.status !== 'Open') - Number(b.data.status !== 'Open') || byTitle(a, b));
export const getLocations = async () =>
  (await getCollection('locations')).sort((a, b) => byOrder(a, b) || a.data.name.localeCompare(b.data.name));
export const getUpdates = async () =>
  (await getCollection('updates')).sort(
    (a, b) => Number(b.data.pinned) - Number(a.data.pinned) || b.data.date.getTime() - a.data.date.getTime(),
  );

/* ------------------------------ Events --------------------------------- */

/** An event stays "upcoming" until the end of its last day. */
export function isUpcoming(event: EventEntry): boolean {
  const last = event.data.endDate ?? event.data.startDate;
  return last.getTime() >= todayIST().getTime();
}

export async function splitEvents() {
  const all = await getEvents();
  const upcoming = all.filter(isUpcoming).sort((a, b) => a.data.startDate.getTime() - b.data.startDate.getTime());
  const past = all.filter((e) => !isUpcoming(e));
  return { all, upcoming, past };
}

/* ------------------------------ People --------------------------------- */

export interface Byline {
  name: string;
  person?: Person;
  href?: string;
}

/**
 * Authors, speakers and faculty are typed in the CMS as names. When a name
 * (or a web address) matches someone in People, the byline links to their
 * profile; otherwise it is shown as plain text, which suits guest authors.
 */
export async function resolvePeople(names: string[] = []): Promise<Byline[]> {
  const people = await getCollection('people');
  return names.map((raw) => {
    const name = raw.trim();
    const key = slugify(name);
    const person = people.find((p) => p.id === name || p.id === key || slugify(p.data.name) === key);
    return person ? { name: person.data.name, person, href: href.person(person) } : { name };
  });
}

export function personMatches(person: Person, names: string[] = []): boolean {
  const own = new Set([person.id, slugify(person.data.name)]);
  return names.some((n) => own.has(n.trim()) || own.has(slugify(n)));
}

export function peopleInGroups(people: Person[], groups: string[] = []): Person[] {
  return people.filter((p) => p.data.groups.some((g) => groups.includes(g)));
}

export const groupLabels: Record<string, string> = {
  founder: 'Founder',
  'governing-board': 'Governing Board',
  'advisory-board': 'Advisory Board',
  scholar: 'Scholar',
  mentor: 'Mentor',
  patron: 'Patron',
  associate: 'Associates',
  fellow: 'Fellows',
  researcher: 'Researchers',
  intern: 'Interns',
  contributor: 'Contributors',
};

/** The people page each group is listed on. */
export function groupPage(group: string): string | undefined {
  if (group === 'founder') return '/our-founder';
  const page = categories('people').find((c) => c.groups?.includes(group));
  return page ? `/people/${page.slug}` : undefined;
}

/* ------------------------------ Centres -------------------------------- */

export async function centresFor(slugs: string[] = []): Promise<Centre[]> {
  const all = await getCentres();
  return slugs.map((s) => all.find((c) => c.id === s)).filter((c): c is Centre => !!c);
}

/* ---------------------------- Publications ----------------------------- */

export function publicationTypeLabel(slug: string, singular = true) {
  const found = category('publications', slug);
  return found ? (singular ? found.singular || found.label : found.label) : slug;
}

export function relatedPublications(all: Publication[], current: Publication, limit = 3): Publication[] {
  const score = (p: Publication) =>
    p.data.centres.filter((c) => current.data.centres.includes(c)).length * 3 +
    p.data.tags.filter((t) => current.data.tags.includes(t)).length * 2 +
    (p.data.type === current.data.type ? 1 : 0);
  return all
    .filter((p) => p.id !== current.id)
    .map((p) => ({ p, s: score(p) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s || b.p.data.date.getTime() - a.p.data.date.getTime())
    .slice(0, limit)
    .map(({ p }) => p);
}
