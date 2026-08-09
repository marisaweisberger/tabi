// Runs after `vite build` (see package.json "build"). Stamps dist/sw.js:
//  - BUILD  → a hash of the deployed files, so every deploy gets a fresh
//             service-worker cache (no more manual version bumps) and the
//             activate step purges the previous deploy's hashed assets
//  - EXTRA  → the hashed /assets/* files Vite produced, so the service
//             worker precaches the actual app code and offline works from
//             the very first visit
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const dist = new URL("../dist/", import.meta.url);
const assets = readdirSync(new URL("assets/", dist)).map((f) => "/assets/" + f);

const hash = createHash("sha256");
for (const f of ["index.html", "manifest.json", "icon.svg", "sw.js"]) {
  hash.update(readFileSync(new URL(f, dist)));
}
hash.update(assets.join(","));
const build = hash.digest("hex").slice(0, 10);

const swPath = new URL("sw.js", dist);
const sw = readFileSync(swPath, "utf8")
  .replace('const BUILD = "dev";', `const BUILD = "${build}";`)
  .replace("const EXTRA = [];", `const EXTRA = ${JSON.stringify(assets)};`);
if (!sw.includes(`"${build}"`) || !sw.includes('"/assets/')) {
  throw new Error("stamp-sw: placeholders not found in dist/sw.js — did the BUILD/EXTRA lines change?");
}
writeFileSync(swPath, sw);
console.log(`stamp-sw: cache tabi-${build}, precaching ${assets.length} hashed assets`);
