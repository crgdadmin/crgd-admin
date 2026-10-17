// Checks that every internal link and image in the built site points at a real file.
// Run after a build with: npm run check-links
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) files.push(p);
  }
};
walk(dist);

const exists = (path) => {
  let clean = decodeURIComponent(path.split('#')[0].split('?')[0]);
  if (base && clean.startsWith(base)) clean = clean.slice(base.length) || '/';
  const target = join(dist, clean);
  if (extname(clean)) return existsSync(target);
  return existsSync(join(target, 'index.html')) || existsSync(`${target}.html`);
};

let broken = 0;
const seen = new Map();
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  for (const [, attr, value] of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    if (!value.startsWith('/') || value.startsWith('//')) continue;
    if (!exists(value)) {
      broken++;
      const list = seen.get(value) ?? [];
      list.push(file.replace(dist, '/'));
      seen.set(value, list);
    }
  }
}
for (const [link, pages] of seen) console.log(`${link}\n  on ${pages.slice(0, 3).join(', ')}${pages.length > 3 ? ` and ${pages.length - 3} more` : ''}`);
console.log(`${files.length} pages checked, ${broken} broken internal links.`);
process.exit(broken ? 1 : 0);
