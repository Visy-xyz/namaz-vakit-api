# Namaz Vakit API

REST API for Islamic prayer times in **Albania, Kosovo, North Macedonia, Montenegro, and Bosnia and Herzegovina**. Data is served from pre-generated JSON caches (Diyanet-shaped payload). Requests hit **no external prayer API at runtime**.

**Stack:** Node.js · ES modules · [Vercel](https://vercel.com/) serverless routes under `/api`.

---

## Base URL

| Environment | Example |
|-------------|---------|
| Production | `https://namaz-vakti-api.frmsh.al` |
| Local | `http://localhost:3000` (with `vercel dev`) |

---

## Quick start

```http
GET /api/cities
GET /api/prayer?country=al&city=tirana
GET /api/monthly?country=al&city=tirana&month=2026-05
```

---

## Supported regions (`country`)

| Code | Scope |
|------|--------|
| `al` | Albania |
| `xk` | Kosovo |
| `mk` | North Macedonia |
| `me` | Montenegro |
| `ba` | Bosnia and Herzegovina |

City slugs match filenames under `data/{country}/{city}.json` (e.g. `tirana`, `podgorice`, `sarajevo`). Use **`/api/cities`** to list valid slugs per country.

---

## Endpoints

### `GET /api/cities`

Lists countries and cities from the bundled `data/` tree.

**Query**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `country` | No | If set, only that country (`al`, `xk`, `mk`, `me`, `ba`). |

**Response** — keyed by country code; each entry includes labels (`name`, `nameAl`, `flag`) and a `cities` array with `{ slug, endpoint }`.

**Cache:** `Cache-Control: public, max-age=300` (5 minutes).

---

### `GET /api/prayer`

Single calendar day for one city.

**Query**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `country` | **Yes** | Country code (`al`, `xk`, …). |
| `city` | **Yes** | Slug matching `data/{country}/{city}.json`. |
| `date` | No | Gregorian date `YYYY-MM-DD`. Omit to use server **UTC calendar “today”** (see note below). |

**Response (200)**

| Field | Description |
|-------|--------------|
| `country`, `city`, `date` | Echo + resolved date. |
| `times` | `{ fajr, sunrise, dhuhr, asr, maghrib, isha }`. |
| `detail` | Full raw day object from the JSON file (hijri, moon icon URL, astronomical times, all Diyanet fields). |
| `fileMeta` | File header `_meta` (`year`, `totalDays`, `fetchedAt`, …). |
| `fetchedAt` | Duplicate of `_meta.fetchedAt` for convenience. |

**Errors:** `400` missing params · `404` unknown city or date outside coverage · always JSON body when applicable.

**Cache:** `max-age=3600` (1 hour).

**Date note:** Default “today” uses `toISOString().split('T')[0]` (UTC). For strict local-day UX, pass `date` from the client in the user’s timezone.

---

### `GET /api/monthly`

All days in a Gregorian month for one city.

**Query**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `country` | **Yes** | Country code. |
| `city` | **Yes** | City slug. |
| `month` | No | `YYYY-MM` (e.g. `2026-05`). **Unpadded months are normalised** (e.g. `2026-5` → `2026-05`). Omit = current **server** month (same caveats as prayer “today”). |

**Response (200)**

| Field | Description |
|-------|-------------|
| `month` | Normalised `YYYY-MM`. |
| `days` | Count of rows returned. |
| `fileMeta` | `_meta` for that city file. |
| `data` | Array of `{ date, times, detail }` — same meaning as `/api/prayer`. |
| `fetchedAt` | From `_meta`. |

**Errors:** `400` missing params · `404` no rows for that month · `500` invalid file shape (empty/missing `data` array).

**Cache:** `max-age=3600`.

---

## CORS

`Access-Control-Allow-Origin: *` and `GET, OPTIONS` are set for `/api/*` in `vercel.json`. Handlers answer `OPTIONS` with `204`.

---

## Example URLs

```text
https://namaz-vakti-api.frmsh.al/api/cities
https://namaz-vakti-api.frmsh.al/api/cities?country=al
https://namaz-vakti-api.frmsh.al/api/prayer?country=al&city=tirana
https://namaz-vakti-api.frmsh.al/api/prayer?country=me&city=podgorice&date=2026-05-02
https://namaz-vakti-api.frmsh.al/api/monthly?country=ba&city=sarajevo&month=2026-05
```

---

## Data layout

```text
data/
  al/   # Albania — *.json per city
  xk/   # Kosovo
  mk/   # North Macedonia
  me/   # Montenegro
  ba/   # Bosnia and Herzegovina
```

Each file has `_meta` and a `data` array of day objects (Diyanet-style: `gregorianDateLongIso8601`, `gregorianDateShort`, prayer fields, etc.). The API exposes a normalised `date` (`YYYY-MM-DD`) plus the full row in `detail`.

On Vercel, `vercel.json` bundles `data/**` into each `api/*.js` function via `includeFiles`.

---

## Local development

**Requirements:** Node.js **18+** and [Vercel CLI](https://vercel.com/docs/cli).

There are no npm runtime dependencies (`package.json` is metadata + `vercel dev` script only). Either install the CLI globally or use `npx`:

```bash
npx vercel dev
# or after: npm install -g vercel
vercel dev
```

Open the URLs printed by the CLI (typically port **3000**).

---

## Deploy (Vercel)

1. Connect the Git repo in the Vercel dashboard **or** `vercel` / `vercel --prod` from this directory.
2. Ensure `package.json` is valid JSON and the repo includes `api/*.js`, `lib/`, `data/`, `vercel.json`.
3. **Preview deployments:** if you see **401**, check **Project → Settings → Deployment Protection** — previews may require auth until disabled or bypassed.

---

## Project structure

```text
api/
  cities.js      # catalogue
  prayer.js      # single day
  monthly.js     # whole month
lib/
  query.js       # query string parsing (Vercel-safe)
  paths.js       # data root resolution
  dayDate.js     # map Diyanet gregorian fields → YYYY-MM-DD
  dateParams.js  # normalise YYYY-M / YYYY-M-D query params
data/            # bundled city JSON caches
package.json
vercel.json
```
