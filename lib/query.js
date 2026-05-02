/**
 * Vercel's Node helper does not always set `req.query`; parse from the URL instead.
 */
export function getQuery(req) {
  const pathname = req.url ?? '/';
  const { searchParams } = new URL(pathname, 'http://localhost');
  const out = {};
  for (const [k, v] of searchParams) out[k] = v;
  return out;
}
