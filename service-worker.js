const CACHE_NAME = 'drawpat-cache-v1';
const urlsToCache = [
    '/drawpat/',
    '/drawpat/index.html',
    '/drawpat/game.html',
    '/drawpat/stats.html',
    '/drawpat/styles.css',
    '/drawpat/theme.js',
    '/drawpat/storage.js',
    '/drawpat/game.js',
    '/drawpat/stats.js',
    '/drawpat/media/svg/drawpatLogo.svg',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Кэширование ресурсов');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    return networkResponse;
                });
            })
            .catch(() => {
                return caches.match('/drawpat/index.html');  // Запасной путь
            })
    );
});