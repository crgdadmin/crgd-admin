// Parses the front matter of every content file and reports YAML errors.
// Run with: node scripts/check-frontmatter.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const root = new URL('../src/content/', import.meta.url).pathname;
let bad = 0;
let count = 0;
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith('.md')) {
      count++;
      const text = readFileSync(path, 'utf8');
      const match = text.match(/^---\n([\s\S]*?)\n---/);
      if (!match) { console.log(`No front matter: ${path}`); bad++; continue; }
      try { parse(match[1]); } catch (error) { bad++; console.log(`${path}\n  ${error.message.split('\n')[0]}`); }
    }
  }
};
walk(root);
console.log(`${count} files checked, ${bad} with problems.`);
process.exit(bad ? 1 : 0);
