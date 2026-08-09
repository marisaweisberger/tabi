// Tabi service worker.
// NETWORK-FIRST for the app shell so redeploys reach phones on next launch,
// cache fallback for offline. Cache-first only for static font CDNs.
// API traffic (/api/*, /login, exchange rates) is never intercepted,
// and non-OK responses (like the password page's 401) are never cached.
//
// BUILD and EXTRA are stamped by scripts/stamp-sw.mjs during `npm run build`:
// BUILD becomes a hash of the deployed files (so every deploy gets a fresh
// cache and old hashed assets are purged), and EXTRA becomes the list of
// Vite's hashed /assets/* files so the whole app is precached at install —
// that's what makes the app work offline. Don't rename these two lines.
const BUILD = "dev";
const EXTRA = [];
const CACHE = "tabi-" + BUILD;
const SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg", ...EXTRA];
const STATIC_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    // Trip data and the password gate must always hit the real server
    if (url.pathname.startsWith("/api/") || url.pathname === "/login") return;
    // App shell: network first, cache fallback (offline on the Shinkansen still works)
    e.respondWith(
      fetch(e.request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match(e.request))
    );
  } else if (STATIC_HOSTS.includes(url.hostname)) {
    // Fonts: cache first
    e.respondWith(
      caches.match(e.request).then((cached) =>
        cached || fetch(e.request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        }))
    );
  }
  // Everything else (exchange-rate APIs): straight to network, untouched.
});
