// Service Worker for Push Notifications and Offline Support
const CACHE_NAME = 'fotograf-kutusu-v2';
const STATIC_CACHE_NAME = 'fotograf-kutusu-static-v2';
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // Frontend'den gelecek

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('🔔 Service Worker: Install');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('📦 Caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    }).catch(err => {
      console.warn('⚠️ Cache install failed:', err);
    })
  );
  self.skipWaiting();
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('🔔 Service Worker: Activate');
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // İyzico fontları: static.iyzipay.com CORS vermediği için kendi proxy'mizden sun (en başta)
  const iyzipayFontMatch = url.match(/https:\/\/static\.iyzipay\.com\/fonts\/MarkPro\/([^/?]+)/i);
  if (iyzipayFontMatch && request.method === 'GET') {
    const filename = iyzipayFontMatch[1];
    const proxyUrl = new URL('/api/payment/fonts/MarkPro/' + encodeURIComponent(filename), self.location.origin).href;
    event.respondWith(
      fetch(proxyUrl, { mode: 'cors', credentials: 'omit' })
        .then((res) => {
          if (!res.ok) return new Response('', { status: 404 });
          const ct = res.headers.get('Content-Type') || (filename.endsWith('.woff2') ? 'font/woff2' : filename.endsWith('.woff') ? 'font/woff' : 'application/octet-stream');
          return new Response(res.body, { status: 200, headers: { 'Content-Type': ct, 'Cache-Control': 'public, max-age=31536000' } });
        })
        .catch(() => new Response('', { status: 404 }))
    );
    return;
  }

  const urlObj = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls (they should always be online)
  if (urlObj.pathname.startsWith('/api/')) {
    return;
  }

  // Skip external URLs
  if (urlObj.origin !== location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If no cache, return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          // Return a basic response for other requests
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Push event
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Push event received', event);
  
  let notificationData = {
    title: 'Fotoğraf Kutusu',
    body: 'Yeni bildirim',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: data.data || {},
        tag: data.tag,
        requireInteraction: data.requireInteraction || false
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.data.url ? [
        {
          action: 'open',
          title: 'Aç'
        },
        {
          action: 'close',
          title: 'Kapat'
        }
      ] : []
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Service Worker: Notification click', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then((clientList) => {
        // Açık bir pencere varsa ona odaklan
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Yeni pencere aç
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Background sync (opsiyonel)
self.addEventListener('sync', (event) => {
  console.log('🔔 Service Worker: Background sync', event.tag);
  // Offline işlemler için kullanılabilir
});
