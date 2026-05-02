import fs from 'fs';
import path from 'path';
import { getQuery } from '../lib/query.js';
import { dataRoot } from '../lib/paths.js';

/**
 * GET /api/prayer?country=al&city=tirana
 * GET /api/prayer?country=al&city=tirana&date=2026-04-25
 *
 * Returns prayer times for a specific city and date.
 * Reads from cached JSON files — ZERO calls to Diyanet.
 */
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }

  const { country, city, date } = getQuery(req);

  if (!country || !city) {
    return res.status(400).json({
      error: 'Missing params',
      example: '/api/prayer?country=al&city=tirana',
      countries: ['al', 'xk', 'mk', 'me', 'ba']
    });
  }

  const file = path.join(dataRoot(), country, `${city}.json`);

  if (!fs.existsSync(file)) {
    return res.status(404).json({
      error: `City not found: ${country}/${city}`,
      hint: `Try /api/cities?country=${country}`
    });
  }

  const cityData = JSON.parse(fs.readFileSync(file, 'utf8'));
  const target   = date || today();

  // Data format from Diyanet: { date: "2026-01-01", fajr: "05:27", ... }
  const day = cityData.data.find(d => d.date === target);

  if (!day) {
    return res.status(404).json({
      error: `No data for ${target}`,
      coverage: `${cityData.data[0]?.date} → ${cityData.data[cityData.data.length - 1]?.date}`
    });
  }

  return res.status(200).json({
    country,
    city,
    date: target,
    times: {
      fajr:    day.fajr,
      sunrise: day.sunrise,
      dhuhr:   day.dhuhr,
      asr:     day.asr,
      maghrib: day.maghrib,
      isha:    day.isha,
    },
    fetchedAt: cityData._meta?.fetchedAt
  });
}

function today() {
  return new Date().toISOString().split('T')[0]; // "2026-05-02"
}
