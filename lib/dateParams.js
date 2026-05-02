/**
 * Query strings often omit leading zeros (`2026-5` vs `2026-05`). Normalise so filtering matches Diyanet-derived `YYYY-MM-DD` keys.
 */
export function normalizeYearMonth(value) {
  if (!value || typeof value !== 'string') return '';
  const t = value.trim().replace(/\s+/g, '');
  const m = t.match(/^(\d{4})-(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}`;
  return t;
}

export function normalizeYmd(value) {
  if (!value || typeof value !== 'string') return '';
  const t = value.trim().replace(/\s+/g, '');
  const m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  return t;
}
