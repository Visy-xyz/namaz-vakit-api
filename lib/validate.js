const COUNTRY_RE = /^[a-z]{2}$/;
const CITY_RE = /^[a-z0-9_]{1,60}$/;
const DATE_RE = /^\d{4}-\d{1,2}-\d{1,2}$/;
const MONTH_RE = /^\d{4}-\d{1,2}$/;

export function validateLocation(country, city) {
  if (!country || !COUNTRY_RE.test(String(country).toLowerCase())) {
    return 'Invalid country code — must be 2 letters (e.g. al, de, us)';
  }
  if (!city || !CITY_RE.test(String(city).toLowerCase())) {
    return 'Invalid city slug — letters, numbers and underscores only (e.g. tirana, new_york)';
  }
  return null;
}

export function validateDate(date) {
  if (date && !DATE_RE.test(String(date))) {
    return 'Invalid date — use YYYY-MM-DD (e.g. 2026-05-13)';
  }
  return null;
}

export function validateMonth(month) {
  if (month && !MONTH_RE.test(String(month))) {
    return 'Invalid month — use YYYY-MM (e.g. 2026-05)';
  }
  return null;
}
