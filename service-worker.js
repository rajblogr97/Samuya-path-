const CACHE_NAME = 'saumya-path-cache-v1';

// This service worker uses a "cache then network" strategy.
// It will try to serve assets from the cache first for speed and offline capability.

self.addEventListener('install', event => {
  // Perform install steps
  console.log('Service Worker: Installing...');
  // Skip waiting to activate the new service worker immediately.
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      
      const fetchedResponsePromise = fetch(event.request).then((networkResponse) => {
        // If we get a valid response, we put it in the cache.
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => {
        // fetch failed, possibly offline. We don't have a fallback page,
        // but if we did, we would return it here.
      });

      // Return the cached response if it exists, otherwise wait for the network response.
      return cachedResponse || fetchedResponsePromise;
    })
  );
});

// Clean up old caches on activation
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of uncontrolled clients
  return self.clients.claim();
});
