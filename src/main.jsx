import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initAnalytics } from './utils/analytics'
import { initConsoleGuard } from './utils/consoleGuard'

// Admin dışında kimse console loglarını görmesin
initConsoleGuard()

// Initialize Google Analytics if measurement ID is provided
if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
  initAnalytics(import.meta.env.VITE_GA_MEASUREMENT_ID)
}

// Push Notification Service Worker'ı kaydet
if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('✅ Push Notification Service Worker kaydedildi:', registration.scope);
    })
    .catch((error) => {
      console.warn('⚠️ Push Notification Service Worker kaydedilemedi:', error);
    });
}

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
          try {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          } catch (error) {
            // Message channel kapalıysa hata verme
            console.warn('⚠️ Service Worker mesaj gönderilemedi:', error.message);
          }
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

