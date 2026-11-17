/* global precache -- Added by PrecachePlugin when emitting the production worker. */

const scope = self.registration.scope
const cachePrefix = `kanban-board:${scope}:`
const cacheName = cachePrefix + precache.revision
const shell = new URL('index.html', scope).href
const resources = new Set(precache.files.map((file) => new URL(file, scope).href))

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => cache.addAll([...resources].map((url) => new Request(url, { cache: 'reload' })))),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => key.startsWith(cachePrefix) && key !== cacheName).map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  let cachedUrl = request.url
  if (request.mode === 'navigate') {
    const url = new URL(request.url)
    url.search = ''
    if (url.href !== scope && url.href !== shell) return
    cachedUrl = shell
  }
  if (!resources.has(cachedUrl)) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(cacheName)
      return (await cache.match(cachedUrl)) ?? fetch(request)
    })(),
  )
})
