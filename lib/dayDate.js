/**
 * Rows from Diyanet cache use gregorian ISO fields; some older files may use `date` (YYYY-MM-DD).
 */
export function dayDateKey(day) {
  if (!day || typeof day !== 'object') return null;

  const raw = typeof day.date === 'string' ? day.date.trim() : '';
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);

  const longIso = day.gregorianDateLongIso8601;
  if (typeof longIso === 'string') {
    const m = longIso.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }

  const ddmmyyyy = (short) => {
    if (typeof short !== 'string' || !/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(short)) return null;
    const [dd, mm, yyyy] = short.split('.');
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  };

  const fromShortIso = ddmmyyyy(day.gregorianDateShortIso8601);
  if (fromShortIso) return fromShortIso;

  const fromShort = ddmmyyyy(day.gregorianDateShort);
  if (fromShort) return fromShort;

  return null;
}

export function coverageRange(days) {
  if (!days?.length) return 'unknown';
  const a = dayDateKey(days[0]);
  const b = dayDateKey(days[days.length - 1]);
  if (a && b) return `${a} → ${b}`;
  return 'unknown';
}
