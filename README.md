# Tabi 旅

A shared trip command center for Japan, September–October 2026. Installable as a
phone app (PWA), works offline, and optionally syncs live between two phones.

Live at https://sparkly-lamington-19866c.netlify.app

## Tabs

- **Itinerary** — regions on a train-rail timeline, each day with a plan, notes,
  and transit legs. Everything is editable in place.
- **Stays** — hotels and ryokan with addresses, confirmation numbers, and
  check-in rules. Unbooked stays show dashed.
- **Bookings** — checklist with a progress bar, plus an optional Gmail feed.
- **Food** — dishes to eat, by region.
- **Currency** — ¥ ⇄ $ converter with a live rate (cached 6 hours, falls back to
  the last known rate when offline).
- **Settings** — Firebase sync setup and the whole trip as editable JSON.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The entire app — markup, styles, and logic in one file |
| `trip-data.example.js` | Template for the starting trip content (`REGIONS`, `BOOKINGS`, `FOOD`, `STAYS`) |
| `sw.js` | Service worker: network-first app shell, cache fallback for offline |
| `manifest.json` | PWA manifest (name, colors, icons) |
| `icon.svg` | App icon — a torii gate |

No build step, no dependencies. Firebase is loaded from a CDN at runtime only if
you turn sync on.

## Running it locally

```bash
cp trip-data.example.js trip-data.js   # first time only
python3 -m http.server 8000
```

Then open http://localhost:8000. A plain `file://` open won't work — service
workers and the manifest need a real server.

## Keeping the real trip out of this repo

`trip-data.js` is gitignored. It holds confirmation numbers, addresses, and the
dates the house is empty, and this repo is public — so the real one lives only on
Netlify and on the phones, never here. Commit `trip-data.example.js` changes
instead when the *shape* of the data changes.

## How data is stored

On first load you see the built-in template from `trip-data.js`. Saving anything
copies it into your own editable trip, kept in `localStorage`. Turning on sync in
Settings mirrors that to a Firebase Realtime Database under a trip code — the
same code on two phones gives both people the same live trip. Firebase
credentials are pasted in at runtime and never stored in this repo.

## Deploying

Any static host. To make Netlify build from this repo: Netlify → project → Site
configuration → Build & deploy → Link repository, leave the build command empty
and set the publish directory to `/`.

Bump the `CACHE` version in `sw.js` when you change the app shell, so phones pick
up the new version instead of a cached one.

## Provenance

This code was recovered from the Netlify deploy, not from an original source
repo — see [NETLIFY_EXPORT.md](NETLIFY_EXPORT.md). `icon.svg` was redrawn to
match the deployed icon; `icon-512.png` (referenced by the manifest) has not been
recovered yet.
