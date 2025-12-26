import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getDecryptedOrders } from '../utils/encryption'

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
  const [orderId, setOrderId] = useState(searchParams.get('orderId'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paymentForm, setPaymentForm] = useState(null)


  useEffect(() => {
    console.log('🔍 Payment sayfası yüklendi, orderId:', orderId)
    
    if (!orderId) {
      console.error('❌ Order ID bulunamadı')
      setError('Sipariş ID bulunamadı')
      setLoading(false)
      return
    }

    // Ödeme formu oluştur
    console.log('🚀 Ödeme formu oluşturuluyor, orderId:', orderId)
    createPaymentForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  // Font URL'lerini engellemek için useEffect - Agresif yaklaşım
  useEffect(() => {
    if (!paymentForm) return;

    console.log('🚫 İyzico font yüklemeleri engelleniyor...');
    console.log('🌐 Mevcut domain:', window.location.origin);
    console.log('🌐 Service Worker durumu:', 'serviceWorker' in navigator ? 'Destekleniyor' : 'Desteklenmiyor');
    
    // Service Worker durumunu kontrol et
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          console.log('✅ Service Worker kayıtlı:', registration.scope);
        } else {
          console.warn('⚠️ Service Worker kayıtlı değil');
        }
      });
    }
    
    const fixFontUrls = () => {
      console.log('🔧 Font URL\'leri engelleniyor...');
      // Tüm style tag'lerindeki font URL'lerini kaldır veya değiştir
      let styleCount = 0;
      document.querySelectorAll('style').forEach((styleEl) => {
        if (styleEl.textContent && styleEl.textContent.includes('static.iyzipay.com/fonts')) {
          // Font URL'lerini kaldır veya boş string ile değiştir
          styleEl.textContent = styleEl.textContent.replace(
            /@font-face\s*\{[^}]*url\(['"]?https?:\/\/static\.iyzipay\.com\/fonts\/MarkPro\/[^"'\s\)]+['"]?\)[^}]*\}/gi,
            ''
          );
          styleEl.textContent = styleEl.textContent.replace(
            /https?:\/\/static\.iyzipay\.com\/fonts\/MarkPro\/[^"'\s\)<>]+/gi,
            ''
          );
          styleCount++;
        }
      });
      if (styleCount > 0) {
        console.log(`✅ Toplam ${styleCount} style tag\'deki font URL\'leri kaldırıldı`);
      }

      // Tüm link tag'lerindeki font URL'lerini kaldır
      let linkCount = 0;
      document.querySelectorAll('link').forEach((linkEl) => {
        if (linkEl.href && linkEl.href.includes('static.iyzipay.com/fonts')) {
          console.log('🚫 Font link kaldırılıyor:', linkEl.href);
          linkEl.remove();
          linkCount++;
        }
      });
      if (linkCount > 0) {
        console.log(`✅ Toplam ${linkCount} font link tag\'i kaldırıldı`);
      }
      
      // İframe içindeki font yüklemelerini kontrol et
      const iframes = document.querySelectorAll('iframe[src*="iyzipay"]');
      if (iframes.length > 0) {
        console.log(`⚠️ ${iframes.length} adet İyzico iframe bulundu`);
        console.log('💡 İframe içeriği cross-origin olduğu için font URL\'leri değiştirilemiyor');
        console.log('💡 Çözüm: Network seviyesinde font istekleri engelleniyor');
        
        // İframe'lere CSP ekle (mümkünse)
        iframes.forEach((iframe) => {
          try {
            // İframe içeriğine erişemeyiz ama parent'a CSP ekleyebiliriz
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
          } catch (e) {
            // Cross-origin iframe'e erişilemez
          }
        });
      }

      // @font-face kurallarını CSS stylesheet'lerinde değiştir
      try {
        for (let i = 0; i < document.styleSheets.length; i++) {
          const sheet = document.styleSheets[i];
          try {
            const rules = sheet.cssRules || sheet.rules;
            if (rules) {
              for (let j = 0; j < rules.length; j++) {
                if (rules[j].type === CSSRule.FONT_FACE_RULE) {
                  const fontFace = rules[j];
                  if (fontFace.style && fontFace.style.src) {
                    const originalSrc = fontFace.style.src;
                    if (originalSrc.includes('static.iyzipay.com')) {
                      fontFace.style.src = originalSrc.replace(
                        /https?:\/\/static\.iyzipay\.com\/fonts\/MarkPro\/([^"'\s\)<>]+)/gi,
                        `url('${fontProxyUrl}/$1')`
                      );
                      console.log('✅ @font-face kuralındaki font URL\'leri değiştirildi');
                    }
                  }
                }
              }
            }
          } catch (e) {
            // Cross-origin stylesheet hatası olabilir, devam et
          }
        }
      } catch (e) {
        // Stylesheet erişim hatası olabilir
      }
    };

    // İlk çalıştırma
    fixFontUrls();

    // MutationObserver ile dinamik olarak eklenen elementleri yakala
    const observer = new MutationObserver((mutations) => {
      let shouldFix = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              if (node.tagName === 'STYLE' || node.tagName === 'LINK' || 
                  node.querySelector && (node.querySelector('style') || node.querySelector('link'))) {
                shouldFix = true;
              }
            }
          });
        }
      });
      
      if (shouldFix) {
        setTimeout(fixFontUrls, 100);
      }
    });

    // Observer'ı başlat - payment form container'ını bul
    setTimeout(() => {
      const container = document.querySelector('.payment-form-container') || 
                       document.querySelector('[style*="minHeight: \'400px\'"]')?.parentElement ||
                       document.body;
      if (container) {
        observer.observe(container, {
          childList: true,
          subtree: true
        });
      }
    }, 100);

    // Periyodik kontrol (güvenlik için)
    const interval = setInterval(fixFontUrls, 2000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [paymentForm])

  const createPaymentForm = async () => {
    try {
      if (!orderId) {
        setError('Sipariş ID bulunamadı')
        setLoading(false)
        return
      }
      
      // API'ye istek gönder
      const API_URL = import.meta.env.VITE_API_URL || 
        (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
          ? '/api' 
          : 'http://localhost:5000')
      
      console.log('🌐 API URL:', API_URL)
      console.log('📤 Gönderilen orderId:', orderId)
      
      // DOĞRU AKIŞ: localStorage'dan sipariş bilgilerini al ve ödeme formu oluştur
      // Sipariş henüz backend'e kaydedilmedi, ödeme başarılı olursa kaydedilecek
      console.log('🔍 localStorage\'dan sipariş bilgileri alınıyor...')
      
      // localStorage'dan siparişi bul
      const orders = getDecryptedOrders()
      const localOrder = orders.find(o => o.id === orderId || o.id?.toString() === orderId)
      
      if (!localOrder) {
        console.error('❌ localStorage\'da sipariş bulunamadı')
        setError('Sipariş bilgileri bulunamadı. Lütfen siparişi tekrar oluşturun.')
        setLoading(false)
        return
      }
      
      console.log('✅ localStorage\'da sipariş bulundu, ödeme formu oluşturuluyor...')
      
      // Sipariş bilgilerini backend'e gönder (kaydetmeden, sadece ödeme formu için)
      try {
        // API_URL'yi doğru şekilde kullan - çift /api/api sorununu önle
        let apiEndpoint;
        if (API_URL === '/api') {
          // Production: /api -> /api/payment/create
          apiEndpoint = '/api/payment/create';
        } else if (API_URL.startsWith('/api')) {
          // Zaten /api ile başlıyorsa, sadece /payment/create ekle
          apiEndpoint = `${API_URL}/payment/create`;
        } else if (API_URL.includes('://')) {
          // Full URL: https://api.fotografkutusu.com -> https://api.fotografkutusu.com/api/payment/create
          // veya http://localhost:5000 -> http://localhost:5000/api/payment/create
          apiEndpoint = `${API_URL}/api/payment/create`;
        } else {
          // Default: /api/payment/create
          apiEndpoint = '/api/payment/create';
        }
        
        console.log('🌐 API Endpoint oluşturuldu:', apiEndpoint, '(API_URL:', API_URL, ')');
        console.log('🌐 Tam URL:', apiEndpoint.startsWith('http') ? apiEndpoint : window.location.origin + apiEndpoint);
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            orderId: orderId,
            orderData: localOrder // Sipariş bilgilerini gönder
          }),
          signal: AbortSignal.timeout(15000) // 15 saniye timeout
        })
        
        console.log('📥 API Response Status:', response.status, response.statusText)
        
        // Response'un JSON olup olmadığını kontrol et
        const contentType = response.headers.get('content-type') || '';
        console.log('📥 Content-Type:', contentType);
        console.log('📥 Response URL:', response.url);
        
        if (!contentType.includes('application/json')) {
          // HTML döndüyse, hatayı göster
          const text = await response.text();
          console.error('❌ API JSON döndürmedi, HTML döndü.');
          console.error('❌ Response URL:', response.url);
          console.error('❌ Request URL:', apiEndpoint);
          console.error('❌ Tam URL:', apiEndpoint.startsWith('http') ? apiEndpoint : window.location.origin + apiEndpoint);
          console.error('❌ İlk 500 karakter:', text.substring(0, 500));
          
          // Backend çalışmıyor - kullanıcıya net mesaj ver
          setError('Backend sunucusu çalışmıyor. Lütfen backend\'i başlatın. (Backend localhost:5000\'de çalışıyor olmalı veya production sunucusunda başlatılmalı)');
          setLoading(false);
          return;
        }

        if (response.ok) {
          const data = await response.json()
          
          // 2. Token frontend'e geliyor mu? - KONTROL
          console.log('🔍 Backend Response:', {
            success: data.success,
            token: data.token || 'TOKEN YOK!',
            hasCheckoutFormContent: !!data.checkoutFormContent,
            paymentPageUrl: data.paymentPageUrl || 'YOK'
          })
          
          if (data.success && data.checkoutFormContent) {
            // Token kontrolü
            if (data.token) {
              console.log('✅ Token frontend\'e geldi:', data.token)
            } else {
              console.warn('⚠️ Token frontend\'e gelmedi!')
            }
            
            setPaymentForm(data.checkoutFormContent)
            setLoading(false)
            return
          } else {
            console.error('❌ Ödeme formu oluşturulamadı:', data.error)
            setError(data.error || 'Ödeme formu oluşturulamadı')
            setLoading(false)
            return
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ API hatası:', response.status, errorData)
          setError(errorData.error || 'Ödeme formu oluşturulamadı. Lütfen tekrar deneyin.')
          setLoading(false)
          return
        }
      } catch (apiErr) {
        console.error('API bağlantı hatası:', apiErr)
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.')
        setLoading(false)
        return
      }
    } catch (err) {
      console.error('Ödeme formu oluşturma hatası:', err)
      setError('Ödeme formu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
      setLoading(false)
    }
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
              padding: '3rem',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>⏳</div>
              <h2>Ödeme formu hazırlanıyor...</h2>
              <p style={{ color: '#666', marginTop: '1rem' }}>
                Sipariş No: <strong>{orderId}</strong>
              </p>
              <p style={{ color: '#999', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Lütfen bekleyin, ödeme sayfası yükleniyor...
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error) {
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
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>❌</div>
              <h2 style={{ color: '#e74c3c', marginBottom: '1rem' }}>Hata</h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>{error}</p>
              <button
                onClick={() => navigate('/order')}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
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
      <main style={{ padding: '2rem 0', minHeight: '60vh' }}>
        <div className="container">
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{
              marginBottom: '1.5rem',
              textAlign: 'center',
              color: '#2c3e50'
            }}>Ödeme</h1>
            
            {paymentForm ? (
              <div className="payment-form-container">
                <style>{`
                  /* İyzico font yüklemelerini engelle - CORS hatasını önle */
                  /* Tüm MarkPro font referanslarını fallback fontlarla değiştir */
                  @font-face {
                    font-family: 'MarkPro';
                    src: local('Arial'), local('Helvetica'), local('sans-serif');
                    font-weight: 400;
                    font-style: normal;
                    font-display: swap;
                    unicode-range: U+0000-FFFF;
                  }
                  @font-face {
                    font-family: 'MarkPro';
                    src: local('Arial'), local('Helvetica'), local('sans-serif');
                    font-weight: 500;
                    font-style: normal;
                    font-display: swap;
                    unicode-range: U+0000-FFFF;
                  }
                  /* İyzico form içindeki tüm elementlere fallback font uygula */
                  .payment-form-container,
                  .payment-form-container *,
                  .payment-form-container iframe,
                  iframe[src*="iyzipay"],
                  iframe[src*="iyzipay"] * {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
                  }
                  /* Font yüklemelerini engelle - link tag'lerini gizle */
                  .payment-form-container link[href*="fonts/MarkPro"],
                  link[href*="static.iyzipay.com/fonts"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                  }
                `}</style>
                <div 
                  dangerouslySetInnerHTML={{ __html: paymentForm }}
                  style={{
                    minHeight: '400px'
                  }}
                  onLoad={() => {
                    // 3. iyzico.js yükleniyor mu? - KONTROL
                    console.log('🔍 iyzico form yüklendi, script kontrolü yapılıyor...')
                    
                    // iyzico script'inin yüklenip yüklenmediğini kontrol et
                    setTimeout(() => {
                      const scripts = document.querySelectorAll('script[src*="iyzipay"]')
                      console.log('📜 iyzico script sayısı:', scripts.length)
                      scripts.forEach((script, index) => {
                        console.log(`✅ Script ${index + 1}:`, script.src)
                      })
                      
                      // window.iyzipayCheckout kontrolü
                      if (window.iyzipayCheckout) {
                        console.log('✅ window.iyzipayCheckout mevcut')
                      } else {
                        console.warn('⚠️ window.iyzipayCheckout bulunamadı')
                      }
                    }, 1000)
                  }}
                />
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: '#f9fafb',
                borderRadius: '8px',
                marginTop: '2rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Ödeme formu yükleniyor...</h3>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  Sipariş No: <strong>{orderId}</strong>
                </p>
                <p style={{ color: '#999', fontSize: '0.9rem' }}>
                  Lütfen bekleyin, ödeme formu hazırlanıyor...
                </p>
              </div>
            )}

            <div className="payment-security">
              <h3>Güvenli Ödeme</h3>
              <p>Ödemeleriniz SSL sertifikası ile korunmaktadır.</p>
              <div className="payment-security-logos">
                <img 
                  src="/logos/visa.png" 
                  alt="Visa" 
                  className="payment-security-logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <img 
                  src="/logos/mastercard.png" 
                  alt="MasterCard" 
                  className="payment-security-logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <img 
                  src="/logos/iyzico-ile-ode-horizontal.png" 
                  alt="iyzico ile Öde" 
                  className="payment-security-logo"
                  style={{ height: '40px' }}
                />
              </div>
              <div className="security-badge">
                <span className="security-badge-icon">🔒</span>
                <span>SSL Sertifikası ile Güvenli Alışveriş</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Payment




