import { getQuery } from '../lib/query.js';
import { dayDateKey, coverageRange } from '../lib/dayDate.js';
import { normalizeYmd } from '../lib/dateParams.js';
import { displayCityName } from '../lib/cityNormalizations.js';
import { readCityJson, dataBaseUrlHint } from '../lib/readCityData.js';
import { validateLocation, validateDate } from '../lib/validate.js';

/**
 * GET /api/prayer?country=al&city=tirana
 * GET /api/prayer?country=al&city=tirana&date=2026-04-25
 *
 * Returns prayer times for a specific city and date.
 * `times` is a short subset; `detail` is the full Diyanet row from the JSON file.
 * `fileMeta` is the file’s `_meta` object (country, year, totalDays, fetchedAt, …).
 * Reads from cached JSON — ZERO calls to Diyanet. On Vercel, JSON is loaded from DATA_BASE_URL.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }

  const { country, city, date } = getQuery(req);

  const locationErr = validateLocation(country, city);
  if (locationErr) return res.status(400).json({ error: locationErr, example: '/api/prayer?country=al&city=tirana' });

  const dateErr = validateDate(date);
  if (dateErr) return res.status(400).json({ error: dateErr });

  const cityData = await readCityJson(country, city);

  if (!cityData) {
    const hint = dataBaseUrlHint();
    return res.status(404).json({
      error: `City not found: ${country}/${city}`,
      hint: `Try /api/cities?country=${country}`,
      ...(hint ? { setup: hint } : {}),
    });
  }

  const rows = Array.isArray(cityData.data) ? cityData.data : [];
  const target = normalizeYmd(date || today());

  let day = rows.find(d => dayDateKey(d) === target);
  let approximate = false;

  if (!day) {
    const fallback = prevYearDate(target);
    const fallbackDay = fallback ? rows.find(d => dayDateKey(d) === fallback) : null;
    if (fallbackDay) {
      day = fallbackDay;
      approximate = true;
    } else {
      return res.status(404).json({
        error: `No data for ${target}`,
        coverage: coverageRange(rows),
      });
    }
  }

  return res.status(200).json({
    country,
    city,
    cityDisplayName: displayCityName(country, city),
    date: target,
    ...(approximate ? { approximate: true, approximateNote: 'Current year not yet available — using previous year times as estimate' } : {}),
    times: {
      fajr: day.fajr,
      sunrise: day.sunrise,
      dhuhr: day.dhuhr,
      asr: day.asr,
      maghrib: day.maghrib,
      isha: day.isha,
    },
    detail: day,
    fileMeta: cityData._meta ?? null,
    fetchedAt: cityData._meta?.fetchedAt,
  });
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function prevYearDate(ymd) {
  const m = ymd.match(/^(\d{4})-(\d{2}-\d{2})$/);
  if (!m) return null;
  return `${parseInt(m[1], 10) - 1}-${m[2]}`;
}
