// Service Worker - Font yükleme engelleme
const CACHE_NAME = 'font-blocker-v1';

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker yükleniyor...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker aktif ediliyor...');
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.delete(CACHE_NAME).catch(() => {})
    ])
  );
});

// Fetch event - Font isteklerini engelle
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const method = event.request.method;
  
  // ÖNCE: TÜM API isteklerini hiç yakalama - direkt geçir (event.respondWith çağrısı yapma)
  // Bu şekilde service worker API isteklerine müdahale etmez
  if (method !== 'GET' && method !== 'OPTIONS') {
    // POST, PUT, DELETE, PATCH istekleri - hiç yakalama, direkt geçir
    return;
  }
  
  // API endpoint'lerini hiç yakalama
  if (url.includes('/api/') || 
      url.includes('/api?') || 
      url.endsWith('/api') || 
      url.includes('/api/payment/') ||
      url.includes('/api/health') ||
      url.includes('/api/orders') ||
      url.includes(':5000') ||
      url.includes('localhost:5000') ||
      url.includes('127.0.0.1:5000') ||
      url.includes('api.fotografkutusu.com') ||
      url.includes('railway.app') ||
      url.includes('render.com') ||
      url.includes('fly.dev') ||
      url.includes('fly.io')) {
    // API isteklerini hiç yakalama - event.respondWith çağrısı yapma
    // Bu şekilde istek normal şekilde devam eder
    return;
  }
  
  // İyzico font istekleri: static.iyzipay.com CORS vermediği için kendi proxy'mizden sun
  const iyzipayFontMatch = url.match(/https:\/\/static\.iyzipay\.com\/fonts\/MarkPro\/([^/?]+)/i);
  if (iyzipayFontMatch) {
    const filename = iyzipayFontMatch[1];
    const proxyUrl = new URL('/api/payment/fonts/MarkPro/' + encodeURIComponent(filename), self.location.origin).href;
    event.respondWith(
      fetch(proxyUrl, { mode: 'cors', credentials: 'omit' })
        .then((res) => {
          if (!res.ok) return res;
          const ct = res.headers.get('Content-Type') || (filename.endsWith('.woff2') ? 'font/woff2' : filename.endsWith('.woff') ? 'font/woff' : 'application/octet-stream');
          return new Response(res.body, { status: 200, headers: { 'Content-Type': ct, 'Cache-Control': 'public, max-age=31536000' } });
        })
        .catch(() => new Response('', { status: 404 }))
    );
    return;
  }

  // Diğer tüm istekleri normal şekilde işle
});

