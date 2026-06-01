// Gristo Rider — Service Worker v2
const CACHE = 'gristo-rider-v2';
const SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Network-first for Firebase + Google APIs
  if (url.hostname.includes('firebase') || url.hostname.includes('google') || url.hostname.includes('googleapis')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Cache-first for app shell
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// Push notification support (ready for future backend integration)
self.addEventListener('push', e => {
  if (!e.data) return;
  let data = {};
  try { data = e.data.json(); } catch { data = { title: 'New Delivery', body: e.data.text() }; }
  e.waitUntil(
    self.registration.showNotification(data.title || 'New Delivery!', {
      body:             data.body || 'A delivery has been assigned to you.',
      icon:             '/icon-192.png',
      badge:            '/icon-192.png',
      tag:              'delivery-' + (data.orderId || Date.now()),
      renotify:         true,
      requireInteraction: true,
      vibrate:          [200, 100, 200, 100, 400],
      data:             { orderId: data.orderId }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin)) { c.focus(); return; }
      }
      clients.openWindow('/');
    })
  );
});
