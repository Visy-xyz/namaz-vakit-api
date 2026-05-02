import fs from 'fs';
import path from 'path';
import { getQuery } from '../lib/query.js';
import { dataRoot } from '../lib/paths.js';

/**
 * GET /api/monthly?country=al&city=tirana
 * GET /api/monthly?country=al&city=tirana&month=2026-04
 *
 * Returns all prayer times for a full month.
 * Flutter uses this to cache the whole month locally.
 */
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }

  const { country, city, month } = getQuery(req);

  if (!country || !city) {
    return res.status(400).json({
      error: 'Missing params',
      example: '/api/monthly?country=al&city=tirana&month=2026-05'
    });
  }

  const file = path.join(dataRoot(), country, `${city}.json`);

  if (!fs.existsSync(file)) {
    return res.status(404).json({ error: `City not found: ${country}/${city}` });
  }

  const cityData    = JSON.parse(fs.readFileSync(file, 'utf8'));
  const targetMonth = month || currentMonth(); // "2026-05"

  // Filter days for this month — data.date format: "2026-01-25"
  const days = cityData.data.filter(d => d.date?.startsWith(targetMonth));

  if (days.length === 0) {
    return res.status(404).json({
      error: `No data for month ${targetMonth}`,
      coverage: `${cityData.data[0]?.date} → ${cityData.data[cityData.data.length - 1]?.date}`
    });
  }

  return res.status(200).json({
    country,
    city,
    month:     targetMonth,
    days:      days.length,
    data:      days.map(d => ({
      date:    d.date,
      times: {
        fajr:    d.fajr,
        sunrise: d.sunrise,
        dhuhr:   d.dhuhr,
        asr:     d.asr,
        maghrib: d.maghrib,
        isha:    d.isha,
      }
    })),
    fetchedAt: cityData._meta?.fetchedAt
  });
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
