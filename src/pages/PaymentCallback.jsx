import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

/**
 * PaymentCallback - Iyzico callback'ini backend'e yönlendirir
 * 
 * Iyzico bazen callback'i frontend'e gönderir, bu durumda
 * bu component callback'i backend'e yönlendirir.
 */
function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    // Backend URL'ini al
    const getBackendUrl = () => {
      // Production'da Railway backend URL'i
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return 'https://heartfelt-embrace-production-3c74.up.railway.app'
      }
      // Development'da localhost
      return 'http://localhost:5000'
    }

    const backendUrl = getBackendUrl()
    
    // Tüm query parametrelerini al
    const queryString = searchParams.toString()
    const callbackUrl = `${backendUrl}/api/payment/callback${queryString ? `?${queryString}` : ''}`
    
    console.log('🔄 Callback frontend\'e geldi, backend\'e yönlendiriliyor:', callbackUrl)
    
    // Backend'e yönlendir
    window.location.href = callbackUrl
  }, [searchParams])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{
        fontSize: '2rem',
        marginBottom: '1rem'
      }}>⏳</div>
      <p>Ödeme işlemi kontrol ediliyor...</p>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>Yönlendiriliyor...</p>
    </div>
  )
}

export default PaymentCallback

