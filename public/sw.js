// This file intentionally self-destructs.
// Replaces any previously registered Sakanak service worker so returning users
// stop being served stale cached HTML/JS from the old PWA build.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete all caches created by the old SW.
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      // Take control of all open clients immediately.
      await self.clients.claim();
      // Unregister this SW so future requests bypass it entirely.
      await self.registration.unregister();
      // Reload all open tabs once so they fetch fresh assets from the network.
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});

// Pass-through: never intercept fetches.
self.addEventListener('fetch', () => {});
