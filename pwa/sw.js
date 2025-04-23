const CACHE_NAME = 'kitab-ghar-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    'book1.jpg',
    'book2.jpg',
    'book3.jpg',
    'book4.jpg',
    'book5.jpg',
    'book6.jpg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});