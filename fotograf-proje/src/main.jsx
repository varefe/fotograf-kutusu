import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Service Worker'ı kaydet - Font yükleme engelleme için
if ('serviceWorker' in navigator) {
  // Sayfa yüklendiğinde veya hemen kaydet
  const registerSW = () => {
    const swPath = '/font-blocker-sw.js';
    
    navigator.serviceWorker.register(swPath, {
      scope: '/'
    })
      .then((registration) => {
        console.log('✅ Service Worker kaydedildi:', registration.scope);
        console.log('📍 Service Worker URL:', swPath);
        
        // Hemen aktif et
        if (registration.active) {
          console.log('✅ Service Worker aktif');
        } else if (registration.installing) {
          console.log('⏳ Service Worker yükleniyor...');
          registration.installing.addEventListener('statechange', (e) => {
            if (e.target.state === 'activated') {
              console.log('✅ Service Worker aktif edildi');
              // Tüm client'lara mesaj gönder
              registration.update();
            }
          });
        } else if (registration.waiting) {
          console.log('⏳ Service Worker bekliyor...');
          // Yeni service worker varsa, hemen aktif et
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Güncelleme kontrolü
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Yeni Service Worker bulundu, güncelleniyor...');
        });
      })
      .catch((error) => {
        console.warn('⚠️ Service Worker kaydedilemedi:', error);
        console.warn('📍 Hata detayı:', error.message);
        // HTTPS kontrolü
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          console.warn('⚠️ Service Worker HTTPS gerektirir (production için)');
        }
      });
  };
  
  // Hemen kaydet (sayfa yüklenmeden önce)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerSW);
  } else {
    registerSW();
  }
  
  // Sayfa yüklendiğinde de tekrar dene
  window.addEventListener('load', registerSW);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

