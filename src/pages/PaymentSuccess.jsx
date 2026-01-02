import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { getDecryptedOrders } from '../utils/encryption'

function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, getAuthHeaders } = useAuth()
  const token = searchParams.get('token')
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Sayfa her yüklendiğinde benzersiz bir ID oluştur (yeni sayfa garantisi)
  const [pageId] = useState(() => `success_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    // Eğer orderId yoksa ve sayfa direkt açıldıysa, ana sayfaya yönlendir
    if (!orderId) {
      console.warn('⚠️ PaymentSuccess sayfası orderId olmadan açıldı, ana sayfaya yönlendiriliyor...')
      navigate('/', { replace: true })
      return
    }
    
    // ÖNEMLİ: Ödeme başarılı oldu, şimdi siparişi backend'e kaydet
    // Önce localStorage'da ödeme durumunu işaretle (tekrar ödeme sayfasına gelinmesini engelle)
    const paymentStatusKey = `payment_status_${orderId}`
    localStorage.setItem(paymentStatusKey, 'paid')
    
    // Sayfa ID'sini de kaydet (her ödeme için yeni sayfa garantisi)
    localStorage.setItem(`payment_success_page_${orderId}`, pageId)
    
    // localStorage'daki siparişin paymentStatus'unu güncelle
    const orders = getDecryptedOrders()
    const localOrder = orders.find(o => o.id === orderId || o.id?.toString() === orderId)
    if (localOrder) {
      localOrder.paymentStatus = 'paid'
      localOrder.paymentToken = token || ''
      // Güncellenmiş siparişi tekrar kaydet
      try {
        const encrypted = JSON.stringify(localOrder)
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        const orderIndex = existingOrders.findIndex((o) => {
          try {
            const decrypted = JSON.parse(atob(o))
            return decrypted.id === orderId || decrypted.id?.toString() === orderId
          } catch {
            return false
          }
        })
        if (orderIndex !== -1) {
          existingOrders[orderIndex] = btoa(encrypted)
          localStorage.setItem('orders', JSON.stringify(existingOrders))
        }
      } catch (err) {
        console.error('localStorage güncelleme hatası:', err)
      }
    }
    
    saveOrderToBackend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, token, pageId])

  const saveOrderToBackend = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 
        (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
          ? '/api' 
          : 'http://localhost:5000')
      
      // localStorage'dan siparişi bul
      const orders = getDecryptedOrders()
      const localOrder = orders.find(o => o.id === orderId || o.id?.toString() === orderId)
      
      if (localOrder) {
        console.log('✅ localStorage\'da sipariş bulundu, backend\'e kaydediliyor...')
        
        // Backend'e siparişi kaydet (kullanıcı giriş yapmışsa token ile)
        const headers = {
          'Content-Type': 'application/json',
          ...(isAuthenticated ? getAuthHeaders() : {})
        }

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
            notes: '',
            paymentStatus: 'paid', // Ödeme yapıldı
            status: 'Ödeme Alındı',
            userId: user ? user.id : null // Kullanıcı giriş yapmışsa userId ekle
          })
        })
        
        if (createResponse.ok) {
          const result = await createResponse.json()
          const savedOrder = result.order
          
          if (savedOrder) {
            console.log('✅ Sipariş backend\'e kaydedildi (ödeme durumu ile):', savedOrder._id || savedOrder.id)
            
            // Ödeme durumunu localStorage'da da güncelle
            const paymentStatusKey = `payment_status_${orderId}`
            localStorage.setItem(paymentStatusKey, 'paid')
            
            // Sipariş ID'sini backend'den gelen ID ile güncelle
            if (savedOrder._id || savedOrder.id) {
              const newOrderId = savedOrder._id || savedOrder.id
              localStorage.setItem(`payment_status_${newOrderId}`, 'paid')
            }
            
            setOrder(savedOrder)
            setLoading(false)
            return
          }
        }
      }
      
      // Eğer localStorage'da yoksa veya kaydetme başarısız olduysa, backend'den dene
      const orderIdInt = parseInt(orderId)
      if (!isNaN(orderIdInt) && orderIdInt < 1000000000000) {
        // Veritabanında var, getir
        const response = await fetch(`${API_URL}/api/orders/${orderIdInt}`)
        const data = await response.json()
        
        if (data.success && data.order) {
          setOrder(data.order)
        } else {
          setError(data.error || 'Sipariş detayları yüklenemedi')
        }
      } else {
        // Timestamp formatında ama localStorage'da yok
        setError('Sipariş bilgileri bulunamadı')
      }
    } catch (err) {
      console.error('Sipariş kaydetme/yükleme hatası:', err)
      setError('Sipariş işlenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '4rem 0', minHeight: '60vh' }}>
          <div className="container">
            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              textAlign: 'center',
              padding: '3rem'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>⏳</div>
              <h2>Sipariş detayları yükleniyor...</h2>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
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
            }}>✅</div>
            <h1 style={{
              color: '#2c3e50',
              marginBottom: '1rem'
            }}>Ödeme Başarılı!</h1>
            <p style={{
              color: '#666',
              marginBottom: '2rem',
              fontSize: '1.1rem'
            }}>
              Siparişiniz başarıyla alındı. En kısa sürede işleme alınacaktır.
            </p>
            
            {error && (
              <div style={{
                background: '#fee',
                padding: '1rem',
                borderRadius: '8px',
                color: '#c33',
                marginBottom: '2rem'
              }}>
                <p>{error}</p>
              </div>
            )}

            {order && (
              <div style={{
                background: '#f9fafb',
                padding: '2rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                <h2 style={{
                  color: '#2c3e50',
                  marginBottom: '1.5rem',
                  fontSize: '1.5rem',
                  borderBottom: '2px solid #3498db',
                  paddingBottom: '0.5rem'
                }}>Sipariş Detayları</h2>
                
                <div style={{
                  display: 'grid',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '6px'
                  }}>
                    <strong>Sipariş No:</strong>
                    <span>#{order._id || order.id}</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '6px'
                  }}>
                    <strong>Boyut:</strong>
                    <span>
                      {order.size === 'custom' && order.customSize
                        ? `${order.customSize.width}x${order.customSize.height} cm`
                        : order.size || '-'}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '6px'
                  }}>
                    <strong>Adet:</strong>
                    <span>{order.quantity || 1}</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '6px'
                  }}>
                    <strong>Çerçeve:</strong>
                    <span>
                      {order.frameType === 'none' ? 'Çerçevesiz' :
                       order.frameType === 'standard' ? 'Standart Çerçeve' :
                       order.frameType === 'premium' ? 'Premium Çerçeve' : '-'}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '6px'
                  }}>
                    <strong>Kağıt Tipi:</strong>
                    <span>
                      {order.paperType === 'glossy' ? 'Parlak' :
                       order.paperType === 'matte' ? 'Mat' :
                       order.paperType === 'satin' ? 'Saten' : '-'}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '6px'
                  }}>
                    <strong>Renk Modu:</strong>
                    <span>
                      {order.colorMode === 'color' ? 'Renkli' :
                       order.colorMode === 'blackwhite' ? 'Siyah-Beyaz' :
                       order.colorMode === 'sepia' ? 'Sepya' : '-'}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '6px'
                  }}>
                    <strong>Kargo:</strong>
                    <span>
                      {order.shippingType === 'standard' ? 'Standart Kargo' :
                       order.shippingType === 'express' ? 'Express Kargo' : '-'}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '6px'
                  }}>
                    <strong>E-posta:</strong>
                    <span>{order.customerInfo?.email || '-'}</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '6px'
                  }}>
                    <strong>Telefon:</strong>
                    <span>{order.customerInfo?.phone || '-'}</span>
                  </div>
                  
                  <div style={{
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '6px'
                  }}>
                    <strong>Adres:</strong>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                      {order.customerInfo?.address || '-'}
                    </p>
                  </div>
                  
                  {order.photo?.base64 && (
                    <div style={{
                      padding: '0.75rem',
                      background: 'white',
                      borderRadius: '6px'
                    }}>
                      <strong>Fotoğraf:</strong>
                      <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                        <img 
                          src={`data:${order.photo.mimetype || 'image/jpeg'};base64,${order.photo.base64}`}
                          alt="Sipariş fotoğrafı"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: '#3498db',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    marginTop: '0.5rem'
                  }}>
                    <span>Toplam Tutar:</span>
                    <span>{formatPrice(order.price || 0)}</span>
                  </div>
                  
                  <div style={{
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    color: '#666'
                  }}>
                    <strong>Sipariş Tarihi:</strong> {formatDate(order.createdAt)}
                  </div>
                </div>
              </div>
            )}
            
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
              <Link
                to="/"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 2rem',
                  background: '#3498db',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  transition: 'background 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#2980b9'}
                onMouseLeave={(e) => e.target.style.background = '#3498db'}
              >
                Ana Sayfaya Dön
              </Link>
              <Link
                to="/order"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 2rem',
                  background: '#27ae60',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  transition: 'background 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#229954'}
                onMouseLeave={(e) => e.target.style.background = '#27ae60'}
              >
                Yeni Sipariş
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default PaymentSuccess






