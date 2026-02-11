// API Configuration
// Production'da backend aynı domain'de çalışıyorsa '/api' kullanın
// Backend ayrı bir sunucuda çalışıyorsa tam URL'i belirtin

const getApiUrl = () => {
  // Environment variable varsa onu kullan (en yüksek öncelik)
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim()
    return url
  }
  // Production ortamında (localhost değilse) — backend production'da (Railway) çalışıyor
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    const productionUrl = 'https://heartfelt-embrace-production-8a92.up.railway.app'
    console.log('🌐 Production API URL (backend oradan alınıyor):', productionUrl)
    return productionUrl
  }
  const devUrl = 'http://localhost:5001'
  console.log('🌐 Development API URL:', devUrl)
  return devUrl
}

export const API_URL = getApiUrl()


