import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/*
 * Every collection here has a matching entry in .pages.yml, which is what the
 * CMS edits. The CMS can save an empty field as null, as an empty string, or
 * leave it out altogether, so the helpers below treat all three the same way.
 */

const blank = (value: unknown) => (value === null || value === '' ? undefined : value);
// A year or a number typed into a text field (for example "2026") is still text.
const asText = (value: unknown) => (typeof value === 'number' ? String(value) : blank(value));

const text = () => z.preprocess(asText, z.string().optional());
const date = () => z.preprocess(blank, z.coerce.date().optional());
const flag = (fallback = false) => z.preprocess(blank, z.boolean().default(fallback));
const order = () => z.preprocess(blank, z.coerce.number().default(50));
const list = () =>
  z.preprocess(
    (value) => (Array.isArray(value) ? value.filter((item) => item !== null && item !== '').map(String) : []),
    z.array(z.string()),
  );

/** Fields shared by almost every entry: a picture, a summary and housekeeping flags. */
const common = {
  summary: text(),
  image: text(),
  imageAlt: text(),
  imageCaption: text(),
  featured: flag(),
  placeholder: flag(),
  order: order(),
};

const load = (folder: string) => glob({ pattern: '**/*.md', base: `./src/content/${folder}` });

const pages = defineCollection({
  loader: load('pages'),
  schema: z.object({
    title: z.string(),
    navLabel: text(),
    section: z.preprocess(blank, z.string().default('About')),
    eyebrow: text(),
    updated: date(),
    showContactForm: flag(),
    showSubscribeForm: flag(),
    showMap: flag(),
    showDonationDetails: flag(),
    person: text(),
    hideSidebar: flag(),
    ...common,
  }),
});

const people = defineCollection({
  loader: load('people'),
  schema: z.object({
    name: z.string(),
    role: text(),
    groups: list(),
    affiliation: text(),
    centres: list(),
    expertise: list(),
    photo: text(),
    photoAlt: text(),
    shortBio: text(),
    email: text(),
    linkedin: text(),
    x: text(),
    website: text(),
    scholar: text(),
    orcid: text(),
    featured: flag(),
    placeholder: flag(),
    order: order(),
  }),
});

const centres = defineCollection({
  loader: load('centres'),
  schema: z.object({
    title: z.string(),
    shortTitle: text(),
    focusAreas: list(),
    keyQuestions: list(),
    leads: list(),
    ...common,
  }),
});

const publications = defineCollection({
  loader: load('publications'),
  schema: z.object({
    title: z.string(),
    type: z.string(),
    date: z.coerce.date(),
    updated: date(),
    authors: list(),
    centres: list(),
    tags: list(),
    pdf: text(),
    externalUrl: text(),
    originallyPublishedIn: text(),
    mediaUrl: text(),
    duration: text(),
    pages: text(),
    isbn: text(),
    publisher: text(),
    language: z.preprocess(blank, z.string().default('English')),
    ...common,
  }),
});

const events = defineCollection({
  loader: load('events'),
  schema: z.object({
    title: z.string(),
    type: z.preprocess(blank, z.string().default('Lecture')),
    startDate: z.coerce.date(),
    endDate: date(),
    startTime: text(),
    endTime: text(),
    venue: text(),
    city: text(),
    mode: z.preprocess(blank, z.string().default('In person')),
    speakers: list(),
    moderators: list(),
    centres: list(),
    registrationUrl: text(),
    registrationNote: text(),
    recordingUrl: text(),
    reportPdf: text(),
    gallery: text(),
    ...common,
  }),
});

const programs = defineCollection({
  loader: load('programs'),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    status: z.preprocess(blank, z.string().default('Applications open')),
    deadline: date(),
    startDate: date(),
    duration: text(),
    commitment: text(),
    stipend: text(),
    location: text(),
    eligibility: list(),
    benefits: list(),
    applyUrl: text(),
    applyEmail: text(),
    centres: list(),
    ...common,
  }),
});

const learning = defineCollection({
  loader: load('learning'),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    status: z.preprocess(blank, z.string().default('Registrations open')),
    format: text(),
    startDate: date(),
    duration: text(),
    schedule: text(),
    fee: text(),
    level: text(),
    faculty: list(),
    partner: text(),
    partnerLogo: text(),
    partnerUrl: text(),
    registrationUrl: text(),
    outcomes: list(),
    centres: list(),
    ...common,
  }),
});

const impact = defineCollection({
  loader: load('impact'),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    status: text(),
    date: date(),
    period: text(),
    awardedBy: text(),
    partners: list(),
    outcomes: list(),
    centres: list(),
    people: list(),
    ...common,
  }),
});

const media = defineCollection({
  loader: load('media'),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    date: z.coerce.date(),
    outlet: text(),
    externalUrl: text(),
    people: list(),
    videoUrl: text(),
    pdf: text(),
    ...common,
  }),
});

const galleries = defineCollection({
  loader: load('galleries'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    location: text(),
    event: text(),
    photos: z.preprocess(
      (value) => (Array.isArray(value) ? value : []),
      z.array(
        z.object({
          image: text(),
          caption: text(),
          credit: text(),
        }),
      ),
    ),
    ...common,
  }),
});

const reports = defineCollection({
  loader: load('reports'),
  schema: z.object({
    title: z.string(),
    year: z.preprocess(asText, z.string()),
    date: z.coerce.date(),
    pdf: text(),
    highlights: list(),
    ...common,
  }),
});

const openings = defineCollection({
  loader: load('openings'),
  schema: z.object({
    title: z.string(),
    type: z.preprocess(blank, z.string().default('Full time')),
    status: z.preprocess(blank, z.string().default('Open')),
    location: text(),
    workMode: text(),
    deadline: date(),
    posted: date(),
    team: text(),
    responsibilities: list(),
    qualifications: list(),
    applyUrl: text(),
    applyEmail: text(),
    ...common,
  }),
});

const locations = defineCollection({
  loader: load('locations'),
  schema: z.object({
    name: z.string(),
    status: z.preprocess(blank, z.string().default('Planned')),
    address: text(),
    city: text(),
    phone: text(),
    email: text(),
    hours: text(),
    mapLink: text(),
    mapEmbedUrl: text(),
    ...common,
  }),
});

const updates = defineCollection({
  loader: load('updates'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    link: text(),
    linkLabel: text(),
    pinned: flag(),
    ticker: flag(true),
    ...common,
  }),
});

export const collections = {
  pages,
  people,
  centres,
  publications,
  events,
  programs,
  learning,
  impact,
  media,
  galleries,
  reports,
  openings,
  locations,
  updates,
};
