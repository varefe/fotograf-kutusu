// Push Notification Utilities
// VAPID key şimdilik boş - production'da environment variable'dan gelecek
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

/**
 * Push notification izni iste
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Bu tarayıcı bildirimleri desteklemiyor');
    return { granted: false, error: 'Tarayıcı desteklemiyor' };
  }

  if (Notification.permission === 'granted') {
    return { granted: true };
  }

  if (Notification.permission === 'denied') {
    return { granted: false, error: 'Bildirim izni reddedilmiş' };
  }

  const permission = await Notification.requestPermission();
  return { granted: permission === 'granted' };
};

/**
 * Service Worker kaydet
 */
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker desteklenmiyor');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('✅ Service Worker kaydedildi:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker kayıt hatası:', error);
    return null;
  }
};

/**
 * Push subscription oluştur
 */
export const subscribeToPush = async (registration) => {
  if (!registration) {
    console.warn('Service Worker kaydı yok');
    return null;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('VAPID public key bulunamadı - Push notification şimdilik devre dışı');
    // VAPID key yoksa bile subscription oluşturmayı dene (frontend'de işlenecek)
    // return null;
  }

  try {
    const subscribeOptions = {
      userVisibleOnly: true
    };
    
    // VAPID key varsa ekle
    if (VAPID_PUBLIC_KEY) {
      subscribeOptions.applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    }
    
    const subscription = await registration.pushManager.subscribe(subscribeOptions);

    return subscription;
  } catch (error) {
    console.error('Push subscription hatası:', error);
    return null;
  }
};

/**
 * Push subscription'ı backend'e kaydet
 */
export const savePushSubscription = async (subscription, apiUrl, getAuthHeaders) => {
  try {
    const response = await fetch(`${apiUrl}/notifications/push/subscribe`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: arrayBufferToBase64(subscription.getKey('auth'))
          }
        }
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Push subscription kaydetme hatası:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Push notification'ı kaldır
 */
export const unsubscribeFromPush = async (apiUrl, getAuthHeaders) => {
  try {
    const response = await fetch(`${apiUrl}/notifications/push/unsubscribe`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Push subscription kaldırma hatası:', error);
    return { success: false, error: error.message };
  }
};

/**
 * VAPID key'i Uint8Array'e çevir
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * ArrayBuffer'ı base64'e çevir
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Push notification'ı başlat
 */
export const initializePushNotifications = async (apiUrl, getAuthHeaders) => {
  // İzin kontrolü
  const permissionResult = await requestNotificationPermission();
  if (!permissionResult.granted) {
    console.log('Bildirim izni verilmedi:', permissionResult.error);
    return { success: false, error: permissionResult.error };
  }

  // Service Worker kaydet
  const registration = await registerServiceWorker();
  if (!registration) {
    return { success: false, error: 'Service Worker kaydedilemedi' };
  }

  // Push subscription oluştur
  const subscription = await subscribeToPush(registration);
  if (!subscription) {
    return { success: false, error: 'Push subscription oluşturulamadı' };
  }

  // Backend'e kaydet
  const saveResult = await savePushSubscription(subscription, apiUrl, getAuthHeaders);
  return saveResult;
};
