// ========================================
// SERVICE WORKER - Offline Mode
// Gazioğlu Şantiye Rapor Sistemi
// ========================================

const CACHE_NAME = 'gazioglu-v1';
const urlsToCache = [
    '/index-test.html',
    '/manifest.json',
    // React & ReactDOM
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    // Babel Standalone
    'https://unpkg.com/@babel/standalone/babel.min.js',
    // Lucide Icons
    'https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.min.js',
    // TailwindCSS
    'https://cdn.tailwindcss.com',
    // html2pdf
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
    // Firebase
    'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js',
    // Google Drive API
    'https://apis.google.com/js/api.js',
    'https://accounts.google.com/gsi/client'
];

// ========================================
// INSTALL - Cache all assets
// ========================================
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching assets');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[SW] All assets cached');
                return self.skipWaiting(); // Activate immediately
            })
            .catch((error) => {
                console.error('[SW] Cache failed:', error);
            })
    );
});

// ========================================
// FETCH - Cache First Strategy
// ========================================
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return cached response
                if (response) {
                    console.log('[SW] Serving from cache:', event.request.url);
                    return response;
                }

                // Not in cache - fetch from network
                console.log('[SW] Fetching from network:', event.request.url);
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone response for caching
                    const responseToCache = response.clone();

                    // Add to cache for future use
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                            console.log('[SW] Cached new resource:', event.request.url);
                        });

                    return response;
                }).catch((error) => {
                    console.error('[SW] Fetch failed:', error);
                    // Return offline page or fallback
                    return new Response('Offline - Resource not available', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});

// ========================================
// ACTIVATE - Clean old caches
// ========================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Activated');
            return self.clients.claim(); // Take control immediately
        })
    );
});

// ========================================
// MESSAGE - Communication with main thread
// ========================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] Service Worker loaded');
