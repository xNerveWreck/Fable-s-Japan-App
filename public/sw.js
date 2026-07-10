/* Tabi service worker — the whole trip works offline in Japan.
   Navigations are network-first so updates actually reach installed apps;
   hashed assets are cache-first (their names change when their bytes do). */
const CACHE = 'tabi-v2'

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['./', './index.html', './manifest.webmanifest']))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  // the app shell: try the network for freshness, fall back to cache offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((cache) => cache.put(event.request, copy))
          }
          return res
        })
        .catch(() =>
          caches.match(event.request).then((hit) => hit || caches.match('./index.html'))
        )
    )
    return
  }

  // everything else (hashed JS/CSS, icons): cache-first, backfill from network
  event.respondWith(
    caches.match(event.request).then(
      (hit) =>
        hit ||
        fetch(event.request).then((res) => {
          if (res.ok && event.request.url.startsWith(self.location.origin)) {
            const copy = res.clone()
            caches.open(CACHE).then((cache) => cache.put(event.request, copy))
          }
          return res
        })
    )
  )
})
