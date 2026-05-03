#!/usr/bin/env node
/**
 * Builds generated/prayer-catalog.json from local data/ + city labels.
 * Commit this file so /api/cities works on Vercel without bundling all city JSON.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const OUT_DIR = path.join(ROOT, 'generated');
const OUT_FILE = path.join(OUT_DIR, 'prayer-catalog.json');
const NORMS = path.join(DATA, 'city-normalizations.json');

function titleFromSlug(slug) {
  return slug
    .split('_')
    .map(w => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ');
}

function main() {
  if (!fs.existsSync(DATA)) {
    console.error('Missing data/ — nothing to build.');
    process.exit(1);
  }

  let byCountryNorms = {};
  if (fs.existsSync(NORMS)) {
    const raw = JSON.parse(fs.readFileSync(NORMS, 'utf8'));
    byCountryNorms = raw.byCountry && typeof raw.byCountry === 'object' ? raw.byCountry : {};
  }

  const cities = {};
  const labels = {};

  for (const dirName of fs.readdirSync(DATA)) {
    if (dirName.startsWith('.')) continue;
    const full = path.join(DATA, dirName);
    if (!fs.statSync(full).isDirectory()) continue;

    const code = dirName.toLowerCase();
    const slugs = fs
      .readdirSync(full)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace(/\.json$/i, ''))
      .sort();

    cities[code] = slugs;
    const normMap = byCountryNorms[code] || {};
    labels[code] = {};
    for (const slug of slugs) {
      const n = normMap[slug];
      labels[code][slug] = typeof n === 'string' && n.length ? n : titleFromSlug(slug);
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify({ labels, cities }));
  console.log(
    'Wrote',
    OUT_FILE,
    'countries=',
    Object.keys(cities).length,
    'cities=',
    Object.values(cities).reduce((a, b) => a + b.length, 0)
  );
}

main();
