# Tabi — notes for Claude

A shared trip-planning PWA for a Japan trip. Read the README first; these are
the rules and gotchas that aren't obvious from the code.

## Who you're working with

The person developing most of this is **non-technical**. That means:

- Explain what you did and what they need to do in plain language — name the
  exact buttons/menus (e.g. "Netlify → Site configuration → Environment
  variables"), never assume they'll run terminal commands unless they ask.
- Keep the architecture boring and simple. The stack is React + TypeScript
  built with Vite — and that's it. No state libraries, no routers, no CSS
  frameworks, no extra tooling unless they ask.
- Prefer the smallest change that works. Don't refactor for style.
- If something needs a decision (tradeoffs, destructive actions), ask in
  plain terms rather than picking silently.

## How the app is laid out

- `index.html` — Vite entry page (fonts, meta tags, mounts the app).
- `src/types.ts` — the shape of the trip JSON. Change it here first; the
  typechecker then points at every place that needs updating.
- `src/storage.ts` — localStorage keys (unchanged from the old app so
  nobody's phone loses data): `tabi_content`, `fx_rate`. (Legacy per-device
  `qn_*` quick notes and `bk_*` checkmarks migrate into the shared trip.)
- `src/useTrip.ts` — ALL sync logic: load, auto-save (debounced), push to
  the server, pull on focus, newest-`_updatedAt`-wins. Touch with care.
- `src/App.tsx` — header, tab switching, bottom nav.
- `src/tabs/*.tsx` — one file per tab (Itinerary, Stays, Bookings, Food,
  Currency, Settings).
- `src/index.css` — all styles, plain CSS with custom properties.
- `public/` — copied into the deploy as-is: `sw.js`, `manifest.json`,
  `icon.svg`. These are outside the password gate; no trip content ever.

## Git workflow — the dev flow

1. Make changes.
2. **Push to `staging` freely** — no need to ask. Netlify builds a branch
   deploy of every push to `staging`.
3. **Then send the staging URL so the changes can be tested on a phone:**
   https://staging--sparkly-lamington-19866c.netlify.app/
   (same trip password as the live site).
4. Repeat 1–3 until the person says they're satisfied.
5. **Merge `staging` into `main` ONLY when explicitly told to** ("deploy",
   "merge to main", "make it live", or similar). Netlify auto-deploys every
   push to `main`, and prod deploys are limited on the free plan — so a
   push to main IS a deploy and spends one. Never push main on your own.

Notes:

- **Staging shares the live site's trip data** — Netlify Blobs storage is
  per-site, not per-branch. Edits made on the staging URL change the real
  trip for everyone. Don't treat staging as a data sandbox.
- No pull requests — plain merges.
- Never force-push `main`.
- If asked to "test locally" or "run locally", start a local server:
  `npx netlify dev` for the full stack (app + gate + trip-data function +
  local throwaway Blobs) or `npm run dev` for UI-only.
- Every push gets typechecked twice: the `checks` GitHub Action runs
  `tsc --noEmit` + `vite build` on all branches, and the Netlify build runs
  the same thing — a TypeScript error can't reach the live site.

## Data privacy — the one rule that really matters

**This repo is public. The real trip data must NEVER be committed.**
That includes hotel addresses, confirmation numbers, flight details, and the
dates the house is empty — in code, examples, tests, screenshots, or commit
messages.

Where the real data actually lives:

- **Netlify Blobs**, read/written by `netlify/functions/trip-data.mts` at
  `/api/trip-data`. It is not part of any deploy and survives redeploys.
- Each phone keeps an offline copy in `localStorage` (key `tabi_content`).
- `trip-data.example.json` shows the JSON shape with fake data — keep it fake.

The whole site sits behind `netlify/edge-functions/gate.ts`, which checks the
`TRIP_PASSWORD` environment variable (set in the Netlify UI, never in the
repo). If `TRIP_PASSWORD` is unset the site is deliberately open, so a fresh
deploy isn't bricked — don't "fix" that. Files excluded from the gate
(`manifest.json`, `icon.svg`, `sw.js`) must never contain trip content.

## Gotchas that will bite you

- The service-worker cache version is stamped automatically at build time
  (`scripts/stamp-sw.mjs` hashes the deployed files and injects the hashed
  asset list) — **no manual `CACHE` bumps needed anymore**. Just don't
  rename the `const BUILD = "dev"` / `const EXTRA = []` placeholder lines
  in `public/sw.js`; the stamp script errors if it can't find them.
- New static files that must exist at the site root go in `public/`
  (Vite copies them into the deploy automatically). Consider whether the
  gate's `excludedPath` in `gate.ts` applies — excluded files are public.
- The service worker must never intercept `/api/*` or `/login`, and must
  never cache non-OK responses — that's what keeps the login page out of the
  offline cache.
- Don't add dependencies casually — the app is React + react-dom and
  `@netlify/blobs` for the server function, plus dev tooling. That's the
  whole list, on purpose.
- Client saves stamp `CONTENT._updatedAt`; the newest copy wins when the app
  and server disagree. Keep that behavior if you touch `src/useTrip.ts`.
- There are deliberately NO save/load/sync buttons — everything auto-saves
  (debounced) and auto-refreshes on focus. Don't add buttons back.
- Firebase sync was removed on purpose (server storage replaced it). Don't
  reintroduce it.
- All six tabs stay mounted and are shown/hidden with CSS (`.tab.active`) so
  form drafts and open quick notes survive tab switches. Keep it that way.

## Checking your work

- `npm run typecheck` — TypeScript over the whole app, no output on success.
- `npm run build` — typecheck + production build into `dist/`.
- `npm run dev` — Vite dev server (UI only; no gate, no server storage —
  the app falls back to device-only storage).
- Full local run (functions + gate + local Blobs): `npm install`, then
  `npx netlify dev`.
