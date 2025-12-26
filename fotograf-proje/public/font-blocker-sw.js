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
  
  // ÖNCE: TÜM POST, PUT, DELETE, PATCH isteklerini geçir (kesinlikle API istekleri)
  if (method !== 'GET' && method !== 'OPTIONS') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // İKİNCİ: TÜM API isteklerini geçir (GET bile olsa)
  if (url.includes('/api/') || 
      url.includes('/api?') || 
      url.endsWith('/api') || 
      url.includes('/api/payment/') ||
      url.includes('/api/health') ||
      url.includes(':5000') ||
      url.includes('localhost:5000') ||
      url.includes('api.fotografkutusu.com') ||
      url.includes('railway.app') ||
      url.includes('render.com')) {
    // API isteklerini Service Worker'dan geçirme, direkt fetch et
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Sadece İyzico font isteklerini engelle
  if (url.includes('static.iyzipay.com/fonts') || 
      (url.includes('fonts/MarkPro') && url.includes('iyzipay')) ||
      (url.includes('.woff') && url.includes('iyzipay') && url.includes('static.iyzipay.com'))) {
    console.log('🚫 [Service Worker] Font isteği engellendi:', url);
    
    // Boş ama geçerli bir font response döndür (CORS hatasını önlemek için)
    event.respondWith(
      new Response(new Uint8Array(0), {
        status: 200,
        statusText: 'OK',
        headers: new Headers({
          'Content-Type': url.includes('.woff2') ? 'font/woff2' : 'font/woff',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Length': '0'
        })
      })
    );
    return;
  }
  
  // OPTIONS request'leri için CORS header'ları ekle (sadece font istekleri için)
  if (method === 'OPTIONS' && url.includes('fonts')) {
    event.respondWith(
      new Response(null, {
        status: 200,
        headers: new Headers({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        })
      })
    );
    return;
  }
  
  // Diğer tüm istekleri normal şekilde işle
  event.respondWith(fetch(event.request));
});

