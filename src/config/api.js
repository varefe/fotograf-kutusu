// API Configuration
// Production'da backend aynı domain'de çalışıyorsa '/api' kullanın
// Backend ayrı bir sunucuda çalışıyorsa tam URL'i belirtin

const getApiUrl = () => {
  // Environment variable varsa onu kullan (en yüksek öncelik)
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim()
    // Eğer URL zaten /api ile bitiyorsa veya /api içeriyorsa, olduğu gibi döndür
    return url
  }
  
  // Production ortamında (localhost değilse)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Railway backend URL'i - /api eklemeyin, çünkü route'larda zaten /api var
    const railwayUrl = 'https://heartfelt-embrace-production-3c74.up.railway.app'
    console.log('🌐 Production API URL:', railwayUrl)
    return railwayUrl
    
    // Eğer backend aynı sunucudaysa (mod_proxy ile):
    // return '/api'
    
    // Eğer backend ayrı subdomain'deyse (örn: api.fotografkutusu.com):
    // return 'https://api.fotografkutusu.com'
  }
  
  // Development ortamında
  const devUrl = 'http://localhost:5001'
  console.log('🌐 Development API URL:', devUrl)
  return devUrl
}

export const API_URL = getApiUrl()


