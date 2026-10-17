// Kill switch for the Nuxt PWA service worker that used to be registered on
// tapy.mx. Without it, returning visitors keep getting the old app shell from
// cache. Browsers re-check /sw.js on navigation, install this one, and it
// removes itself.
// ponytail: delete a few months after the cutover, once old visitors are gone.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) await caches.delete(key)
    await self.registration.unregister()
    for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url)
  })())
})
