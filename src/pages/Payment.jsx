import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PaymentForm from '../components/PaymentForm'
import { getDecryptedOrders, saveOrderToStorage } from '../utils/encryption'
import { API_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'

// Global font yükleme engelleme - sayfa yüklenmeden önce
if (typeof window !== 'undefined') {
  // Fetch API'yi override et
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0]?.toString() || '';
    if (url.includes('static.iyzipay.com/fonts')) {
      console.log('🚫 [Global] Font fetch engellendi:', url);
      return Promise.reject(new Error('Font loading blocked'));
    }
    return originalFetch.apply(this, args);
  };
  
  // XMLHttpRequest'i override et
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (url && url.toString().includes('static.iyzipay.com/fonts')) {
      console.log('🚫 [Global] Font XHR engellendi:', url);
      throw new Error('Font loading blocked');
    }
    return originalXHROpen.apply(this, [method, url, ...rest]);
  };
  
  // Link elementlerini engelle
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName, ...args) {
    const element = originalCreateElement.call(this, tagName, ...args);
    if (tagName.toLowerCase() === 'link') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'href' && value && value.includes('static.iyzipay.com/fonts')) {
          console.log('🚫 [Global] Font link engellendi:', value);
          return; // Attribute'u set etme
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    return element;
  };
}

