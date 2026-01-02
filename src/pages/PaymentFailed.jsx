import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getDecryptedOrders } from '../utils/encryption'
import { API_URL } from '../config/api'

function PaymentFailed() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const reason = searchParams.get('reason') // 'cancelled' veya 'failed'
  const { clearCart } = useCart() // Sepeti temizlememek için
  const { user, isAuthenticated, getAuthHeaders } = useAuth()
  const [orderId] = useState(() => {
    // Önce location.state'ten al
    if (location.state?.orderData?.id) {
      return location.state.orderData.id
    }
    // Sonra URL'den al
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('orderId')
  })
  const [orderSaved, setOrderSaved] = useState(false)

  useEffect(() => {
    // İptal edilen siparişi backend'e kaydet
    if (orderId && !orderSaved) {
      saveCancelledOrderToBackend()
    }

    // 3 saniye sonra ana sayfaya yönlendir
    const timer = setTimeout(() => {
      navigate('/', { replace: true })
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate, orderId, orderSaved])

  const saveCancelledOrderToBackend = async () => {
    try {
      // localStorage'dan siparişi bul
      const orders = getDecryptedOrders()
      const localOrder = orders.find(o => o.id === orderId || o.id?.toString() === orderId)
      
      if (localOrder) {
        console.log('✅ İptal edilen sipariş backend\'e kaydediliyor, orderId:', orderId)
        
        // Backend'e siparişi kaydet (kullanıcı giriş yapmışsa token ile)
        const headers = {
          'Content-Type': 'application/json',
          ...(isAuthenticated ? getAuthHeaders() : {})
        }

        const paymentStatus = reason === 'cancelled' ? 'cancelled' : 'failed'
        const status = reason === 'cancelled' ? 'İptal Edildi' : 'Ödeme Başarısız'

        const createResponse = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            photo: localOrder.photo,
            size: localOrder.size,
            customSize: localOrder.customSize,
            quantity: localOrder.quantity,
            frameType: localOrder.frameType,
            paperType: localOrder.paperType,
            colorMode: localOrder.colorMode,
            shippingType: localOrder.shippingType,
            email: localOrder.customerInfo?.email || localOrder.email,
            address: localOrder.customerInfo?.address || localOrder.address,
            phone: localOrder.customerInfo?.phone || localOrder.phone,
            firstName: localOrder.customerInfo?.firstName || 'Müşteri',
            lastName: localOrder.customerInfo?.lastName || 'Müşteri',
            price: localOrder.price,
            notes: reason === 'cancelled' ? 'Ödeme iptal edildi' : 'Ödeme başarısız oldu',
            paymentStatus: paymentStatus,
            status: status,
            userId: user ? user.id : null // Kullanıcı giriş yapmışsa userId ekle
          })
        })
        
        if (createResponse.ok) {
          console.log('✅ İptal edilen sipariş backend\'e kaydedildi')
          setOrderSaved(true)
        } else {
          console.error('❌ İptal edilen sipariş kaydedilemedi:', await createResponse.text())
        }
      } else {
        console.warn('⚠️ localStorage\'da sipariş bulunamadı, orderId:', orderId)
      }
    } catch (error) {
      console.error('❌ İptal edilen sipariş kaydetme hatası:', error)
    }
  }

  const getMessage = () => {
    if (reason === 'cancelled') {
      return 'Ödeme işlemi iptal edildi. Ürünleriniz sepette kaldı, tekrar deneyebilirsiniz.'
    }
    return 'Ödeme işlemi tamamlanamadı. (Bakiye yetersiz veya kart bilgileri hatalı olabilir). Ürünleriniz sepette kaldı.'
  }

  return (
    <>
      <Navbar />
      <main style={{ padding: '4rem 0', minHeight: '60vh' }}>
        <div className="container">
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center',
            background: 'white',
            padding: '3rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem'
            }}>❌</div>
            <h1 style={{
              color: '#e74c3c',
              marginBottom: '1rem'
            }}>
              {reason === 'cancelled' ? 'Ödeme İptal Edildi' : 'Ödeme Başarısız'}
            </h1>
            <p style={{
              color: '#666',
              marginBottom: '2rem',
              fontSize: '1.1rem',
              lineHeight: '1.6'
            }}>
              {getMessage()}
            </p>
            <p style={{
              color: '#999',
              fontSize: '0.9rem',
              marginBottom: '2rem',
              fontStyle: 'italic'
            }}>
              Ana sayfaya yönlendiriliyorsunuz...
            </p>
            {token && (
              <p style={{
                color: '#999',
                fontSize: '0.9rem',
                marginBottom: '2rem'
              }}>
                İşlem No: {token.substring(0, 20)}...
              </p>
            )}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                  fontSize: '1rem'
                }}
                onMouseEnter={(e) => e.target.style.background = '#2980b9'}
                onMouseLeave={(e) => e.target.style.background = '#3498db'}
              >
                Ana Sayfaya Dön
              </button>
              <button
                onClick={() => navigate('/cart')}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                  fontSize: '1rem'
                }}
                onMouseEnter={(e) => e.target.style.background = '#229954'}
                onMouseLeave={(e) => e.target.style.background = '#27ae60'}
              >
                Sepete Git
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default PaymentFailed




















