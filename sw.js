// Tabi service worker — v13
// NETWORK-FIRST for the app shell so redeploys reach phones on next launch,
// cache fallback for offline. Cache-first only for static font CDNs.
// API traffic (Firebase, exchange rates) is never intercepted.
const CACHE = "tabi-v13";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg", "./trip-data.js"];
const STATIC_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "www.gstatic.com"];

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
    // App shell: network first, cache fallback (offline on the Shinkansen still works)
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
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
  // Everything else (Firebase, exchange-rate APIs): straight to network, untouched.
});
