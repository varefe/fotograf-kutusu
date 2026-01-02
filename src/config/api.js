// API Configuration
// Production'da backend aynı domain'de çalışıyorsa '/api' kullanın
// Backend ayrı bir sunucuda çalışıyorsa tam URL'i belirtin

const getApiUrl = () => {
  // Environment variable varsa onu kullan (en yüksek öncelik)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Production ortamında (localhost değilse)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Backend aynı sunucuda çalışıyorsa (mod_proxy ile):
    return '/api'
    
    // Eğer backend ayrı bir sunucudaysa (Render.com, Railway, vb.):
    // return 'https://fotograf-backend.onrender.com'
    
    // Eğer backend ayrı subdomain'deyse (örn: api.fotografkutusu.com):
    // return 'https://api.fotografkutusu.com'
  }
  
  // Development ortamında
  return 'http://localhost:5000'
}

export const API_URL = getApiUrl()


