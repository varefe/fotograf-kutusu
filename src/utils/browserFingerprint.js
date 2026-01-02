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
    
    // sessionStorage'da sakla (tarayıcı kapanınca silinir, her oturum için yeni)
    // Ama aynı tarayıcıda aynı ID'yi kullan
    const existingId = sessionStorage.getItem('browserFingerprint')
    if (existingId) {
      return existingId
    }
    
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
  return sessionStorage.getItem('browserFingerprint') || getBrowserFingerprint()
}

