# Tabi — notes for Claude

A shared trip-planning PWA for a Japan trip. Read the README first; these are
the rules and gotchas that aren't obvious from the code.

## Who you're working with

The person developing most of this is **non-technical**. That means:

- Explain what you did and what they need to do in plain language — name the
  exact buttons/menus (e.g. "Netlify → Site configuration → Environment
  variables"), never assume they'll run terminal commands unless they ask.
- Keep the architecture boring and simple. No frameworks, no build step, no
  bundlers, no TypeScript in the app itself. `index.html` is the entire app
  on purpose — one file they can hand to Claude whole.
- Prefer the smallest change that works. Don't refactor for style.
- If something needs a decision (tradeoffs, destructive actions), ask in
  plain terms rather than picking silently.

## Git workflow

- **No pull requests. Merge work directly to `main`.** Netlify auto-deploys
  every push to `main`, so a push to main IS a deploy to the live site.
- Do feature work on a branch if you like, but finish by merging it into
  `main` and pushing — don't leave work stranded on branches or open PRs.
- Never force-push `main`.

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

- **Bump `CACHE` in `sw.js`** (v14 → v15 → …) whenever you change
  `index.html`, `sw.js`, `manifest.json`, or `icon.svg` — otherwise phones
  keep the old cached version.
- **Adding a new file the app needs?** Add it in three places: the `cp` list
  in `netlify.toml`, the `SHELL` list in `sw.js` (if it should work offline),
  and consider whether the gate's `excludedPath` applies.
- The service worker must never intercept `/api/*` or `/login`, and must
  never cache non-OK responses — that's what keeps the login page out of the
  offline cache.
- `package.json` exists only so Netlify installs `@netlify/blobs` for the
  function. Don't add dependencies casually.
- Client saves stamp `CONTENT._updatedAt`; the newest copy wins when the app
  and server disagree. Keep that behavior if you touch sync code.
- There are deliberately NO save/load/sync buttons — everything auto-saves
  (debounced) and auto-refreshes on focus. Don't add buttons back.
- Firebase sync was removed on purpose (server storage replaced it). Don't
  reintroduce it.

## Checking your work

- Quick syntax check of the app: extract the inline `<script>` from
  `index.html` and run `node --check` on it; `node --check sw.js` too.
- Full local run (functions + gate + local Blobs): `npm install`, then
  `npx netlify dev`.
- The Netlify build is just a file copy into `_site/` — if you change
  `netlify.toml`, keep it that way; the build must never need the trip data.
