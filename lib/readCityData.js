import fs from 'fs';
import path from 'path';
import { dataRoot } from './paths.js';

const base = () => (process.env.DATA_BASE_URL || '').replace(/\/$/, '');

/**
 * @param {string} country
 * @param {string} city slug
 * @returns {Promise<object|null>} parsed city JSON or null if not found
 */
export async function readCityJson(country, city) {
  const cc = String(country).toLowerCase();
  const slug = String(city);
  const b = base();

  if (b) {
    const url = `${b}/${encodeURIComponent(cc)}/${encodeURIComponent(slug)}.json`;
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.status === 404) return null;
      if (!res.ok) {
        console.error('readCityJson fetch failed', url, res.status);
        return null;
      }
      return await res.json();
    } catch (e) {
      console.error('readCityJson', url, e);
      return null;
    }
  }

  const file = path.join(dataRoot(), cc, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** Only nudges on Vercel when env is missing (local dev without DATA_BASE_URL is normal). */
export function dataBaseUrlHint() {
  if (base()) return null;
  if (process.env.VERCEL !== '1') return null;
  return 'Set DATA_BASE_URL to a public base URL that mirrors the repo `data/` tree (same country/city.json paths), e.g. https://raw.githubusercontent.com/ORG/REPO/main/data';
}
