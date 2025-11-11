const CACHE_NAME = 'frota-sul-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/config.js',
  '/js/utils.js',
  '/js/api.js',
  '/js/maintenance_notes.js',
  '/js/pwa.js',
  '/js/ui/vehicleCards.js',
  '/js/ui/summary.js',
  '/js/ui/modals.js',
  '/js/handlers/fileHandler.js',
  '/js/handlers/imageExport.js',
  '/manifest.json',
  '/img/icons/192x192.png',
  '/img/icons/512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});