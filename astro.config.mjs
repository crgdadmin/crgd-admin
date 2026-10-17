import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';
import { satteri } from '@astrojs/markdown-satteri';

// The live address of the website. The deploy workflow passes SITE_URL and
// BASE_PATH from GitHub Pages, so a project address such as
// https://irijournal.github.io/Website-for-Amal and a custom domain both work
// without code changes. For local builds the domain in settings.json is used.
const settings = JSON.parse(readFileSync(new URL('./src/data/settings.json', import.meta.url), 'utf8'));
const site = process.env.SITE_URL || settings.siteUrl || 'https://example.org';
const base = process.env.BASE_PATH || '/';

/**
 * Rich text written in the CMS stores links and images as /uploads/... or
 * /about. This plugin prefixes the base path when the site is served from a
 * sub folder, opens external links in a new tab, lazy loads images, and lets
 * wide tables scroll on small screens.
 */
const prefix = base.replace(/\/$/, '');
const withSlash = (value) => {
  const [, pathname, rest] = value.match(/^([^?#]*)(.*)$/) ?? ['', value, ''];
  const last = pathname.split('/').pop() ?? '';
  return pathname.endsWith('/') || last.includes('.') ? value : `${pathname}/${rest}`;
};
const withBase = (value) => {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return value;
  const path = withSlash(value);
  return prefix && !path.startsWith(`${prefix}/`) ? `${prefix}${path}` : path;
};

/**
 * Page text can say {{email}}, {{phone}} and so on; the value from Site
 * settings is filled in at build time, so contact details live in one place.
 */
const tokens = {
  email: settings.email,
  submissionsEmail: settings.submissionsEmail,
  careersEmail: settings.careersEmail,
  mediaEmail: settings.mediaEmail,
  phone: settings.phone,
  address: settings.address,
  shortName: settings.shortName,
  fullName: settings.fullName,
  tagline: settings.tagline,
};
const fillTokens = (value) =>
  typeof value === 'string'
    ? value.replace(/(?:\{\{|%7B%7B)\s*(\w+)\s*(?:\}\}|%7D%7D)/gi, (match, key) => (tokens[key] ?? match))
    : value;

const siteLinks = {
  name: 'crgd-site-links',
  text(node, ctx) {
    if (node.value.includes('{{')) ctx.replaceNode(node, { type: 'text', value: fillTokens(node.value) });
  },
  element: [
    {
      filter: ['img'],
      visit(node, ctx) {
        ctx.setProperty(node, 'src', withBase(node.properties?.src));
        ctx.setProperty(node, 'loading', 'lazy');
        ctx.setProperty(node, 'decoding', 'async');
      },
    },
    {
      filter: ['a'],
      visit(node, ctx) {
        const href = fillTokens(node.properties?.href);
        if (typeof href !== 'string') return;
        ctx.setProperty(node, 'href', href);
        if (/^https?:\/\//.test(href)) {
          ctx.setProperty(node, 'target', '_blank');
          ctx.setProperty(node, 'rel', ['noopener', 'noreferrer']);
        } else {
          ctx.setProperty(node, 'href', withBase(href));
        }
      },
    },
    {
      filter: ['table'],
      visit(node, ctx) {
        ctx.wrapNode(node, { type: 'element', tagName: 'div', properties: { className: ['table-scroll'] }, children: [] });
      },
    },
  ],
};

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  markdown: {
    processor: satteri({ hastPlugins: [siteLinks] }),
  },
});
