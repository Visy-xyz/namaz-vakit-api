# Namaz Vakit API

Public HTTP API for Islamic prayer times. Responses are built from pre-generated JSON (Diyanet-shaped fields). The service does not call Diyanet at request time.

**Production base URL:** `https://namaz.frmsh.al`

---

## Finding countries and cities

**1. List everything**

`GET /api/cities`

Returns a JSON object whose **top-level keys are country codes** (lowercase, ISO-style: `al`, `us`, `ca`, `de`, …). Each entry describes one country and lists its cities.

**2. List one country only (recommended for clients)**

`GET /api/cities?country={code}`

Example: `GET /api/cities?country=us`

Use this when you only need cities for a single country; the full catalogue response can be large.

**3. Read the response shape**

For each country object:

| Field | Meaning |
|-------|---------|
| `name` | English country name |
| `nameAl` | Albanian label where defined; otherwise aligned with `name` |
| `flag` | Unicode regional indicator sequence |
| `cities` | Array of `{ slug, displayName, endpoint }` |

- **`slug`** is the value you pass as `city` to `/api/prayer` and `/api/monthly`.
- **`displayName`** is the human-readable city label for UI.
- **`endpoint`** is a suggested relative URL for one-day prayer data (same as `GET /api/prayer?country=…&city=…`).

**4. Slug rules**

City slugs match repository filenames: `data/{country}/{slug}.json` with the `.json` suffix removed. Multi-word names use underscores (e.g. `new_york`, `salt_lake_city`).

**5. Source of truth in Git**

If you need to confirm a file exists without calling the API, browse:

`https://github.com/Visy-xyz/namaz-vakit-api/tree/main/data/{country}`

---

## Endpoints

All routes accept **GET** only (with **OPTIONS** for CORS). All successful responses are **JSON**.

### Catalogue

| | |
|---|---|
| **URL** | `/api/cities` |
| **Query** | `country` (optional): restrict to one country code. |
| **200 body** | Map of country code → `{ name, nameAl, flag, cities[] }` as above. |
| **Caching** | `Cache-Control: public, max-age=300` |

### Single day

| | |
|---|---|
| **URL** | `/api/prayer` |
| **Query** | `country` (required), `city` (required), `date` (optional, `YYYY-MM-DD`). |
| **200 body** | `country`, `city`, `cityDisplayName`, `date`, `times` (`fajr`, `sunrise`, `dhuhr`, `asr`, `maghrib`, `isha`), `detail` (full source row), `fileMeta`, `fetchedAt`. |
| **Errors** | `400` if `country` or `city` is missing; `404` if the city file is missing or the date is outside coverage. |
| **Caching** | `Cache-Control: public, max-age=3600` |

If `date` is omitted, the server uses **UTC calendar “today”**. For user-local “today”, the client should compute the date in the user’s time zone and send it explicitly.

### Full month

| | |
|---|---|
| **URL** | `/api/monthly` |
| **Query** | `country` (required), `city` (required), `month` (optional, `YYYY-MM`). |
| **200 body** | `month`, `days`, `cityDisplayName`, `fileMeta`, `data` (array of `{ date, times, detail }`), `fetchedAt`. |
| **Errors** | `400` if required query params are missing; `404` if there is no data for that month; `500` if the city file is invalid. |
| **Caching** | `Cache-Control: public, max-age=3600` |

Unpadded months in `month` are normalised (e.g. `2026-5` becomes `2026-05`). If `month` is omitted, the server uses the **current UTC calendar month**.

---

## Example requests

```http
GET https://namaz.frmsh.al/api/cities
GET https://namaz.frmsh.al/api/cities?country=us
GET https://namaz.frmsh.al/api/prayer?country=al&city=tirana
GET https://namaz.frmsh.al/api/prayer?country=us&city=seattle&date=2026-05-03
GET https://namaz.frmsh.al/api/monthly?country=ca&city=vancouver&month=2026-05
```

---

## CORS and methods

For `/api/*`, responses include `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Methods: GET, OPTIONS`. Preflight `OPTIONS` requests return **204** with an empty body.

---

## Client integration (general)

- Use **HTTPS** against the production host above.
- Treat **non-200** responses as errors; response bodies are JSON when applicable.
- Apply **reasonable timeouts**; `/api/cities` without `country` can be slow to transfer on poor networks.
- **No API key** is required for these read-only endpoints. Do not embed Diyanet or other credentials in mobile or web clients for this API.

---

## Operators (Vercel and repository)

Production functions load per-city JSON from **`DATA_BASE_URL`** (public HTTPS base whose path layout mirrors `data/` in this repository, no trailing slash). Example: `https://raw.githubusercontent.com/Visy-xyz/namaz-vakit-api/main/data`. Set this in the Vercel project environment and redeploy after changes.

The city catalogue file `generated/prayer-catalog.json` is generated with `npm run build:catalog` and should be committed when `data/` or labels change. GitHub Actions (`.github/workflows/yearly-refresh.yml`) refresh data and rebuild that catalogue.

Repository secrets for Diyanet belong in **GitHub Actions secrets** only; do not commit `.env.local` or similar files.

---

## Local development

Requires Node.js 18+ and the [Vercel CLI](https://vercel.com/docs/cli). Run `npm run build:catalog` if `generated/prayer-catalog.json` is missing, then `npx vercel dev`. With local `data/` present and `DATA_BASE_URL` unset, prayer and monthly routes read from the filesystem.
