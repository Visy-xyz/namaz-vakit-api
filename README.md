<div align="center">

# Namaz Vakit API

**Prayer times over HTTPS** — pre-computed Diyanet-style data, served as JSON.  
No live calls to Diyanet on each request.

[![Production](https://img.shields.io/badge/API-namaz.frmsh.al-0366d6?style=flat-square)](https://namaz.frmsh.al/api/cities)

</div>

---

## Table of contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Quick reference](#quick-reference)
- [How to use the API](#how-to-use-the-api)
  - [List countries and cities](#1-list-countries-and-cities)
  - [Prayer times for one day](#2-prayer-times-for-one-day)
  - [Prayer times for a full month](#3-prayer-times-for-a-full-month)
- [HTTP behaviour](#http-behaviour)
- [Operators](#operators)
- [Local development](#local-development)

---

## Overview

| | |
|---|---|
| **What it does** | Returns Islamic prayer times (`fajr`, `sunrise`, `dhuhr`, `asr`, `maghrib`, `isha`) for cities stored under `data/{country}/{city}.json`. |
| **Coverage** | Many countries (Europe, United States, Canada, Western Balkans, and more). The live list is always from **`GET /api/cities`**. |
| **Format** | JSON only. Optional `detail` field contains the full Diyanet-shaped row for that day. |

---

## Base URL

| Environment | URL |
|---------------|-----|
| **Production** | `https://namaz.frmsh.al` |
| **Local** | `http://localhost:3000` (with `npx vercel dev`) |

All paths below are relative to the base (e.g. production: `https://namaz.frmsh.al/api/cities`).

---

## Quick reference

| Goal | Method | Path |
|------|--------|------|
| Catalogue (all or one country) | `GET` | `/api/cities` or `/api/cities?country={code}` |
| Single day | `GET` | `/api/prayer?country={code}&city={slug}` |
| Whole month | `GET` | `/api/monthly?country={code}&city={slug}&month={YYYY-MM}` |

**Country codes** are lowercase folder names (`al`, `us`, `ca`, `de`, …).  
**City slugs** match filenames: `data/{country}/{slug}.json` without `.json` (e.g. `tirana`, `new_york`).

---

## How to use the API

### 1. List countries and cities

Use the catalogue to discover valid `country` and `city` values before calling prayer endpoints.

#### `GET /api/cities`

Returns a **JSON object** keyed by **country code**. Each value has:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | English country name |
| `nameAl` | string | Albanian label where defined; otherwise aligned with `name` |
| `flag` | string | Unicode regional indicator |
| `cities` | array | `{ slug, displayName, endpoint }` for each city |

**Recommended:** restrict by country so the payload stays smaller:

#### `GET /api/cities?country={code}`

Example:

```http
GET https://namaz.frmsh.al/api/cities?country=al
GET https://namaz.frmsh.al/api/cities?country=us
```

**Client flow:** parse JSON → read `cities[].slug` and `cities[].displayName` for pickers → call `/api/prayer` with the chosen `country` and `slug` as `city`.

**Verify files in Git:**  
`https://github.com/Visy-xyz/namaz-vakit-api/tree/main/data/{country}`

---

### 2. Prayer times for one day

#### `GET /api/prayer`

| Query | Required | Description |
|--------|----------|-------------|
| `country` | **Yes** | Country code (`al`, `us`, …). |
| `city` | **Yes** | City slug from the catalogue / filename. |
| `date` | No | Gregorian date `YYYY-MM-DD`. **Omit** to use the server’s **UTC calendar “today”**. |

**Examples:**

```http
GET https://namaz.frmsh.al/api/prayer?country=al&city=tirana
GET https://namaz.frmsh.al/api/prayer?country=us&city=seattle&date=2026-05-15
```

**Successful response (200)** — main fields:

| Field | Description |
|-------|-------------|
| `country`, `city`, `date` | Echo and resolved date |
| `cityDisplayName` | Human-readable city name |
| `times` | Object: `fajr`, `sunrise`, `dhuhr`, `asr`, `maghrib`, `isha` (string times) |
| `detail` | Full source row (hijri, moon URL, astronomical times, etc.) |
| `fileMeta` | `_meta` from the city file (`year`, `totalDays`, `fetchedAt`, …) |
| `fetchedAt` | Convenience copy of `fileMeta.fetchedAt` |

**Errors**

| Status | Meaning |
|--------|---------|
| `400` | Missing `country` or `city`. |
| `404` | Unknown city, or no row for the requested `date` inside the file’s coverage. |

**Important for apps:** for “today” in the **user’s time zone**, compute `date` on the device and pass it explicitly; do not rely on the server’s UTC-only default if you need local midnight.

---

### 3. Prayer times for a full month

#### `GET /api/monthly`

| Query | Required | Description |
|--------|----------|-------------|
| `country` | **Yes** | Country code. |
| `city` | **Yes** | City slug. |
| `month` | No | `YYYY-MM`. **Omit** for the server’s **current UTC month**. |

**Examples:**

```http
GET https://namaz.frmsh.al/api/monthly?country=al&city=tirana&month=2026-05
GET https://namaz.frmsh.al/api/monthly?country=ca&city=vancouver&month=2026-12
```

Unpadded months are normalised (`2026-5` → `2026-05`).

**Successful response (200)** — main fields:

| Field | Description |
|-------|-------------|
| `month` | Normalised `YYYY-MM` |
| `days` | Number of day rows returned |
| `cityDisplayName` | Human-readable city name |
| `data` | Array of `{ date, times, detail }` (same meaning as in `/api/prayer`) |
| `fileMeta`, `fetchedAt` | As in `/api/prayer` |

**Errors**

| Status | Meaning |
|--------|---------|
| `400` | Missing required query parameters. |
| `404` | No rows for that month in the dataset. |
| `500` | City file missing or invalid shape (empty `data` array). |

---

## HTTP behaviour

| Topic | Detail |
|--------|--------|
| **Methods** | `GET` for all JSON routes; `OPTIONS` supported for CORS preflight. |
| **CORS** | `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET, OPTIONS` on `/api/*`. `OPTIONS` → **204** empty body. |
| **Caching** | `Cache-Control: public, max-age=300` on `/api/cities`; `max-age=3600` on `/api/prayer` and `/api/monthly`. |
| **Security** | No API key. Read-only public data. Do **not** embed Diyanet credentials in clients; they are only used in **GitHub Actions** for yearly refresh. |

---

## Operators

| Topic | Detail |
|--------|--------|
| **Vercel** | Set **`DATA_BASE_URL`** to a public HTTPS base that mirrors this repo’s `data/` tree (no trailing slash), e.g. `https://raw.githubusercontent.com/Visy-xyz/namaz-vakit-api/main/data`. Redeploy after env changes. |
| **Catalogue** | Run `npm run build:catalog` and commit `generated/prayer-catalog.json` when `data/` or labels change. |
| **Yearly data** | Workflow [`.github/workflows/yearly-refresh.yml`](.github/workflows/yearly-refresh.yml): **1 January 02:00 UTC** and manual **Run workflow**. Uses `DIYANET_EMAIL` / `DIYANET_PASS` **Actions secrets**. If `countries-all.json` or `countries.json` exists, runs `scripts/fetch-europe.mjs`; otherwise `scripts/fetch-yearly.mjs`. Then rebuilds the catalogue and commits. |

---

## Local development

Requires **Node.js 18+** and the [Vercel CLI](https://vercel.com/docs/cli).

```bash
npm run build:catalog   # if generated/prayer-catalog.json is missing
npx vercel dev
```

With **`data/`** on disk and **`DATA_BASE_URL` unset**, `/api/prayer` and `/api/monthly` read from the local filesystem.

---

<div align="center">

<sub>Repository: [Visy-xyz/namaz-vakit-api](https://github.com/Visy-xyz/namaz-vakit-api)</sub>

</div>
