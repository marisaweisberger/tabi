# Getting the site out of Netlify and into this repo

The site is `sparkly-lamington-19866c` (https://sparkly-lamington-19866c.netlify.app).
Nobody has the original source, but Netlify still stores every file that was
deployed — so we pull the files back out of Netlify and commit them here.

An important caveat first: what you get back is **what was deployed**. If your
sister pasted/dragged plain HTML, CSS and JS into Netlify, then the deployed
files *are* the source and this is a complete recovery. If she used a tool that
compiled the site first, you'll get the compiled output — still a working,
editable site, but the pre-build source is gone.

## Option 1 — Netlify's own download button (try this first, 30 seconds)

1. Go to https://app.netlify.com/projects/sparkly-lamington-19866c/deploys
2. Click the most recent **Published** deploy.
3. Look in the deploy's options / "…" menu for a **Download** item.

If it's there, you get a zip. Unzip it into this repo, then jump to
[Committing](#committing). If you don't see a download option, use Option 2.

## Option 2 — the export script (always works)

### 1. Create a Netlify access token

Go to https://app.netlify.com/user/applications#personal-access-tokens →
**New access token** → name it anything → copy the token. It's shown once.

This token can read and change everything in your Netlify account, so treat it
like a password: don't paste it into a file, don't commit it, and delete it on
that same page once you're finished.

### 2. Run the script

In a terminal, from the root of this repo:

```bash
export NETLIFY_AUTH_TOKEN=paste_your_token_here
python3 scripts/netlify_export.py sparkly-lamington-19866c.netlify.app --out site
```

You'll see each file print as it downloads. They land in `./site`.

(Requires Python 3, which macOS and Linux already have. No installs needed.)

### 3. Sanity-check it

Open the site locally before trusting it:

```bash
cd site && python3 -m http.server 8000
```

Then visit http://localhost:8000 and confirm it looks like the real site.
`Ctrl+C` to stop.

## Committing

```bash
git add site
git commit -m "Import site files exported from Netlify"
git push -u origin main
```

## After that: point Netlify at this repo

Once the code is here, you can make Netlify deploy *from* GitHub, so future
edits are a normal commit instead of a manual upload:

Netlify → your project → **Site configuration → Build & deploy → Continuous
deployment → Link repository** → pick `marisaweisberger/tabi`. For a plain
static site, leave the build command empty and set the publish directory to
`site`.

## If Option 2 fails

Two likely reasons:

- **401/403** — the token is wrong, expired, or belongs to an account that
  can't see this site. Regenerate it while logged in as the site's owner.
- **404** — the site identifier is off. Netlify → project → **Site
  configuration → General** shows the **Site ID** (a UUID). Pass that UUID to
  the script instead of the domain name.

There is also a crude fallback that needs no token, since the site is public:

```bash
wget --mirror --page-requisites --convert-links --no-parent \
     -P site https://sparkly-lamington-19866c.netlify.app/
```

That only finds pages reachable by following links, so it can miss unlinked
files. Prefer the script.
