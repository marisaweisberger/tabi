#!/usr/bin/env python3
"""Download every file of a published Netlify site into a local folder.

Uses only the Python 3 standard library, so it runs on a stock macOS or Linux
box with no `pip install` step.

Usage:
    export NETLIFY_AUTH_TOKEN=nfp_xxxxxxxxxxxxxxxx
    python3 scripts/netlify_export.py sparkly-lamington-19866c.netlify.app --out site

Get a token at: https://app.netlify.com/user/applications#personal-access-tokens
"""

import argparse
import json
import os
import pathlib
import sys
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.netlify.com/api/v1"


def request(path, token, raw=False):
    req = urllib.request.Request(API + path)
    req.add_header("Authorization", "Bearer " + token)
    # Netlify returns file *metadata* as JSON unless you ask for this mime type.
    req.add_header(
        "Accept",
        "application/vnd.bitballoon.v1.raw" if raw else "application/json",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read()
    except urllib.error.HTTPError as err:
        detail = err.read().decode("utf-8", "replace").strip()
        sys.exit(f"HTTP {err.code} on {path}\n{detail}")
    return body if raw else json.loads(body)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "site",
        help="site name, api id, or domain (e.g. sparkly-lamington-19866c.netlify.app)",
    )
    parser.add_argument("--out", default="site", help="output directory (default: site)")
    args = parser.parse_args()

    token = os.environ.get("NETLIFY_AUTH_TOKEN")
    if not token:
        sys.exit("Set NETLIFY_AUTH_TOKEN first (see the docstring at the top of this file).")

    site = request("/sites/" + urllib.parse.quote(args.site, safe=""), token)
    print(f"site: {site.get('name')}  url: {site.get('ssl_url') or site.get('url')}")

    published = site.get("published_deploy") or {}
    if published.get("id"):
        print(f"published deploy: {published['id']}  ({published.get('created_at')})")

    files = request(f"/sites/{site['id']}/files", token)
    print(f"{len(files)} file(s) to download")

    out = pathlib.Path(args.out)
    for entry in files:
        # Netlify paths are absolute-looking ("/index.html"); strip the leading slash
        # so they land inside --out rather than at the filesystem root.
        rel = entry["path"].lstrip("/")
        dest = out / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        blob = request(
            f"/sites/{site['id']}/files/{urllib.parse.quote(rel)}", token, raw=True
        )
        dest.write_bytes(blob)
        print(f"  {rel}  ({len(blob)} bytes)")

    print(f"\nDone. Files are in ./{out}")


if __name__ == "__main__":
    main()
