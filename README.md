# CRGD: The Public Policy Bridge

The complete website for the Centre for Research on Governance and Development (CRGD): The Public Policy Bridge, an independent, non-partisan research and advocacy institution in Thiruvananthapuram, Keralam. Front end, written content, placeholders for everything still to come, search, feeds, and a browser based CMS so the whole site can be edited without touching code.

**Live at https://crgdadmin.github.io/crgd-admin/**

Built with [Astro](https://astro.build), edited with [Pages CMS](https://pagescms.org), hosted free on GitHub Pages. It follows the same approach as the International Research Insights website, at roughly twice the size.

## Start here

| Document | What it covers |
| --- | --- |
| [`docs/LAUNCH-CHECKLIST.md`](docs/LAUNCH-CHECKLIST.md) | Everything that is still a placeholder and must be replaced before launch |
| [`docs/CMS-GUIDE.md`](docs/CMS-GUIDE.md) | Running the website day to day: logo, people, publications, events, images |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Putting the site live on GitHub Pages, connecting the CMS, the contact form and a domain |
| [`docs/SITEMAP.md`](docs/SITEMAP.md) | Every item of the brief and the page that delivers it |

## What is on the site

- **Home** with logo, tagline, vision and mission in the header, a Latest Updates strip, featured research, the eighteen research verticals, live figures, upcoming events, programs, commentary, impact, the founder's message, coverage, and the two calls to action from the brief: *Subscribe to email updates* and *Support CRGD: The Public Policy Bridge*.
- **About**: the story, vision, mission, founder's message, how we work, independence and funding, research standards, editorial policy, submissions, annual reports, location, careers, and people pages for the governing board, advisory board, scholars, mentors, team and patrons, each with individual profiles.
- **Research**: eighteen verticals, each with its own page, questions, people and publications.
- **Learning**: CRGD Academy, courses, dialogue, academic programs, collaborations and colloquium.
- **Programs**: fellowships, internships, the co-ordinator program and campus clubs.
- **Publications**: sixteen types from policy briefs to podcasts, with filters, search, citations, PDF downloads, audio and video players, and related reading.
- **Impact**: advocacy, ongoing, accomplished, awards and honours.
- **Events**: upcoming and past, worked out automatically from the date, with calendar files.
- **Media**: press releases, photographs with a lightbox, interviews, speeches, archives, CRGD in news and mentions.
- Contact, support, subscribe, FAQ, privacy, terms, disclaimer, republishing, accessibility and code of conduct pages.
- Site search, RSS feed, sitemap, robots file, social sharing images and structured data for search engines.

All 222 pages are generated from the content files. Every entry has an image field; until a picture is uploaded the site shows a placeholder drawn in the CRGD blues, and people show their initials.

## Placeholders

Content that is sample or unconfirmed carries a **Placeholder** tick box. While *Show placeholder labels* is on in Site settings, those entries show a small yellow label and a note at the top of the page. Replace the content, untick the box, and switch the labels off before launch.

## How it is put together

```
.pages.yml                   CMS configuration: every editable field
src/data/settings.json       Name, logo, contacts, social links, forms, fonts
src/data/home.json           Every section of the home page
src/data/navigation.json     The main menu and footer links
src/data/sections.json       Introductions and categories for each section
src/content/<collection>/    One Markdown file per page, person, publication, event and so on
src/components/              Header, mega menu, ticker, footer, cards, forms
src/layouts/Base.astro       HTML shell, metadata, fonts, structured data
src/pages/                   Routes built from the content
src/styles/global.css        The palette and all styling
scripts/                     Content and link checks run on every deploy
.github/workflows/deploy.yml Build on every save and nightly, publish to gh-pages
```

## Design

The ten blues of the CRGD palette, from Deep Navy `#0A1B2E` to Arctic Haze `#F2F6FB`, are defined once at the top of `src/styles/global.css`. The numbered rows of the palette card reappear as the research verticals list. Five font pairings can be chosen in Site settings; the default is Newsreader for headings with Inter for text, with Noto Sans Malayalam for any Malayalam text.

## Running it locally

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # writes dist/
npm run check-links  # after a build: checks every internal link
```

Node 22.22 or newer is required.
