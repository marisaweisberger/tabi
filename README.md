# Tabi 旅

A shared trip command center for Japan, September–October 2026. Installable as a
phone app (PWA), works offline, and stays in sync between phones through the
site's own server storage.

Live at https://sparkly-lamington-19866c.netlify.app

## Tabs

- **Itinerary** — regions on a train-rail timeline, each day with a plan, notes,
  and transit legs. Everything is editable in place.
- **Stays** — hotels and ryokan with addresses, confirmation numbers, and
  check-in rules. Unbooked stays show dashed.
- **Bookings** — checklist with a progress bar; checkmarks sync to everyone.
- **Food** — dishes to eat, by region.
- **Currency** — ¥ ⇄ $ converter with a live rate (cached 6 hours, falls back to
  the last known rate when offline).
- **Settings** — the whole trip as one auto-saving JSON editor.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Entry page (fonts, meta tags); mounts the React app |
| `src/App.tsx` | Header, tab switching, bottom nav |
| `src/tabs/` | One file per tab: Itinerary, Stays, Bookings, Food, Currency, Settings |
| `src/useTrip.ts` | All sync logic: auto-save, server push/pull, newest-copy-wins |
| `src/types.ts` | TypeScript shape of the trip JSON |
| `src/storage.ts` | localStorage helpers (offline copy, quick notes, cached fx rate) |
| `src/index.css` | All styles — plain CSS |
| `public/` | Copied to the site root as-is: `sw.js`, `manifest.json`, `icon.svg` |
| `netlify/edge-functions/gate.ts` | Password gate for the whole site (see below) |
| `netlify/functions/trip-data.mts` | API that stores the trip JSON in Netlify Blobs |
| `trip-data.example.json` | Example of the trip JSON shape |

The app is React + TypeScript, built with [Vite](https://vite.dev). Every
push is typechecked by a GitHub Action (`.github/workflows/checks.yml`), and
the Netlify build typechecks again before deploying — a type error can't
reach the live site.

## How data is stored

The trip content (itinerary, stays with confirmation numbers, bookings, food)
lives in **Netlify Blobs** — the site's own key-value storage, free tier — and
is served by `/api/trip-data`. It is **never in this public repo**.

- Opening the app pulls the latest trip from the server (newest copy wins,
  by timestamp).
- Saving anything in the app pushes the whole trip back up automatically.
- Each phone also keeps a copy in `localStorage`, so the app works offline;
  it re-syncs the next time a save happens online.
- Booking checkmarks are part of the trip JSON, so they sync too. Quick notes
  on days are personal and stay per-device.

### Putting the trip content in (no git involved)

Pick whichever is easiest:

1. **In the app** — just edit things. Every change saves to the server on its
   own; there are no save buttons anywhere.
2. **Paste JSON** — Settings → Trip data → paste the whole trip JSON over
   what's there. It validates and saves itself as soon as you stop typing.
   (Tip: paste the JSON to Claude, describe the change, paste the result
   back.) See `trip-data.example.json` for the shape. Other phones pick up
   changes when the app is opened or brought back on screen, and every 30
   seconds while Settings is open.
3. **From a terminal** —
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -H "X-Tabi-Password: YOUR_PASSWORD" \
     --data @trip-data.json \
     https://YOUR-SITE.netlify.app/api/trip-data
   ```

## Password protection

Netlify's built-in site password is a paid feature, so an **edge function**
(`netlify/edge-functions/gate.ts`) does the same job on the free tier: every
page and API request needs the trip password. Type it once and a cookie keeps
you signed in for a year (installed home-screen apps have their own cookies, so
you'll type it once there too).

Set it up in Netlify: **Site configuration → Environment variables → Add**
`TRIP_PASSWORD` = your shared password, then redeploy. Until the variable is
set, the site is open — so set it before uploading the real trip.

This is deliberately basic: one shared password, checked at the edge, with the
hash in a year-long HttpOnly cookie. It keeps the public internet and search
engines out of the trip; it is not bank-grade security, so don't put passports
or card numbers in the trip data.

## Running it locally

```bash
npm install
npx netlify dev
```

`netlify dev` runs the app, the password gate, the trip-data function, and
local Blobs storage. For UI-only fiddling, `npm run dev` starts just the app
(it falls back to device-only storage since there's no server), and
`npm run typecheck` checks the TypeScript without building.

## Deploying

Netlify auto-deploys this repo on every push to `main`. The one-time setup is
linking the repo: Netlify → project → **Site configuration → Build & deploy →
Continuous deployment → Link repository** → pick `marisaweisberger/tabi`.
Build settings come from [`netlify.toml`](netlify.toml) — accept the defaults
it fills in. Then set `TRIP_PASSWORD` (above).

The build typechecks the code and bundles the app into `dist/` — the trip
data doesn't live in deploys at all (it's in Netlify Blobs, which survives
every deploy untouched), so there's nothing to carry forward and no way for a
deploy to clobber it. Netlify auto-detects the functions in `netlify/`.
Static files that must sit at the site root (the service worker, manifest,
icon) live in `public/` and are copied into the deploy as-is.

The service worker's cache version is stamped automatically during the build
(`scripts/stamp-sw.mjs`), so every deploy gets a fresh cache and phones pick
up new versions on their next launch — no manual version bumps.

## Provenance

An earlier version of this code was recovered from the Netlify deploy after
the original source was lost. That recovery path no longer exists — deploys
are now compiled Vite output, not source — so **this repo is the only
source**. `icon.svg` was redrawn to match the deployed icon.
