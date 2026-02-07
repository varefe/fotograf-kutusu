// Tarayıcı fingerprint oluşturma - Her tarayıcı için benzersiz ID
export const getBrowserFingerprint = () => {
  try {
    // Tarayıcı bilgilerini topla
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: Date.now()
    }
    
    // Basit hash fonksiyonu
    const hashString = (str) => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // 32bit integer'a çevir
      }
      return Math.abs(hash).toString(36)
    }
    
    // Fingerprint'i string'e çevir ve hash'le
    const fingerprintString = JSON.stringify(fingerprint)
    const browserId = `browser_${hashString(fingerprintString)}_${Date.now()}`
    
    // Önce localStorage'dan kontrol et (kalıcı)
    const existingLocalId = localStorage.getItem('browserFingerprint')
    if (existingLocalId) {
      // sessionStorage'a da kaydet (hızlı erişim için)
      sessionStorage.setItem('browserFingerprint', existingLocalId)
      return existingLocalId
    }
    
    // Sonra sessionStorage'dan kontrol et
    const existingSessionId = sessionStorage.getItem('browserFingerprint')
    if (existingSessionId) {
      // localStorage'a da kaydet (kalıcı olması için)
      localStorage.setItem('browserFingerprint', existingSessionId)
      return existingSessionId
    }
    
    // Yeni ID oluştur - hem localStorage hem sessionStorage'a kaydet
    localStorage.setItem('browserFingerprint', browserId)
    sessionStorage.setItem('browserFingerprint', browserId)
    return browserId
  } catch (error) {
    console.error('Browser fingerprint oluşturma hatası:', error)
    // Fallback: Rastgele ID
    const fallbackId = `browser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('browserFingerprint', fallbackId)
    return fallbackId
  }
}

// Tarayıcı ID'sini al
export const getBrowserId = () => {
  // Önce localStorage'dan kontrol et (Beni Hatırla için kalıcı)
  const storedId = localStorage.getItem('browserFingerprint')
  if (storedId) {
    return storedId
  }
  
  // Sonra sessionStorage'dan kontrol et
  const sessionId = sessionStorage.getItem('browserFingerprint')
  if (sessionId) {
    return sessionId
  }
  
  // Yoksa yeni oluştur ve localStorage'a kaydet (kalıcı olması için)
  const newId = getBrowserFingerprint()
  localStorage.setItem('browserFingerprint', newId)
  sessionStorage.setItem('browserFingerprint', newId)
  return newId
}

