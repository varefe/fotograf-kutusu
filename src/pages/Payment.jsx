import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getDecryptedOrders } from '../utils/encryption'
import { API_URL } from '../config/api'

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
  // OrderId'yi önce query parametresinden, yoksa state'ten al
  const [orderId, setOrderId] = useState(
    searchParams.get('orderId') || location.state?.orderData?.id || null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paymentForm, setPaymentForm] = useState(null)
  const paymentTokenRef = useRef(null) // Iyzico token'ı (ref ile closure sorununu önle)


  useEffect(() => {
    console.log('🔍 Payment sayfası yüklendi, orderId:', orderId)
    
    if (!orderId) {
      console.error('❌ Order ID bulunamadı')
      setError('Sipariş ID bulunamadı')
      setLoading(false)
      return
    }

    // ÖNEMLİ: Siparişin ödeme durumunu kontrol et
    const orders = getDecryptedOrders()
    const localOrder = orders.find(o => o.id === orderId || o.id?.toString() === orderId)
    
    if (localOrder) {
      // Eğer sipariş zaten ödendiyse, PaymentSuccess sayfasına yönlendir
      if (localOrder.paymentStatus === 'paid' || localOrder.paymentStatus === 'completed') {
        console.log('⚠️ Bu sipariş zaten ödendi, PaymentSuccess sayfasına yönlendiriliyor...')
        navigate(`/payment/success?orderId=${orderId}&token=${localOrder.paymentToken || ''}`, { replace: true })
        return
      }
      
      // localStorage'da ödeme durumu kontrolü
      const paymentStatusKey = `payment_status_${orderId}`
      const storedPaymentStatus = localStorage.getItem(paymentStatusKey)
      
      if (storedPaymentStatus === 'paid' || storedPaymentStatus === 'completed') {
        console.log('⚠️ localStorage\'da bu sipariş için ödeme durumu "paid" olarak işaretlenmiş')
        navigate(`/payment/success?orderId=${orderId}`, { replace: true })
        return
      }
    }

    // Ödeme formu oluştur
    console.log('🚀 Ödeme formu oluşturuluyor, orderId:', orderId)
    createPaymentForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, navigate])

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
      
      // API URL'ini config'den al
      console.log('🌐 API URL:', API_URL)
      console.log('📤 Gönderilen orderId:', orderId)
      
      // DOĞRU AKIŞ: localStorage'dan sipariş bilgilerini al ve ödeme formu oluştur
      // Sipariş henüz backend'e kaydedilmedi, ödeme başarılı olursa kaydedilecek
      console.log('🔍 localStorage\'dan sipariş bilgileri alınıyor...')
      
      // localStorage'dan siparişi bul
      let orders = getDecryptedOrders()
      console.log('🔍 Tüm siparişler:', orders.length, 'adet')
      console.log('🔍 Aranan orderId:', orderId, 'tip:', typeof orderId)
      
      let localOrder = orders.find(o => {
        const orderIdStr = o.id?.toString()
        const searchIdStr = orderId?.toString()
        return orderIdStr === searchIdStr || o.id === orderId
      })
      
      if (!localOrder) {
        console.error('❌ localStorage\'da sipariş bulunamadı')
        console.log('🔍 Mevcut sipariş ID\'leri:', orders.map(o => ({ id: o.id, type: typeof o.id })))
        
        // State'ten de kontrol et (fallback)
        if (location.state?.orderData) {
          console.log('✅ State\'ten sipariş bulundu, localStorage\'a kaydediliyor...')
          const { saveOrderToStorage } = await import('../utils/encryption')
          const saved = saveOrderToStorage(location.state.orderData)
          if (saved) {
            // Tekrar dene
            orders = getDecryptedOrders()
            localOrder = orders.find(o => o.id?.toString() === orderId?.toString())
            if (localOrder) {
              console.log('✅ State\'ten kaydedilen sipariş bulundu')
            } else {
              console.error('❌ State\'ten kaydedilen sipariş hala bulunamadı')
              setError('Sipariş bilgileri bulunamadı. Lütfen siparişi tekrar oluşturun.')
              setLoading(false)
              return
            }
          } else {
            console.error('❌ State\'ten sipariş kaydedilemedi')
            setError('Sipariş bilgileri bulunamadı. Lütfen siparişi tekrar oluşturun.')
            setLoading(false)
            return
          }
        } else {
          setError('Sipariş bilgileri bulunamadı. Lütfen siparişi tekrar oluşturun.')
          setLoading(false)
          return
        }
      }
      
      console.log('✅ localStorage\'da sipariş bulundu, ödeme formu oluşturuluyor...')
      
      // Base64'i location.state'ten al (File objelerinden oluştur)
      let orderDataWithBase64 = { ...localOrder }
      if (location.state?.photoFiles && location.state.photoFiles.length > 0 && localOrder.photo) {
        // İlk fotoğrafı base64'e çevir
        const firstPhotoFile = location.state.photoFiles[0]
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64String = reader.result.split(',')[1]
            resolve(base64String)
          }
          reader.onerror = () => resolve(null)
          reader.readAsDataURL(firstPhotoFile)
        })
        
        if (base64) {
          orderDataWithBase64.photo = {
            ...localOrder.photo,
            base64: base64
          }
          console.log('✅ Base64 File objesinden oluşturuldu')
        } else {
          console.warn('⚠️ Base64 oluşturulamadı')
        }
      } else {
        console.warn('⚠️ File objeleri bulunamadı, location.state:', location.state)
      }
      
      // Sipariş bilgilerini backend'e gönder (kaydetmeden, sadece ödeme formu için)
      try {
        // API_URL'yi doğru şekilde kullan - çift /api/api sorununu önle
        let apiEndpoint;
        if (API_URL === '/api' || API_URL.startsWith('/api')) {
          // Relative path: /api -> /api/payment/create
          apiEndpoint = '/api/payment/create';
        } else if (API_URL.includes('://')) {
          // Full URL: https://api.fotografkutusu.com -> https://api.fotografkutusu.com/api/payment/create
          // veya http://localhost:5000 -> http://localhost:5000/api/payment/create
          // veya https://fotograf-backend.onrender.com -> https://fotograf-backend.onrender.com/api/payment/create
          apiEndpoint = `${API_URL}/api/payment/create`;
        } else {
          // Default: /api/payment/create
          apiEndpoint = '/api/payment/create';
        }
        
        console.log('🌐 API Endpoint oluşturuldu:', apiEndpoint, '(API_URL:', API_URL, ')');
        console.log('🌐 Tam URL:', apiEndpoint.startsWith('http') ? apiEndpoint : window.location.origin + apiEndpoint);
        
        // Base64 verisinin boyutunu kontrol et
        const orderDataSize = JSON.stringify(orderDataWithBase64).length;
        const orderDataSizeMB = (orderDataSize / (1024 * 1024)).toFixed(2);
        console.log('📊 Gönderilecek veri boyutu:', orderDataSizeMB, 'MB');
        
        // Timeout süresini veri boyutuna göre ayarla (minimum 30 saniye, her MB için +5 saniye)
        const timeoutDuration = Math.max(30000, 30000 + (parseFloat(orderDataSizeMB) * 5000));
        console.log('⏱️ Timeout süresi:', timeoutDuration / 1000, 'saniye');
        
        // AbortController ile timeout kontrolü (AbortSignal.timeout bazı tarayıcılarda desteklenmeyebilir)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, timeoutDuration);
        
        let response;
        try {
          response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              orderId: orderId,
              orderData: orderDataWithBase64 // Base64 ile birlikte gönder
            }),
            signal: controller.signal
          })
          
          clearTimeout(timeoutId); // Başarılı yanıt geldi, timeout'u iptal et
          
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
            checkoutFormContentLength: data.checkoutFormContent?.length || 0,
            paymentPageUrl: data.paymentPageUrl || 'YOK',
            error: data.error || 'YOK'
          })
          
          // Debug: Response'un tamamını logla
          console.log('📋 Full Response Data:', data)
          
          if (data.success && data.checkoutFormContent) {
            // Token kontrolü
            if (data.token) {
              console.log('✅ Token frontend\'e geldi:', data.token)
              paymentTokenRef.current = data.token // Token'ı ref'te tut (closure sorununu önle)
            } else {
              console.warn('⚠️ Token frontend\'e gelmedi!')
            }
            
            console.log('✅ checkoutFormContent set ediliyor, uzunluk:', data.checkoutFormContent.length)
            console.log('✅ İlk 200 karakter:', data.checkoutFormContent.substring(0, 200))
            
            // checkoutFormContent'i set et
            setPaymentForm(data.checkoutFormContent)
            setLoading(false)
            
            console.log('✅ paymentForm state set edildi, render edilecek')
            
            return
          } else {
            console.error('❌ Ödeme formu oluşturulamadı:', data.error)
            console.error('❌ Response Data:', data)
            console.error('❌ success:', data.success)
            console.error('❌ checkoutFormContent var mı?', !!data.checkoutFormContent)
            setError(data.error || 'Ödeme formu oluşturulamadı. Lütfen tekrar deneyin.')
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
          clearTimeout(timeoutId); // Timeout'u temizle
          
          console.error('API bağlantı hatası:', apiErr)
          
          // Timeout hatası için özel mesaj
          if (apiErr.name === 'AbortError' || apiErr.name === 'TimeoutError' || apiErr.message?.includes('timeout')) {
            console.error('⏱️ Timeout hatası:', apiErr)
            setError('Sunucu yanıt vermiyor. Backend sunucusu çalışıyor mu kontrol edin. (Railway backend\'i başlatılmalı veya yeniden başlatılmalı)')
          } else if (apiErr.name === 'TypeError' && apiErr.message?.includes('Failed to fetch')) {
            console.error('🔌 Bağlantı hatası:', apiErr)
            setError('Sunucuya bağlanılamadı. Backend sunucusu çalışmıyor olabilir. Lütfen backend\'i kontrol edin.')
          } else {
            console.error('❌ Beklenmeyen hata:', apiErr)
            setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.')
          }
          setLoading(false)
          return
        }
      } catch (err) {
        console.error('Ödeme formu oluşturma hatası:', err)
        setError('Ödeme formu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
        setLoading(false)
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
              <div className="payment-form-container" style={{ width: '100%', maxWidth: '100%' }}>
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
                  /* Pop-up açılmasını engelle */
                  .payment-form-container iframe {
                    width: 100% !important;
                    min-height: 600px !important;
                    border: none !important;
                    display: block !important;
                  }
                  /* Iyzico form container'ı sayfaya gömülü göster */
                  #iyzipay-checkout-form,
                  .iyzipay-checkout-form {
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 auto !important;
                    display: block !important;
                  }
                `}</style>
                <div 
                  ref={(el) => {
                    if (el && paymentForm) {
                      console.log('🔍 paymentForm container render edildi')
                      console.log('🔍 paymentForm uzunluğu:', paymentForm.length)
                      
                      // Pop-up açılmasını tamamen engelle
                      const originalWindowOpen = window.open
                      window.open = function(...args) {
                        console.log('🚫 Pop-up açılması engellendi:', args[0])
                        return null
                      }
                      
                      // window.iyzipayCheckout'u override et (pop-up yerine iframe)
                      Object.defineProperty(window, 'iyzipayCheckout', {
                        value: function(options) {
                          console.log('🔧 iyzipayCheckout çağrıldı, pop-up devre dışı')
                          if (options && typeof options === 'object') {
                            options.popup = false // Pop-up'ı devre dışı bırak
                            options.container = el // Container'ı belirle
                          }
                          // Iyzico'nun orijinal fonksiyonunu çağır (eğer varsa)
                          if (window.iyzipay && window.iyzipay.checkoutForm) {
                            return window.iyzipay.checkoutForm(options)
                          }
                        },
                        writable: true,
                        configurable: true
                      })
                      
                      // Script tag'lerini manuel olarak çalıştır
                      const tempDiv = document.createElement('div')
                      tempDiv.innerHTML = paymentForm
                      const scripts = tempDiv.querySelectorAll('script')
                      scripts.forEach((oldScript) => {
                        const newScript = document.createElement('script')
                        Array.from(oldScript.attributes).forEach((attr) => {
                          newScript.setAttribute(attr.name, attr.value)
                        })
                        if (oldScript.innerHTML) {
                          // window.open ve popup açılmasını engelle
                          let scriptContent = oldScript.innerHTML
                          scriptContent = scriptContent.replace(/window\.open\(/g, '/* window.open engellendi */ null(')
                          scriptContent = scriptContent.replace(/\.open\(/g, '/* .open engellendi */ null(')
                          scriptContent = scriptContent.replace(/popup:\s*true/gi, 'popup: false')
                          scriptContent = scriptContent.replace(/popup\s*=\s*true/gi, 'popup = false')
                          
                          // Token ile iyzipayCheckout çağrısını ekle (eğer script içinde yoksa)
                          if (paymentTokenRef.current && !scriptContent.includes('iyzipayCheckout')) {
                            scriptContent += `
                              // Token ile checkout'u başlat
                              if (typeof window.iyzipayCheckout === 'function') {
                                setTimeout(function() {
                                  console.log('🚀 Script içinden checkout başlatılıyor, token:', '${paymentTokenRef.current}');
                                  window.iyzipayCheckout({
                                    token: '${paymentTokenRef.current}',
                                    popup: false,
                                    container: document.querySelector('.payment-form-container') || document.body
                                  });
                                }, 1000);
                              } else {
                                console.warn('⚠️ window.iyzipayCheckout henüz yüklenmedi');
                                // Script yüklendikten sonra tekrar dene
                                const checkInterval = setInterval(function() {
                                  if (typeof window.iyzipayCheckout === 'function') {
                                    clearInterval(checkInterval);
                                    console.log('🚀 window.iyzipayCheckout bulundu, checkout başlatılıyor');
                                    window.iyzipayCheckout({
                                      token: '${paymentTokenRef.current}',
                                      popup: false,
                                      container: document.querySelector('.payment-form-container') || document.body
                                    });
                                  }
                                }, 500);
                                // 10 saniye sonra durdur
                                setTimeout(function() {
                                  clearInterval(checkInterval);
                                }, 10000);
                              }
                            `;
                          }
                          
                          newScript.innerHTML = scriptContent
                        }
                        
                        // Script yüklendikten sonra token ile checkout başlat
                        if (newScript.src && newScript.src.includes('iyzipay')) {
                          newScript.onload = function() {
                            console.log('✅ Iyzico script yüklendi:', newScript.src)
                            if (paymentTokenRef.current) {
                              setTimeout(() => {
                                if (typeof window.iyzipayCheckout === 'function') {
                                  console.log('🚀 Script yüklendikten sonra checkout başlatılıyor')
                                  try {
                                    window.iyzipayCheckout({
                                      token: paymentTokenRef.current,
                                      popup: false,
                                      container: el || document.querySelector('.payment-form-container')
                                    })
                                  } catch (err) {
                                    console.error('❌ Checkout başlatma hatası:', err)
                                  }
                                }
                              }, 500)
                            }
                          }
                        }
                        
                        document.body.appendChild(newScript)
                        console.log('✅ Script çalıştırıldı:', newScript.src || newScript.innerHTML.substring(0, 50))
                      })
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: paymentForm }}
                  style={{
                    minHeight: '600px',
                    width: '100%',
                    maxWidth: '100%',
                    position: 'relative'
                  }}
                  onLoad={() => {
                    console.log('🔍 iyzico form container yüklendi')
                    
                    // Iframe'leri stillendiren fonksiyon
                    const styleIframes = () => {
                      const iframes = document.querySelectorAll('iframe[src*="iyzipay"], iframe[id*="iyzipay"], iframe[name*="iyzipay"]')
                      iframes.forEach((iframe) => {
                        iframe.style.width = '100%'
                        iframe.style.minHeight = '600px'
                        iframe.style.border = 'none'
                        iframe.style.display = 'block'
                        iframe.style.position = 'relative'
                        iframe.style.visibility = 'visible'
                        iframe.style.opacity = '1'
                        if (!iframe.hasAttribute('sandbox')) {
                          iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups')
                        }
                        console.log('✅ Iframe stillendirildi:', iframe.src || iframe.id)
                      })
                      return iframes.length
                    }
                    
                    // İlk kontrol
                    let iframeCount = styleIframes()
                    console.log('🖼️ İlk iframe kontrolü:', iframeCount, 'adet')
                    
                    // Iyzico form container'ını bul ve gömülü göster
                    const styleCheckoutForm = () => {
                      const checkoutForm = document.getElementById('iyzipay-checkout-form') || 
                                         document.querySelector('.iyzipay-checkout-form') ||
                                         document.querySelector('[id*="iyzipay"]') ||
                                         document.querySelector('[class*="iyzipay"]')
                      if (checkoutForm) {
                        checkoutForm.style.width = '100%'
                        checkoutForm.style.maxWidth = '100%'
                        checkoutForm.style.margin = '0 auto'
                        checkoutForm.style.display = 'block'
                        checkoutForm.style.position = 'relative'
                        checkoutForm.style.visibility = 'visible'
                        checkoutForm.style.opacity = '1'
                        console.log('✅ Checkout form stillendirildi')
                      }
                    }
                    styleCheckoutForm()
                    
                    // MutationObserver ile iframe'leri izle (dinamik oluşturulduğunda)
                    const container = document.querySelector('.payment-form-container')
                    if (container) {
                      const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                          mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) { // Element node
                              // Iframe kontrolü
                              if (node.tagName === 'IFRAME' && 
                                  (node.src?.includes('iyzipay') || 
                                   node.id?.includes('iyzipay') || 
                                   node.name?.includes('iyzipay'))) {
                                console.log('🆕 Yeni iframe bulundu, stillendiriliyor...')
                                styleIframes()
                              }
                              // Container içindeki iframe'leri kontrol et
                              const nestedIframes = node.querySelectorAll?.('iframe[src*="iyzipay"], iframe[id*="iyzipay"]')
                              if (nestedIframes && nestedIframes.length > 0) {
                                console.log('🆕 İç içe iframe bulundu, stillendiriliyor...')
                                styleIframes()
                              }
                              // Checkout form kontrolü
                              if (node.id?.includes('iyzipay') || node.className?.includes('iyzipay')) {
                                styleCheckoutForm()
                              }
                            }
                          })
                        })
                      })
                      
                      observer.observe(container, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['src', 'id', 'class']
                      })
                      console.log('👀 MutationObserver başlatıldı')
                      
                      // Periyodik kontrol (fallback)
                      const checkInterval = setInterval(() => {
                        const newCount = styleIframes()
                        if (newCount > iframeCount) {
                          console.log('🆕 Yeni iframe bulundu (periyodik kontrol):', newCount)
                          iframeCount = newCount
                        }
                        styleCheckoutForm()
                      }, 500)
                      
                      // 10 saniye sonra periyodik kontrolü durdur
                      setTimeout(() => {
                        clearInterval(checkInterval)
                        console.log('⏹️ Periyodik iframe kontrolü durduruldu')
                      }, 10000)
                    }
                    
                      // iyzico script'inin yüklenip yüklenmediğini kontrol et ve checkout'u başlat
                    const initCheckout = () => {
                      const scripts = document.querySelectorAll('script[src*="iyzipay"]')
                      console.log('📜 iyzico script sayısı:', scripts.length)
                      
                      // window.iyzipayCheckout'u tekrar override et
                      if (window.iyzipayCheckout) {
                        const originalCheckout = window.iyzipayCheckout
                        window.iyzipayCheckout = function(options) {
                          console.log('🔧 iyzipayCheckout çağrıldı, pop-up devre dışı')
                          if (options && typeof options === 'object') {
                            options.popup = false
                            options.container = container || document.querySelector('.payment-form-container')
                          }
                          const result = originalCheckout.apply(this, arguments)
                          // Iframe oluşturulduktan sonra stillendir
                          setTimeout(() => {
                            styleIframes()
                            styleCheckoutForm()
                          }, 100)
                          return result
                        }
                        console.log('✅ window.iyzipayCheckout override edildi')
                        
                        // Token varsa manuel olarak checkout'u başlat
                        if (paymentTokenRef.current && container) {
                          console.log('🚀 Token ile checkout başlatılıyor:', paymentTokenRef.current)
                          try {
                            window.iyzipayCheckout({
                              token: paymentTokenRef.current,
                              popup: false,
                              container: container
                            })
                            console.log('✅ Checkout başlatıldı')
                          } catch (err) {
                            console.error('❌ Checkout başlatma hatası:', err)
                          }
                        }
                      } else {
                        console.warn('⚠️ window.iyzipayCheckout bulunamadı, tekrar denenecek...')
                        // 1 saniye sonra tekrar dene
                        setTimeout(initCheckout, 1000)
                      }
                      
                      // Son iframe kontrolü
                      const finalCount = styleIframes()
                      console.log('🖼️ Final iframe sayısı:', finalCount)
                    }
                    
                    // İlk deneme
                    setTimeout(initCheckout, 2000)
                    
                    // Token varsa tekrar dene
                    if (paymentTokenRef.current) {
                      setTimeout(() => {
                        console.log('🔄 Token ile checkout tekrar deneniyor...')
                        initCheckout()
                      }, 3000)
                    }
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




