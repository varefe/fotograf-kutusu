// API Configuration
// Production'da backend aynı domain'de çalışıyorsa '/api' kullanın
// Backend ayrı bir sunucuda çalışıyorsa tam URL'i belirtin

const getApiUrl = () => {
  // Environment variable varsa onu kullan
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Production ortamında (localhost değilse)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // GEÇİCİ ÇÖZÜM: Production backend çalışmadığı için localhost backend'e bağlan
    // Not: Bu sadece backend localhost'ta çalışırken işe yarar
    // Production backend hazır olunca aşağıdaki satırları güncelle
    
    // Seçenek 1: Relative path (production backend çalışıyorsa)
    // return '/api'
    
    // Seçenek 2: Localhost backend (GEÇİCİ - sadece test için)
    // Not: Bu sadece sizin bilgisayarınızda çalışır
    // return 'http://localhost:5000'
    
    // Seçenek 3: Ayrı subdomain (backend subdomain'de çalışıyorsa)
    // return 'https://api.fotografkutusu.com'
    
    // Şimdilik relative path dene, çalışmazsa hata verecek
    return '/api'
  }
  
  // Development ortamında
  return 'http://localhost:5000'
}

export const API_URL = getApiUrl()


