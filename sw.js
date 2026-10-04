const CACHE_NAME = 'fitcheck-v2';
const ASSETS = ['/android-fitcheck/', '/android-fitcheck/index.html', '/android-fitcheck/manifest.json', '/android-fitcheck/icons/icon-192.png', '/android-fitcheck/icons/icon-512.png'];
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', (event) => { event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request))); });
