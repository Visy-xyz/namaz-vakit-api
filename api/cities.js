import fs from 'fs';
import path from 'path';
import { getQuery } from '../lib/query.js';
import { dataRoot } from '../lib/paths.js';

const DATA_DIR = dataRoot();

const COUNTRIES = {
  al: { name: 'Albania',         nameAl: 'Shqipëri',  flag: '🇦🇱' },
  xk: { name: 'Kosovo',          nameAl: 'Kosovë',    flag: '🇽🇰' },
  mk: { name: 'North Macedonia', nameAl: 'Maqedoni',  flag: '🇲🇰' },
  me: { name: 'Montenegro',      nameAl: 'Mali i Zi', flag: '🇲🇪' },
  ba: { name: 'Bosnia',          nameAl: 'Bosnjë',    flag: '🇧🇦' },
};

/**
 * GET /api/cities             → all countries + cities
 * GET /api/cities?country=al  → only Albania
 */
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }

  const { country } = getQuery(req);
  const result = {};

  for (const [code, info] of Object.entries(COUNTRIES)) {
    if (country && country !== code) continue;

    const dir = path.join(DATA_DIR, code);
    if (!fs.existsSync(dir)) continue;

    const cities = fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const slug = f.replace('.json', '');
        return {
          slug,
          endpoint: `/api/prayer?country=${code}&city=${slug}`
        };
      });

    result[code] = { ...info, cities };
  }

  return res.status(200).json(result);
}
