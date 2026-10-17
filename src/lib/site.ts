import settingsJson from '../data/settings.json';
import homeJson from '../data/home.json';
import navigationJson from '../data/navigation.json';
import sectionsJson from '../data/sections.json';

/* ------------------------------------------------------------------------ */
/* Data files edited through the CMS                                         */
/* ------------------------------------------------------------------------ */

type Social = Partial<Record<'facebook' | 'instagram' | 'x' | 'linkedin' | 'youtube' | 'whatsappChannel' | 'threads' | 'spotify', string>>;

/** The CMS drops empty fields from JSON, so every field is read as optional. */
export const site = settingsJson as Partial<typeof settingsJson> & {
  shortName: string;
  tagline: string;
  social?: Social;
};
export const home = homeJson as typeof homeJson;
export const navigation = navigationJson as typeof navigationJson;
export const sections = sectionsJson as typeof sectionsJson;

export const orgName = site.shortName?.trim() || 'CRGD';
export const orgFullName = site.fullName?.trim() || orgName;
export const orgTagline = site.tagline?.trim() || '';
export const orgTitle = orgTagline ? `${orgName}: ${orgTagline}` : orgName;

export interface Category {
  slug: string;
  label: string;
  singular?: string;
  description?: string;
  groups?: string[];
}

export type SectionKey = 'people' | 'learning' | 'programs' | 'publications' | 'impact' | 'media';

export function categories(section: SectionKey): Category[] {
  const entry = sections[section] as { categories?: Category[] } | undefined;
  return (entry?.categories ?? []).filter((c) => c && c.slug && c.label);
}

export function category(section: SectionKey, slug: string | undefined): Category | undefined {
  return categories(section).find((c) => c.slug === slug);
}

export function categoryLabel(section: SectionKey, slug: string | undefined, singular = false): string {
  const found = category(section, slug);
  if (!found) return humanise(slug ?? '');
  return singular ? found.singular || found.label : found.label;
}

