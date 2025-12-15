// Service Worker for Wellfire - Ultra-fast caching
const CACHE_NAME = 'wellfire-v1';
const DYNAMIC_CACHE = 'wellfire-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') return;
  
  // API calls - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response before caching
          const responseToCache = response.clone();
          
          // Cache successful API responses
          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request);
        })
    );
    return;
  }
  
  // Images and static assets - cache first
  if (request.destination === 'image' || 
      url.pathname.match(/\.(css|js|woff2?|ttf|otf)$/)) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Update cache in background
            fetch(request).then(response => {
              if (response.status === 200) {
                caches.open(DYNAMIC_CACHE).then(cache => {
                  cache.put(request, response);
                });
              }
            });
            return cachedResponse;
          }
          
          // Not in cache, fetch and cache
          return fetch(request).then(response => {
            const responseToCache = response.clone();
            
            if (response.status === 200) {
              caches.open(DYNAMIC_CACHE).then(cache => {
                cache.put(request, responseToCache);
              });
            }
            
            return response;
          });
        })
    );
    return;
  }
  
  // HTML pages - network first
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseToCache = response.clone();
          
          if (response.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Fallback to index.html for client-side routing
              return caches.match('/index.html');
            });
        })
    );
    return;
  }
  
  // Default - try network first, then cache
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Implement background sync logic here
  console.log('Background sync triggered');
}
