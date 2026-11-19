/* Service worker: offline-first shell, stale-while-revalidate for assets. */
const VERSION = "hello-world-v1.0.0";
const CACHE = `${VERSION}`;
const SCOPE = self.registration.scope;
const OFFLINE_URL = new URL("./index.html", SCOPE).href;

const CORE = [
  "./",
  "./index.html",
  "./404.html",
  "./manifest.webmanifest",
  "./assets/favicon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./src/css/tokens.css",
  "./src/css/base.css",
  "./src/css/layout.css",
  "./src/css/components.css",
  "./src/css/animations.css",
  "./src/css/utilities.css",
  "./src/js/main.js",
  "./src/js/i18n.js",
  "./src/js/theme.js",
  "./src/js/data/i18n.js",
  "./src/js/data/snippets.js",
  "./src/js/lib/utils.js",
  "./src/js/lib/fuzzy.js",
  "./src/js/lib/highlight.js",
  "./src/js/ui/copy.js",
  "./src/js/ui/demos.js",
  "./src/js/ui/metrics.js",
  "./src/js/ui/palette.js",
  "./src/js/ui/particles.js",
  "./src/js/ui/playground.js",
  "./src/js/ui/reveal.js",
  "./src/js/ui/snippets-ui.js",
  "./src/js/ui/toast.js",
  "./src/js/ui/typewriter.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.allSettled(CORE.map((path) => cache.add(new URL(path, SCOPE)))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network first, fall back to the cached shell when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match(OFFLINE_URL)) || Response.error()),
    );
    return;
  }

  // Assets: serve from cache immediately, refresh in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});