/* ------------------------------------------------------------------------ */
/* Addresses                                                                 */
/* ------------------------------------------------------------------------ */

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Every internal link goes through here so the site also works from a sub folder. */
/** Page addresses end in a slash, which is how the built folders are served, so links never redirect. */
function withSlash(path: string): string {
  const [, pathname, rest] = path.match(/^([^?#]*)(.*)$/) ?? ['', path, ''];
  const last = pathname.split('/').pop() ?? '';
  return pathname.endsWith('/') || last.includes('.') ? path : `${pathname}/${rest}`;
}

export function url(path = '/'): string {
  if (!path) return `${base}/`;
  if (/^(https?:|mailto:|tel:|#|\/\/|data:|whatsapp:)/.test(path)) return path;
  const clean = withSlash(path.startsWith('/') ? path : `/${path}`);
  if (base && clean.startsWith(`${base}/`)) return clean;
  return `${base}${clean}`;
}

/** Images and files uploaded in the CMS are stored as /uploads/name.ext. */
export const asset = (path?: string) => (path ? url(path) : '');

export function absolute(path: string, siteUrl: URL | undefined): string {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(url(path), siteUrl ?? 'https://example.org').toString();
}

export function isExternal(href?: string): boolean {
  return !!href && /^https?:\/\//.test(href);
}

/* ------------------------------------------------------------------------ */
/* Text                                                                      */
/* ------------------------------------------------------------------------ */

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function humanise(slug: string): string {
  return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initials(name: string): string {
  const words = name
    .replace(/\b(dr|prof|shri|smt|mr|mrs|ms|adv|justice|sri)\.?\s+/gi, '')
    .split(/\s+/)
    .filter((w) => /^[A-Za-zഀ-ൿ]/.test(w));
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return letters.map((w) => w[0]).join('').toUpperCase() || orgName.slice(0, 2);
}

export function readingTime(body = ''): number {
  const words = body.replace(/[#>*_`[\]()-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function plainText(markdown = ''): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function excerpt(markdown = '', length = 200): string {
  const text = plainText(markdown);
  if (text.length <= length) return text;
  return `${text.slice(0, text.lastIndexOf(' ', length))}…`;
}

export function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/* ------------------------------------------------------------------------ */
/* Dates. The organisation works in India Standard Time.                     */
/* ------------------------------------------------------------------------ */

const TZ = 'Asia/Kolkata';

export function formatDate(value?: Date, style: 'long' | 'short' | 'month' | 'year' = 'long'): string {
  if (!value || Number.isNaN(value.getTime())) return '';
  const options: Intl.DateTimeFormatOptions =
    style === 'long'
      ? { day: 'numeric', month: 'long', year: 'numeric' }
      : style === 'short'
        ? { day: 'numeric', month: 'short', year: 'numeric' }
        : style === 'month'
          ? { month: 'long', year: 'numeric' }
          : { year: 'numeric' };
  return new Intl.DateTimeFormat('en-IN', { ...options, timeZone: TZ }).format(value);
}

export function dateParts(value: Date) {
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-IN', { ...options, timeZone: TZ }).format(value);
  return {
    day: part({ day: '2-digit' }),
    month: part({ month: 'short' }),
    year: part({ year: 'numeric' }),
    weekday: part({ weekday: 'long' }),
  };
}

export function isoDate(value?: Date): string {
  return value && !Number.isNaN(value.getTime()) ? value.toISOString().slice(0, 10) : '';
}

export function yearOf(value?: Date): string {
  return value ? formatDate(value, 'year') : '';
}

/** Start of today in India. Pages are rebuilt every night, so this stays current. */
export function todayIST(): Date {
  const now = new Date();
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  return new Date(`${ymd}T00:00:00+05:30`);
}

export function dateRange(start: Date, end?: Date): string {
  if (!end || isoDate(end) === isoDate(start)) return formatDate(start);
  const s = dateParts(start);
  const e = dateParts(end);
  if (s.year === e.year && s.month === e.month) return `${Number(s.day)} to ${Number(e.day)} ${new Intl.DateTimeFormat('en-IN', { month: 'long', timeZone: TZ }).format(start)} ${s.year}`;
  return `${formatDate(start)} to ${formatDate(end)}`;
}

/* ------------------------------------------------------------------------ */
/* Sorting                                                                   */
/* ------------------------------------------------------------------------ */

export function byOrder<T extends { data: { order?: number } }>(a: T, b: T): number {
  return (a.data.order ?? 50) - (b.data.order ?? 50);
}

export function byOrderThen<T extends { data: { order?: number } }>(key: (item: T) => string) {
  return (a: T, b: T) => byOrder(a, b) || key(a).localeCompare(key(b));
}

export function newestFirst<T>(pick: (item: T) => Date | undefined) {
  return (a: T, b: T) => (pick(b)?.getTime() ?? 0) - (pick(a)?.getTime() ?? 0);
}

/* ------------------------------------------------------------------------ */
/* Media                                                                     */
/* ------------------------------------------------------------------------ */

/** Turns a YouTube, Vimeo, Spotify or SoundCloud link into an embeddable player address. */
export function embedUrl(link?: string): string | undefined {
  if (!link) return undefined;
  try {
    const u = new URL(link);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (host.endsWith('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) return link;
      if (u.pathname.startsWith('/shorts/')) return `https://www.youtube-nocookie.com/embed/${u.pathname.split('/')[2]}`;
      if (u.pathname.startsWith('/live/')) return `https://www.youtube-nocookie.com/embed/${u.pathname.split('/')[2]}`;
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
      const list = u.searchParams.get('list');
      if (list) return `https://www.youtube-nocookie.com/embed/videoseries?list=${list}`;
    }
    if (host === 'vimeo.com') return `https://player.vimeo.com/video/${u.pathname.split('/').filter(Boolean)[0]}`;
    if (host === 'open.spotify.com' && !u.pathname.startsWith('/embed')) return `https://open.spotify.com/embed${u.pathname}`;
    if (host === 'soundcloud.com') return `https://w.soundcloud.com/player/?url=${encodeURIComponent(link)}&color=%23112a46`;
    return link;
  } catch {
    return undefined;
  }
}

export function isAudio(link?: string): boolean {
  return !!link && /(spotify\.com|soundcloud\.com|\.mp3$|\.m4a$)/i.test(link);
}

/** A stable palette index for placeholder artwork, so each item keeps its colour. */
export function toneFor(seed: string, tones = 6): number {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % tones;
}

/* ------------------------------------------------------------------------ */
/* Typography choices offered in the CMS                                      */
/* ------------------------------------------------------------------------ */

export const fontPairings: Record<string, { label: string; display: string; text: string; href: string }> = {
  editorial: {
    label: 'Editorial: Newsreader headings with Inter text',
    display: "'Newsreader', 'Georgia', serif",
    text: "'Inter', 'Segoe UI', system-ui, sans-serif",
    href: 'family=Newsreader:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700',
  },
  scholarly: {
    label: 'Scholarly: Source Serif headings with Source Sans text',
    display: "'Source Serif 4', 'Georgia', serif",
    text: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    href: 'family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600;700',
  },
  elegant: {
    label: 'Elegant: Cormorant Garamond headings with Montserrat text',
    display: "'Cormorant Garamond', 'Garamond', serif",
    text: "'Montserrat', 'Segoe UI', system-ui, sans-serif",
    href: 'family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Montserrat:wght@300;400;500;600;700',
  },
  modern: {
    label: 'Modern: Fraunces headings with Manrope text',
    display: "'Fraunces', 'Georgia', serif",
    text: "'Manrope', 'Segoe UI', system-ui, sans-serif",
    href: 'family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=Manrope:wght@300;400;500;600;700',
  },
  contemporary: {
    label: 'Contemporary: DM Serif Display headings with DM Sans text',
    display: "'DM Serif Display', 'Georgia', serif",
    text: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    href: 'family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700',
  },
};

export function fonts() {
  const pairing = fontPairings[site.fontPairing ?? 'editorial'] ?? fontPairings.editorial;
  return {
    ...pairing,
    href: `https://fonts.googleapis.com/css2?${pairing.href}&family=Noto+Sans+Malayalam:wght@400;600&display=swap`,
  };
}

/* ------------------------------------------------------------------------ */
/* Contact details                                                           */
/* ------------------------------------------------------------------------ */

export function telHref(phone?: string): string {
  return phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : '';
}

export const socialLinks = (() => {
  const s = site.social ?? {};
  const all = [
    { key: 'facebook', label: 'Facebook', href: s.facebook },
    { key: 'instagram', label: 'Instagram', href: s.instagram },
    { key: 'x', label: 'X (Twitter)', href: s.x },
    { key: 'linkedin', label: 'LinkedIn', href: s.linkedin },
    { key: 'youtube', label: 'YouTube', href: s.youtube },
    { key: 'whatsapp', label: 'WhatsApp channel', href: s.whatsappChannel },
    { key: 'threads', label: 'Threads', href: s.threads },
    { key: 'spotify', label: 'Spotify', href: s.spotify },
  ];
  return all.filter((item): item is { key: string; label: string; href: string } => !!item.href);
})();

export const showPlaceholders = site.showPlaceholderLabels !== false;

/* ------------------------------------------------------------------------ */
/* The palette as a continuous scale, for numbered lists of any length       */
/* ------------------------------------------------------------------------ */

export const palette = ['#0a1b2e', '#112a46', '#1b3b5a', '#34506d', '#557392', '#7a8ca6', '#a1b2c4', '#c4d2e1', '#e1e8f0', '#f2f6fb'];

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const luminance = ([r, g, b]: number[]) => {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/** Background and text colour for row i of n, stepping from Deep Navy to Arctic Haze. */
export function spectrumColor(i: number, n: number, from = 0, to = palette.length - 1) {
  const t = n <= 1 ? 0 : i / (n - 1);
  const p = from + t * (to - from);
  const lo = Math.floor(p);
  const hi = Math.min(palette.length - 1, lo + 1);
  const f = p - lo;
  const [a, b] = [rgb(palette[lo]), rgb(palette[hi])];
  const mix = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  const bg = `#${mix.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  const L = luminance(mix);
  const light = contrast(L, 1) >= contrast(L, luminance(rgb(palette[0])));
  return { bg, fg: light ? '#ffffff' : palette[0], isLight: !light };
}

/** "16:00" becomes "4:00 pm". Times are entered in the CMS as 24 hour HH:MM. */
export function clock(value?: string): string {
  const m = value?.trim().match(/^(\d{1,2})[:.](\d{2})/);
  if (!m) return value ?? '';
  const h = Number(m[1]);
  return `${((h + 11) % 12) + 1}:${m[2]} ${h >= 12 ? 'pm' : 'am'}`;
}

export function timeRange(start?: string, end?: string): string {
  if (!start) return '';
  return `${clock(start)}${end ? ` to ${clock(end)}` : ''} IST`;
}
