// Basit şifreleme/çözme fonksiyonları
// Admin paneli için sipariş verilerini şifrelemek için

const ENCRYPTION_KEY = 'fotograf-baski-admin-2024'

// Şifreleme fonksiyonu - UTF-8 uyumlu
export const encryptData = (data) => {
  try {
    const jsonString = JSON.stringify(data)
    
    // Önce Base64'e çevir (UTF-8 uyumlu)
    const base64String = btoa(unescape(encodeURIComponent(jsonString)))
    
    // Sonra key ile şifrele
    let encrypted = ''
    for (let i = 0; i < base64String.length; i++) {
      const char = base64String.charCodeAt(i)
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      // Karakter kodunu değiştir (0-255 aralığında kal)
      const encryptedChar = (char + keyChar) % 256
      encrypted += String.fromCharCode(encryptedChar)
    }
    
    // Şifrelenmiş veriyi tekrar Base64'e çevir
    return btoa(encrypted)
  } catch (error) {
    console.error('Şifreleme hatası:', error)
    return null
  }
}

// Çözme fonksiyonu - UTF-8 uyumlu
export const decryptData = (encryptedData) => {
  try {
    // İlk Base64 decode
    const decoded = atob(encryptedData)
    
    // Key ile çöz
    let decrypted = ''
    for (let i = 0; i < decoded.length; i++) {
      const char = decoded.charCodeAt(i)
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      // Karakter kodunu geri al (0-255 aralığında kal)
      const decryptedChar = (char - keyChar + 256) % 256
      decrypted += String.fromCharCode(decryptedChar)
    }
    
    // Base64'ten JSON'a çevir
    const jsonString = decodeURIComponent(escape(atob(decrypted)))
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Çözme hatası:', error)
    return null
  }
}

// Siparişleri localStorage'a kaydet
export const saveOrderToStorage = (orderData) => {
  try {
    // Base64 fotoğrafları kaldır (localStorage quota için)
    const orderDataWithoutBase64 = {
      ...orderData,
      photo: orderData.photo ? {
        ...orderData.photo,
        base64: undefined, // Base64'i kaldır
        file: undefined // File objesi de kaldır (serialize edilemez)
      } : undefined
    }
    
    const existingOrders = getOrdersFromStorage()
    
    // Eski siparişleri temizle (son 50 siparişi tut)
    let cleanedOrders = existingOrders
    if (cleanedOrders.length > 50) {
      cleanedOrders = cleanedOrders.slice(-50)
      console.log('🧹 Eski siparişler temizlendi, son 50 sipariş tutuldu')
    }
    
    const newOrder = {
      ...orderDataWithoutBase64,
      id: orderData.id || Date.now().toString(),
      createdAt: orderData.createdAt || new Date().toISOString(),
      encrypted: true
    }
    
    // Şifrele
    const encrypted = encryptData(newOrder)
    if (encrypted) {
      cleanedOrders.push(encrypted)
      
      // localStorage quota kontrolü
      try {
        localStorage.setItem('encrypted_orders', JSON.stringify(cleanedOrders))
        return true
      } catch (quotaError) {
        if (quotaError.name === 'QuotaExceededError') {
          console.warn('⚠️ localStorage quota aşıldı, daha fazla eski sipariş temizleniyor...')
          // Daha fazla temizle (son 20 sipariş)
          const moreCleaned = cleanedOrders.slice(-20)
          localStorage.setItem('encrypted_orders', JSON.stringify(moreCleaned))
          return true
        }
        throw quotaError
      }
    }
    return false
  } catch (error) {
    console.error('Sipariş kaydetme hatası:', error)
    return false
  }
}

// Şifreli siparişleri localStorage'dan al
export const getOrdersFromStorage = () => {
  try {
    const stored = localStorage.getItem('encrypted_orders')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Sipariş okuma hatası:', error)
    return []
  }
}

// Şifreli siparişleri çöz (sadece admin için)
export const getDecryptedOrders = () => {
  try {
    const encryptedOrders = getOrdersFromStorage()
    const decryptedOrders = []
    
    for (const encrypted of encryptedOrders) {
      const decrypted = decryptData(encrypted)
      if (decrypted) {
        decryptedOrders.push(decrypted)
      }
    }
    
    // Tarihe göre sırala (en yeni önce)
    return decryptedOrders.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0)
      const dateB = new Date(b.createdAt || 0)
      return dateB - dateA
    })
  } catch (error) {
    console.error('Sipariş çözme hatası:', error)
    return []
  }
}

// Tüm siparişleri temizle
export const clearAllOrders = () => {
  try {
    localStorage.removeItem('encrypted_orders')
    return true
  } catch (error) {
    console.error('Sipariş temizleme hatası:', error)
    return false
  }
}
