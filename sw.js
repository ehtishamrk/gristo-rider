// Gristo Rider PWA — Service Worker
const CACHE_NAME = 'gristo-rider-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install: cache static shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for Firebase, cache-first for static shell
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always go network-first for Firebase API calls
  if (url.hostname.includes('firebase') || url.hostname.includes('google')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// Background sync — retry failed status updates when back online
self.addEventListener('sync', e => {
  if (e.tag === 'retry-status-update') {
    // Firebase handles this automatically via offline persistence
    console.log('Sync event: status updates will retry via Firebase');
  }
});

// Push notifications (future: when backend sends push)
self.addEventListener('push', e => {
  if (!e.data) return;
  const data = e.data.json();
  self.registration.showNotification(data.title || 'New Delivery!', {
    body:  data.body  || 'A new delivery is ready for pickup.',
    icon:  '/icon-192.png',
    badge: '/icon-192.png',
    tag:   'new-delivery',
    renotify: true,
    requireInteraction: true,
    actions: [
      { action: 'accept', title: 'Accept' },
      { action: 'skip',   title: 'Skip'   }
    ]
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'accept') {
    e.waitUntil(clients.openWindow('/'));
  }
});
