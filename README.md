<div align="center">

# Namaz Vakit API

Reliable prayer-time data API for websites, mobile apps, and community tools.

[![Production](https://img.shields.io/badge/API-namaz.frmsh.al-0366d6?style=flat-square)](https://namaz.frmsh.al/api/cities)

</div>

---

## Purpose

This project provides a fast, public JSON API for:

- listing supported countries and cities
- returning daily prayer times for a selected location
- returning monthly prayer times for calendar views

It also includes a simple bilingual landing page at `https://namaz.frmsh.al/`.

---

## Base URL

- Production: `https://namaz.frmsh.al`
- Local (Vercel dev): `http://localhost:3000`

---

## API Endpoints

### `GET /api/cities`

Returns supported locations.

- all countries: `/api/cities`
- single country: `/api/cities?country=al`

### `GET /api/prayer`

Returns prayer times for one day.

- required: `country`, `city`
- optional: `date=YYYY-MM-DD`

Example:

```http
GET https://namaz.frmsh.al/api/prayer?country=al&city=tirana
GET https://namaz.frmsh.al/api/prayer?country=us&city=new_york&date=2026-05-04
```

### `GET /api/monthly`

Returns prayer times for a month.

- required: `country`, `city`
- optional: `month=YYYY-MM`

Example:

```http
GET https://namaz.frmsh.al/api/monthly?country=al&city=tirana&month=2026-05
```

---

## Response Shape (short)

- `times`: `fajr`, `sunrise`, `dhuhr`, `asr`, `maghrib`, `isha`
- `detail`: extended metadata for the day
- `fileMeta` / `fetchedAt`: dataset metadata

---

## Local Development

Requirements:

- Node.js 18+
- Vercel CLI

Run:

```bash
npm run build:catalog
npx vercel dev
```

---

## Deployment Notes

- Vercel serves the API routes under `/api/*`.
- `DATA_BASE_URL` can point to a remote data mirror.
- `generated/prayer-catalog.json` should be rebuilt when location data changes.

---

## Repository

[Visy-xyz/namaz-vakit-api](https://github.com/Visy-xyz/namaz-vakit-api)
