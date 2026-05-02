import path from 'path';

/**
 * In Vercel serverless bundles, filesystem assets under `data/` must be bundled
 * (see vercel.json `includeFiles`). `cwd` is typically `/var/task` with repo layout.
 */
export function dataRoot() {
  return path.join(process.cwd(), 'data');
}