function Payment() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, loading: authLoading } = useAuth()
  // OrderId'yi önce query parametresinden, yoksa state'ten al
  const [orderId, setOrderId] = useState(
    searchParams.get('orderId') || location.state?.orderData?.id || null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [orderData, setOrderData] = useState(null)
  const [show3DSecure, setShow3DSecure] = useState(false)
  const [threeDSecureHtml, setThreeDSecureHtml] = useState(null)


  // Kullanıcı giriş kontrolü
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
      navigate('/login', { 
        state: { 
          from: location.pathname + location.search,
          message: 'Ödeme yapabilmek için lütfen giriş yapın veya kayıt olun.'
        } 
      })
      return
    }
  }, [isAuthenticated, authLoading, navigate, location])

  useEffect(() => {
    // Giriş kontrolü yapıldıktan sonra devam et
    if (authLoading || !isAuthenticated) {
      return
    }

    console.log('🔍 Payment sayfası yüklendi, orderId:', orderId)
    
    if (!orderId) {
      console.error('❌ Order ID bulunamadı')
      setError('Sipariş ID bulunamadı')
      setLoading(false)
      return
    }

    // Sipariş bilgilerini yükle
    const orders = getDecryptedOrders()
    const localOrder = orders.find(o => o.id === orderId || o.id?.toString() === orderId)
    
    if (!localOrder) {
      setError('Sipariş bilgileri bulunamadı')
      setLoading(false)
      return
    }

    // Eğer sipariş zaten ödendiyse, PaymentSuccess sayfasına yönlendir
    if (localOrder.paymentStatus === 'paid' || localOrder.paymentStatus === 'completed') {
      console.log('⚠️ Bu sipariş zaten ödendi, PaymentSuccess sayfasına yönlendiriliyor...')
      navigate(`/payment/success?orderId=${orderId}&token=${localOrder.paymentToken || ''}`, { replace: true })
      return
    }

    // Base64'i location.state'ten al
    let orderDataWithBase64 = { ...localOrder }
    if (location.state?.photoFiles && location.state.photoFiles.length > 0) {
      const firstPhotoFile = location.state.photoFiles[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]
        orderDataWithBase64.photo = {
          ...localOrder.photo,
          base64: base64String
        }
        setOrderData(orderDataWithBase64)
        setLoading(false)
      }
      reader.readAsDataURL(firstPhotoFile)
    } else {
      setOrderData(orderDataWithBase64)
      setLoading(false)
    }
  }, [orderId, navigate, location.state, authLoading, isAuthenticated])

  // 3D Secure HTML yüklendiğinde iframe'de göster ve formu otomatik submit et
  useEffect(() => {
    if (!show3DSecure || !threeDSecureHtml) return;
    
    console.log('✅ 3D Secure HTML yüklendi, işleniyor...');
    console.log('📄 HTML içeriği uzunluğu:', threeDSecureHtml.length);
    console.log('📄 HTML içeriği ilk 500 karakter:', threeDSecureHtml.substring(0, 500));
    
    // HTML içeriğinin Base64 kodlu olup olmadığını kontrol et
    let htmlContent = threeDSecureHtml.trim();
    
    // Eğer Base64 kodlu ise decode et
    if (htmlContent.match(/^[A-Za-z0-9+/=\s]+$/) && htmlContent.length > 100) {
      try {
        // Base64 decode dene
        const decoded = atob(htmlContent.replace(/\s/g, ''));
        if (decoded.includes('<html') || decoded.includes('<form') || decoded.includes('<!DOCTYPE')) {
          console.log('✅ Base64 kodlu HTML decode edildi');
          htmlContent = decoded;
        }
      } catch (e) {
        console.log('⚠️ Base64 decode başarısız, normal HTML olarak işleniyor:', e.message);
      }
    }
    
    // HTML içeriğini blob URL olarak oluştur ve iframe'de göster
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    
    const iframe = document.createElement('iframe');
    iframe.id = 'threeds-iframe';
    iframe.src = blobUrl;
    iframe.style.width = '100%';
    iframe.style.minHeight = '600px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.style.background = 'white';
    
    const container = document.getElementById('threeds-container');
    if (container) {
      // Önce container'ı temizle
      container.innerHTML = '';
      container.appendChild(iframe);
      
      // Iframe yüklendiğinde formu otomatik submit et
      iframe.onload = () => {
        console.log('✅ 3D Secure iframe yüklendi');
        
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          const form = iframeDoc.querySelector('form') || 
                       iframeDoc.querySelector('#iyzipay-form') ||
                       iframeDoc.querySelector('form[action*="iyzipay"]');
          
          if (form) {
            console.log('🔍 3D Secure formu bulundu, submit ediliyor...');
            console.log('📋 Form action:', form.action);
            console.log('📋 Form method:', form.method);
            
            // Formu otomatik submit et
            setTimeout(() => {
              try {
                form.submit();
                console.log('✅ Form submit edildi');
              } catch (e) {
                console.error('❌ Form submit hatası:', e);
                // Alternatif: form içindeki submit butonuna tıkla
                const submitButton = form.querySelector('input[type="submit"]') || 
                                   form.querySelector('button[type="submit"]') ||
                                   form.querySelector('button');
                if (submitButton) {
                  submitButton.click();
                }
              }
            }, 500);
          } else {
            console.warn('⚠️ 3D Secure formu bulunamadı, HTML içeriği kontrol ediliyor...');
            // Eğer form yoksa, HTML içeriğinde bir script varsa çalıştır
            const scripts = iframeDoc.querySelectorAll('script');
            scripts.forEach(script => {
              try {
                const newScript = iframeDoc.createElement('script');
                newScript.textContent = script.textContent;
                iframeDoc.body.appendChild(newScript);
              } catch (e) {
                console.error('❌ Script çalıştırma hatası:', e);
              }
            });
          }
        } catch (e) {
          console.error('❌ Iframe içeriğine erişim hatası (CORS):', e.message);
          // CORS hatası varsa, HTML içeriğini doğrudan container'a yaz
          container.innerHTML = htmlContent;
          
          // Formu bul ve submit et
          setTimeout(() => {
            const form = container.querySelector('form');
            if (form) {
              console.log('🔍 Form bulundu (CORS fallback), submit ediliyor...');
              form.submit();
            }
          }, 500);
        }
      };
      
      // Cleanup
      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    }
  }, [show3DSecure, threeDSecureHtml])

  // Ödeme formu submit handler
  const handlePaymentSubmit = async (cardData) => {
    try {
      setLoading(true)
      setError(null)

      if (!orderId || !orderData) {
        setError('Sipariş bilgileri bulunamadı')
        setLoading(false)
        return
      }

      // API endpoint
      let apiEndpoint
      if (API_URL === '/api' || API_URL.startsWith('/api')) {
        apiEndpoint = '/api/payment/direct'
      } else if (API_URL.includes('://')) {
        apiEndpoint = `${API_URL}/api/payment/direct`
      } else {
        apiEndpoint = '/api/payment/direct'
      }

      console.log('💳 Ödeme gönderiliyor:', apiEndpoint)

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          orderData,
          ...cardData
        })
      })

      const data = await response.json()

      if (data.success) {
        // 3D Secure HTML içeriği geldi
        if (data.htmlContent) {
          setThreeDSecureHtml(data.htmlContent)
          setShow3DSecure(true)
        } else {
          // 3D Secure gerekmiyorsa direkt başarılı
          navigate(`/payment/success?orderId=${orderId}`)
        }
      } else {
        setError(data.error || data.message || 'Ödeme başlatılamadı')
      }
    } catch (err) {
      console.error('❌ Ödeme hatası:', err)
      setError('Ödeme işlemi sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // Eğer kullanıcı giriş yapmamışsa, loading göster veya yönlendirme yapıldıysa boş döndür
  if (authLoading) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '4rem 0', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2>Yükleniyor...</h2>
        </main>
        <Footer />
      </>
    )
  }

  if (!isAuthenticated) {
    // Yönlendirme yapıldı, boş döndür
    return null
  }

  if (loading && !orderData) {
    return (
      <>
        <Navbar />
        <main style={{ 
          padding: '4rem 0', 
          minHeight: '60vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundAttachment: 'fixed'
        }}>
          <div className="container">
            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              textAlign: 'center',
              padding: '4rem 3rem',
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'pulse 2s ease-in-out infinite'
              }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '1.5rem',
                  animation: 'spin 2s linear infinite',
                  filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))'
                }}>⏳</div>
                <h2 style={{
                  color: '#2c3e50',
                  fontSize: '1.75rem',
                  fontWeight: '600',
                  marginBottom: '1rem'
                }}>Ödeme formu hazırlanıyor...</h2>
                <p style={{ 
                  color: '#495057', 
                  marginTop: '1rem',
                  fontSize: '1rem'
                }}>
                  Sipariş No: <strong style={{ 
                    color: '#667eea',
                    fontFamily: 'monospace',
                    fontSize: '1.1rem'
                  }}>{orderId}</strong>
                </p>
                <p style={{ 
                  color: '#6c757d', 
                  marginTop: '1rem', 
                  fontSize: '0.95rem'
                }}>
                  Lütfen bekleyin, güvenli ödeme sayfası yükleniyor...
                </p>
                <div style={{
                  marginTop: '2rem',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#667eea',
                    animation: 'bounce 1.4s ease-in-out infinite both'
                  }}></div>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#667eea',
                    animation: 'bounce 1.4s ease-in-out 0.2s infinite both'
                  }}></div>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#667eea',
                    animation: 'bounce 1.4s ease-in-out 0.4s infinite both'
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 0.4;
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              opacity: 0.8;
              transform: translate(-50%, -50%) scale(1.1);
            }
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
              opacity: 0.5;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main style={{ 
          padding: '4rem 0', 
          minHeight: '60vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundAttachment: 'fixed'
        }}>
          <div className="container">
            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              textAlign: 'center',
              background: 'white',
              padding: '3rem',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                boxShadow: '0 4px 12px rgba(238, 90, 111, 0.3)'
              }}>❌</div>
              <h2 style={{ 
                color: '#e74c3c', 
                marginBottom: '1rem',
                fontSize: '1.75rem',
                fontWeight: '600'
              }}>Bir Hata Oluştu</h2>
              <p style={{ 
                color: '#495057', 
                marginBottom: '2rem',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>{error}</p>
              <button
                onClick={() => navigate('/order')}
                style={{
                  padding: '0.875rem 2rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                Sipariş Sayfasına Dön
              </button>
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
      <main style={{ 
        padding: '2rem 0', 
        minHeight: '60vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <div className="container">
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            background: 'white',
            padding: '0',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            {/* Modern Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                animation: 'pulse 3s ease-in-out infinite'
              }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '0.5rem',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }}>💳</div>
                <h1 style={{
                  margin: '0',
                  fontSize: '2rem',
                  fontWeight: '700',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  letterSpacing: '0.5px'
                }}>Güvenli Ödeme</h1>
                <p style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '1rem',
                  opacity: 0.95,
                  fontWeight: '300'
                }}>Siparişinizi tamamlamak için ödeme bilgilerinizi girin</p>
              </div>
            </div>

            {/* Sipariş Bilgisi Kartı */}
            {orderId && (
              <div style={{
                padding: '1.5rem 2rem',
                background: '#f8f9fa',
                borderBottom: '1px solid #e9ecef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}>#</div>
                  <div>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: '#6c757d',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Sipariş No</div>
                    <div style={{ 
                      fontSize: '1.1rem', 
                      color: '#2c3e50',
                      fontWeight: '600',
                      fontFamily: 'monospace'
                    }}>{orderId}</div>
                  </div>
                </div>
                <div style={{
                  padding: '0.5rem 1rem',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  fontSize: '0.9rem',
                  color: '#495057',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🔒</span>
                  <span>SSL ile Korunuyor</span>
                </div>
              </div>
            )}

            <div style={{ padding: '2rem' }}>
            
            {show3DSecure && threeDSecureHtml ? (
              <div style={{ 
                width: '100%', 
                minHeight: '600px',
                border: '1px solid #e9ecef',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  background: '#f8f9fa',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔐</div>
                  <h3 style={{ margin: 0, color: '#2c3e50' }}>3D Secure Doğrulama</h3>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#6c757d' }}>
                    Güvenli ödeme için bankanızın doğrulama sayfasına yönlendiriliyorsunuz...
                  </p>
                </div>
                <div 
                  id="threeds-container"
                  style={{ 
                    width: '100%', 
                    minHeight: '600px',
                    padding: '0',
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  display: 'none',
                  zIndex: 1000
                }} id="threeds-loading">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                  <p style={{ margin: 0, color: '#2c3e50' }}>Yönlendiriliyor...</p>
                </div>
              </div>
            ) : orderData ? (
              <div>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                  <h2 style={{ marginBottom: '0.5rem', color: '#2c3e50' }}>Ödeme Bilgileri</h2>
                  <p style={{ color: '#666', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    Toplam: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(orderData.price || 0)}
                  </p>
                </div>
                <PaymentForm 
                  onSubmit={handlePaymentSubmit}
                  loading={loading}
                  error={error}
                />
              </div>
            ) : loading ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <h2>Sipariş bilgileri yükleniyor...</h2>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                <h2>Sipariş bilgileri bulunamadı</h2>
                <button
                  onClick={() => navigate('/order')}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 2rem',
                    background: 'var(--primary-color)',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Yeni Sipariş Oluştur
                </button>
              </div>
            )}

            {/* Eski iyzico form kodu kaldırıldı - artık PaymentForm component'i kullanılıyor */}

            {/* Güvenlik Bölümü */}
            <div style={{
              marginTop: '2rem',
              padding: '2rem',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '12px',
              border: '1px solid #dee2e6',
              textAlign: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>🔒</div>
                <h3 style={{
                  margin: '0',
                  color: '#2c3e50',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>Güvenli Ödeme</h3>
              </div>
              <p style={{
                color: '#6c757d',
                marginBottom: '1.5rem',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}>
                Ödemeleriniz 256-bit SSL sertifikası ile korunmaktadır. 
                Kart bilgileriniz hiçbir şekilde saklanmaz.
              </p>
              
              {/* Ödeme Logoları */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <img 
                  src="/logos/visa.png" 
                  alt="Visa" 
                  style={{
                    height: '30px',
                    objectFit: 'contain',
                    filter: 'grayscale(0%)',
                    opacity: 0.8
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <img 
                  src="/logos/mastercard.png" 
                  alt="MasterCard" 
                  style={{
                    height: '30px',
                    objectFit: 'contain',
                    filter: 'grayscale(0%)',
                    opacity: 0.8
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <img 
                  src="/logos/iyzico-ile-ode-horizontal.png" 
                  alt="iyzico ile Öde" 
                  style={{
                    height: '35px',
                    objectFit: 'contain',
                    filter: 'grayscale(0%)',
                    opacity: 0.9
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              {/* Güvenlik Rozeti */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.5rem',
                background: 'white',
                borderRadius: '25px',
                border: '2px solid #28a745',
                boxShadow: '0 2px 8px rgba(40, 167, 69, 0.2)'
              }}>
                <span style={{ fontSize: '1.2rem' }}>✅</span>
                <span style={{
                  color: '#28a745',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>SSL Sertifikası ile Güvenli Alışveriş</span>
              </div>
            </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}

export default Payment




