// API Configuration
// Production'da backend aynı domain'de çalışıyorsa '/api' kullanın
// Backend ayrı bir sunucuda çalışıyorsa tam URL'i belirtin

const getApiUrl = () => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H3',location:'api.js:getApiUrl',message:'getApiUrl called',data:{hostname:window.location.hostname,hasViteApiUrl:!!import.meta.env.VITE_API_URL,viteApiUrl:import.meta.env.VITE_API_URL}})}).catch(()=>{});
  // #endregion
  
  // Environment variable varsa onu kullan (en yüksek öncelik)
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim()
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H3',location:'api.js:getApiUrl',message:'Using VITE_API_URL',data:{url}})}).catch(()=>{});
    // #endregion
    // Eğer URL zaten /api ile bitiyorsa veya /api içeriyorsa, olduğu gibi döndür
    return url
  }
  
  // Production ortamında (localhost değilse)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Render backend URL'i
    const renderUrl = 'https://fotograf-kutusu.onrender.com'
    console.log('🌐 Production API URL:', renderUrl)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H3',location:'api.js:getApiUrl',message:'Using production Render URL',data:{renderUrl}})}).catch(()=>{});
    // #endregion
    return renderUrl
    
    // Eğer backend aynı sunucudaysa (mod_proxy ile):
    // return '/api'
    
    // Eğer backend ayrı subdomain'deyse (örn: api.fotografkutusu.com):
    // return 'https://api.fotografkutusu.com'
  }
  
  // Development ortamında
  const devUrl = 'http://localhost:5001'
  console.log('🌐 Development API URL:', devUrl)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H3',location:'api.js:getApiUrl',message:'Using development localhost URL',data:{devUrl}})}).catch(()=>{});
  // #endregion
  return devUrl
}

export const API_URL = getApiUrl()


