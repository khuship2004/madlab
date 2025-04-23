const CACHE_NAME = 'product-page-pwa-v5'; // Updated cache name to force re-caching
const urlsToCache = [
  '/index.html',
  'https://cdn.tailwindcss.com',
  '/icon-200x200.png',
  '/icon-200x200.png',
  '/icon-200x200.png',
  '/icon-200x200.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-1280x720.png', // Add if you include local screenshots
  '/icon-720x1280.png'   // Add if you include local screenshots
];

// Install the service worker and cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching resources');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Caching failed:', error);
      })
  );
  self.skipWaiting();
});

// Fetch resources from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request, { ignoreSearch: true })
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              if (event.request.destination === 'document') {
                return cache.match('/index.html');
              }
              return new Response('Offline: Resource not available', { status: 503 });
            });
        });
    })
  );
});

// Update the cache when the service worker is activated
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});