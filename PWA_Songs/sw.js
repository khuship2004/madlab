const CACHE_NAME = 'music-albums-pwa-v2'; // Updated cache name to force re-caching
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  '/icon-300x300.png',
  '/icon-300x300.png',
  '/icon-300x300.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-1280x720.png', // Added desktop screenshot
  '/icon-720x1280.png'  // Added mobile screenshot
];

// Install the service worker and cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        const cachePromises = urlsToCache.map(url => {
          return fetch(url)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to fetch ${url}`);
              }
              return cache.put(url, response);
            })
            .catch(error => {
              console.warn(`Failed to cache ${url}:`, error);
            });
        });
        return Promise.allSettled(cachePromises).then(() => {
          console.log('Caching completed, even with some failures');
        });
      })
      .catch(error => {
        console.error('Caching failed entirely:', error);
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