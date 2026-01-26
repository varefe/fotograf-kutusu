import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import PaymentForm from '../components/PaymentForm'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { calculatePrice } from '../utils/priceCalculator'
import { API_URL } from '../config/api'
import { saveOrderToStorage } from '../utils/encryption'

function Cart() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartItems, removeFromCart, clearCart, getCartTotal, updateCartItemPhoto, addToCart } = useCart()
  const { user, isAuthenticated, getAuthHeaders } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [selectedItemGroup, setSelectedItemGroup] = useState(null) // Seçilen ürün grubu (tüm fotoğrafları içeren)
  const [showAddressForm, setShowAddressForm] = useState(false) // Adres formunu göster/gizle
  const [showPaymentForm, setShowPaymentForm] = useState(false) // Ödeme formunu göster/gizle
  const [preparedOrderData, setPreparedOrderData] = useState(null) // Hazırlanan sipariş verisi
  const [paymentError, setPaymentError] = useState(null) // Ödeme hatası
  const [show3DSecure, setShow3DSecure] = useState(false) // 3D Secure göster
  const [threeDSecureHtml, setThreeDSecureHtml] = useState(null) // 3D Secure HTML içeriği
  const [photoRotationIndex, setPhotoRotationIndex] = useState({})
  const [photoNextIndex, setPhotoNextIndex] = useState({})
  const [photoTransition, setPhotoTransition] = useState({})
  // ProductUpload'dan gelen File objelerini memory'de tut
  // Önce location.state'ten al, yoksa cartItems içindeki file objelerini topla
  const [photoFiles, setPhotoFiles] = useState(() => {
    if (location.state?.photos && location.state.photos.length > 0) {
      return location.state.photos
    }
    // Fallback: cartItems içindeki file objelerini topla (eğer varsa)
    const files = cartItems
      .map(item => item.photo?.file)
      .filter(file => file instanceof File)
    return files.length > 0 ? files : []
  })

  // location.state değiştiğinde photoFiles'ı güncelle
  useEffect(() => {
    if (location.state?.photos && location.state.photos.length > 0) {
      console.log('🔄 location.state.photos bulundu, photoFiles güncelleniyor:', location.state.photos.length, 'adet')
      setPhotoFiles(location.state.photos)
    }
  }, [location.state])
  const [shippingType, setShippingType] = useState('standard')
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    address: '',
    phone: '',
    firstName: '',
    lastName: ''
  })
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Responsive kontrolü
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Kullanıcı giriş yapmışsa bilgilerini otomatik doldur
  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerInfo({
        email: user.email || '',
        address: user.address || '',
        phone: user.phone || '',
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      })
    }
  }, [isAuthenticated, user])

  const handleCheckout = async () => {
    // Kullanıcı giriş kontrolü
    if (!isAuthenticated) {
      alert('Sipariş verebilmek için lütfen giriş yapın veya kayıt olun')
      navigate('/login', { 
        state: { 
          from: '/cart',
          message: 'Sipariş verebilmek için lütfen giriş yapın veya kayıt olun.'
        } 
      })
      return
    }

    if (cartItems.length === 0) {
      alert('Sepetiniz boş')
      return
    }

    if (!customerInfo.email || !customerInfo.address) {
      alert('Lütfen e-posta ve adres bilgilerini doldurun')
      return
    }

    // Adres uzunluk kontrolü
    if (customerInfo.address.trim().length < 10) {
      alert('Adres en az 10 karakter olmalıdır')
      return
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerInfo.email.trim())) {
      alert('Geçerli bir e-posta adresi giriniz')
      return
    }

    // Miktar kontrolü (minimum 15)
    const firstItem = cartItems[0]
    if (firstItem.quantity < 15) {
      alert('Minimum 15 adet seçmelisiniz')
      return
    }

    setIsSubmitting(true)

    // ÖNEMLİ: Önce ödeme alınacak, sonra backend'e kaydedilecek
    try {
      const firstItem = cartItems[0]
      
      // Miktar kontrolü
      if (firstItem.quantity < 15) {
        alert('Minimum 15 adet seçmelisiniz')
        setIsSubmitting(false)
        return
      }
      
      // Sepet öğelerini grupla (aynı size, quantity, product.name olanları)
      const groupedCartItems = cartItems.reduce((groups, item) => {
        const key = `${item.product?.size || 'unknown'}-${item.quantity || 0}-${item.product?.name || 'unknown'}`
        if (!groups[key]) {
          groups[key] = {
            id: key,
            size: item.product?.size,
            quantity: item.quantity,
            productName: item.product?.name,
            customSize: item.product?.customSize,
            items: [],
            totalPrice: 0
          }
        }
        groups[key].items.push(item)
        // Grup fiyatını doğru hesapla: TOPLAM ADET için bulk fiyat kullan
        // Toplam adet = fotoğraf sayısı (her fotoğraf için 1 adet)
        // Fotoğraf sayısı arttıkça toplam adet artar, bulk fiyat düşer
        const totalQuantity = groups[key].items.length
        const sizePrices = {
          '10x15': 16,
          '15x20': 19,
          '20x30': 26,
          '30x40': 36
        }
        const unitPrice = sizePrices[item.product?.size] || 26
        // Grup fiyatı: toplam adet × bulk birim fiyat
        groups[key].totalPrice = totalQuantity * unitPrice
        return groups
      }, {})
      
      const groupedItemsArray = Object.values(groupedCartItems)
      
      // Sepet toplamını hesapla (tüm grupların fiyatlarını topla)
      const totalPrice = groupedItemsArray.reduce((sum, group) => sum + (group.totalPrice || 0), 0)
      
      // Kargo fiyatı (99 TL üzeri ücretsiz)
      const shippingPrice = shippingType === 'standard' ? 15 : 35
      const finalTotal = totalPrice >= 99 ? totalPrice : totalPrice + shippingPrice
      
      // Toplam fiyatı kullan (tüm grupların toplamı)
      const calculatedPrice = finalTotal

      // Tüm fotoğrafları base64'e çevir ve localStorage'a kaydet, sonra ödeme sayfasına yönlendir
      const prepareOrderForPayment = async () => {

        const photosArray = []
        
        // Önce location.state'ten fotoğrafları al
        let photoFilesToProcess = []
        if (location.state?.photos && location.state.photos.length > 0) {
          photoFilesToProcess = location.state.photos
        } else if (photoFiles && photoFiles.length > 0) {
          photoFilesToProcess = photoFiles
        } else {
          // CartItems'tan file objelerini topla
          photoFilesToProcess = cartItems
            .map(item => item.photo?.file)
            .filter(file => file instanceof File)
        }

        // Eğer File objesi yoksa, cartItems'tan preview'ları kullan
        if (photoFilesToProcess.length === 0) {
          photoFilesToProcess = cartItems.map(item => ({
            preview: item.photo?.preview,
            name: item.photo?.filename || `photo-${cartItems.indexOf(item)}.jpg`
          }))
        }

        if (photoFilesToProcess.length === 0) {
          alert('Fotoğraf bulunamadı. Lütfen tekrar deneyin.')
          setIsSubmitting(false)
          return
        }

        // Her fotoğrafı base64'e çevir
        const convertPhoto = (photoFile, index) => {
          return new Promise((resolve, reject) => {
            if (photoFile instanceof File) {
              // File objesi varsa
              const reader = new FileReader()
              reader.onloadend = () => {
                const base64String = reader.result.split(',')[1]
                resolve({
                  filename: photoFile.name || `photo-${index}.jpg`,
                  originalName: photoFile.name || `photo-${index}.jpg`,
                  base64: base64String,
                  mimetype: photoFile.type || 'image/jpeg',
                  size: photoFile.size || 0
                })
              }
              reader.onerror = reject
              reader.readAsDataURL(photoFile)
            } else if (photoFile.preview) {
              // Preview varsa
              const preview = photoFile.preview
              if (preview.startsWith('data:image/')) {
                // Data URL ise
                const base64String = preview.split(',')[1]
                const mimetype = preview.match(/data:image\/([^;]+)/)?.[1] || 'jpeg'
                resolve({
                  filename: photoFile.name || `photo-${index}.jpg`,
                  originalName: photoFile.name || `photo-${index}.jpg`,
                  base64: base64String,
                  mimetype: `image/${mimetype}`,
                  size: 0
                })
              } else {
                // Blob URL ise
                fetch(preview)
                  .then(response => response.blob())
                  .then(blob => {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      const base64String = reader.result.split(',')[1]
                      resolve({
                        filename: photoFile.name || `photo-${index}.jpg`,
                        originalName: photoFile.name || `photo-${index}.jpg`,
                        base64: base64String,
                        mimetype: blob.type || 'image/jpeg',
                        size: blob.size || 0
                      })
                    }
                    reader.onerror = reject
                    reader.readAsDataURL(blob)
                  })
                  .catch(reject)
              }
            } else {
              reject(new Error(`Fotoğraf ${index} işlenemedi`))
            }
          })
        }

        try {
          // Tüm fotoğrafları paralel olarak işle
          const photoPromises = photoFilesToProcess.map((photoFile, index) => 
            convertPhoto(photoFile, index)
          )
          const convertedPhotos = await Promise.all(photoPromises)
          photosArray.push(...convertedPhotos)
          
          // Sipariş verisini oluştur
          const orderId = Date.now().toString()
          const orderData = {
            id: orderId,
            photos: photosArray, // Tüm fotoğraflar
            photo: photosArray[0] || null, // Geriye uyumluluk için ilk fotoğraf
            size: firstItem.product.size,
            customSize: firstItem.product.customSize,
            quantity: firstItem.quantity,
            shippingType: shippingType,
            email: customerInfo.email,
            address: customerInfo.address,
            phone: customerInfo.phone || '',
            firstName: customerInfo.firstName || 'Müşteri',
            lastName: customerInfo.lastName || 'Müşteri',
            customerInfo: {
              firstName: customerInfo.firstName || 'Müşteri',
              lastName: customerInfo.lastName || 'Müşteri',
              email: customerInfo.email,
              phone: customerInfo.phone || '',
              address: customerInfo.address
            },
            price: calculatedPrice,
            status: 'Yeni',
            paymentStatus: 'pending', // Ödeme bekleniyor
            notes: `${photosArray.length} fotoğraf`,
            createdAt: new Date().toISOString()
          }
          
          // localStorage'a kaydet (base64'ler dahil - ödeme sayfasında kullanılacak)
          saveOrderToStorage(orderData)
          
          // Sipariş verisini state'e kaydet ve ödeme formunu göster
          setPreparedOrderData(orderData)
          setOrderId(orderId)
          setShowPaymentForm(true)
          setIsSubmitting(false)
          
          // Sayfayı ödeme formuna kaydır
          setTimeout(() => {
            const paymentSection = document.getElementById('payment-section')
            if (paymentSection) {
              paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }, 100)
        } catch (error) {
          console.error('Fotoğrafları base64\'e çevirme hatası:', error)
          alert('Fotoğraflar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.')
          setIsSubmitting(false)
        }
      }

      // Fotoğrafları işlemeye başla
      await prepareOrderForPayment()
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error)
      alert('Sipariş oluşturulurken bir hata oluştu')
      setIsSubmitting(false)
    }
  }

  // Sepet öğelerini grupla (aynı size, quantity, product.name olanları)
  const groupedCartItems = cartItems.reduce((groups, item) => {
    const key = `${item.product?.size || 'unknown'}-${item.quantity || 0}-${item.product?.name || 'unknown'}`
    if (!groups[key]) {
      groups[key] = {
        id: key,
        size: item.product?.size,
        quantity: item.quantity,
        productName: item.product?.name,
        customSize: item.product?.customSize,
        items: [],
        totalPrice: 0
      }
    }
    groups[key].items.push(item)
    return groups
  }, {})
  
  // Grup fiyatlarını hesapla (tüm item'lar eklendikten sonra)
  Object.values(groupedCartItems).forEach((group) => {
    // Toplam adet = fotoğraf sayısı (her fotoğraf için 1 adet)
    // Örnek: 1 fotoğraf → 1 adet
    // Örnek: 51 fotoğraf → 51 adet
    // Fotoğraf sayısı arttıkça toplam adet artar, bulk fiyat düşer
    const totalQuantity = group.items.length
    const sizePrices = {
      '10x15': 16,
      '15x20': 19,
      '20x30': 26,
      '30x40': 36
    }
    const unitPrice = sizePrices[group.size] || 26
    // Grup fiyatı: toplam adet × bulk birim fiyat
    group.totalPrice = totalQuantity * unitPrice
  })
  
  // Debug: Grup fiyatlarını logla
  Object.values(groupedCartItems).forEach((group, idx) => {
    // Toplam adet için bulk fiyat hesapla
    // Toplam adet = fotoğraf sayısı (her fotoğraf için 1 adet)
    const totalQuantity = group.items.length
    const sizePrices = {
      '10x15': 16,
      '15x20': 19,
      '20x30': 26,
      '30x40': 36
    }
    const unitPrice = sizePrices[group.size] || 26
    // Beklenen toplam: toplam adet × bulk birim fiyat
    const expectedTotal = totalQuantity * unitPrice
    const actualTotal = group.totalPrice
    const isCorrect = Math.abs(actualTotal - expectedTotal) < 0.01
    const difference = actualTotal - expectedTotal
    
    console.log(`💰 Grup ${idx + 1} Fiyat Detayı:`)
    console.log(`  Boyut: ${group.size}`)
    console.log(`  Adet/Fotoğraf: ${group.quantity}`)
    console.log(`  Fotoğraf Sayısı: ${group.items.length}`)
    console.log(`  Toplam Adet: ${totalQuantity} (${group.items.length} fotoğraf, her biri 1 adet = ${totalQuantity} adet)`)
    console.log(`  Bulk Birim Fiyat: ${unitPrice} TL/adet (${totalQuantity} adet için)`)
    console.log(`  Beklenen Toplam: ${expectedTotal} TL (${totalQuantity} adet × ${unitPrice} TL/adet)`)
    console.log(`  Gerçek Grup Fiyatı: ${actualTotal} TL`)
    console.log(`  Doğru mu?: ${isCorrect ? '✅ EVET' : '❌ HAYIR'}`)
    console.log(`  Fark: ${difference} TL`)
  })

  const groupedItemsArray = Object.values(groupedCartItems)
  const rotationKey = groupedItemsArray
    .map((group) => `${group.id}:${group.items.length}`)
    .join('|')

  useEffect(() => {
    if (groupedItemsArray.length === 0) return
    let timeoutId
    const interval = setInterval(() => {
      setPhotoNextIndex((prev) => {
        const next = { ...prev }
        groupedItemsArray.forEach((group) => {
          const count = group.items.length
          if (count === 0) return
          const current = photoRotationIndex[group.id] ?? 0
          next[group.id] = (current + 1) % count
        })
        return next
      })
      setPhotoTransition((prev) => {
        const next = { ...prev }
        groupedItemsArray.forEach((group) => {
          if (group.items.length === 0) return
          next[group.id] = true
        })
        return next
      })
      timeoutId = setTimeout(() => {
        setPhotoRotationIndex((prev) => {
          const next = { ...prev }
          groupedItemsArray.forEach((group) => {
            const count = group.items.length
            if (count === 0) return
            const current = prev[group.id] ?? 0
            next[group.id] = (current + 1) % count
          })
          return next
        })
        setPhotoTransition((prev) => {
          const next = { ...prev }
          groupedItemsArray.forEach((group) => {
            if (group.items.length === 0) return
            next[group.id] = false
          })
          return next
        })
      }, 600)
    }, 4500)
    return () => {
      clearInterval(interval)
      clearTimeout(timeoutId)
    }
  }, [rotationKey, photoRotationIndex])

  // Ödeme formu submit handler
  const handlePaymentSubmit = async (cardData) => {
    try {
      setIsSubmitting(true)
      setPaymentError(null)

      if (!orderId || !preparedOrderData) {
        setPaymentError('Sipariş bilgileri bulunamadı')
        setIsSubmitting(false)
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
          orderData: preparedOrderData,
          ...cardData
        })
      })

      // Response kontrolü
      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: 'Sunucu hatası', message: errorText || `HTTP ${response.status}` }
        }
        setPaymentError(errorData.error || errorData.message || 'Ödeme başlatılamadı')
        setIsSubmitting(false)
        return
      }

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
        setPaymentError(data.error || data.message || 'Ödeme başlatılamadı')
      }
    } catch (err) {
      console.error('❌ Ödeme hatası:', err)
      setPaymentError('Ödeme işlemi sırasında bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 3D Secure HTML yüklendiğinde iframe'de göster
  useEffect(() => {
    if (!show3DSecure || !threeDSecureHtml) return;
    
    console.log('✅ 3D Secure HTML yüklendi, işleniyor...');
    
    // HTML içeriğinin Base64 kodlu olup olmadığını kontrol et
    let htmlContent = threeDSecureHtml.trim();
    
    // Eğer Base64 kodlu ise decode et
    if (htmlContent.match(/^[A-Za-z0-9+/=\s]+$/) && htmlContent.length > 100) {
      try {
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
            setTimeout(() => {
              try {
                form.submit();
                console.log('✅ Form submit edildi');
              } catch (e) {
                console.error('❌ Form submit hatası:', e);
                const submitButton = form.querySelector('input[type="submit"]') || 
                                   form.querySelector('button[type="submit"]') ||
                                   form.querySelector('button');
                if (submitButton) {
                  submitButton.click();
                }
              }
            }, 500);
          }
        } catch (e) {
          console.error('❌ Iframe içeriğine erişim hatası (CORS):', e.message);
          container.innerHTML = htmlContent;
          setTimeout(() => {
            const form = container.querySelector('form');
            if (form) {
              console.log('🔍 Form bulundu (CORS fallback), submit ediliyor...');
              form.submit();
            }
          }, 500);
        }
      };
      
      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    }
  }, [show3DSecure, threeDSecureHtml])

  // Sepet toplamını hesapla (tüm grupların fiyatlarını topla)
  // Her grup tek bir ürün olarak gösteriliyor, tüm grupların toplamını al
  const totalPrice = groupedItemsArray.reduce((sum, group) => sum + (group.totalPrice || 0), 0)
  
  // Kargo fiyatı (99 TL üzeri ücretsiz)
  const shippingPrice = shippingType === 'standard' ? 15 : 35
  const finalTotal = totalPrice >= 99 ? totalPrice : totalPrice + shippingPrice
  
  // Beklenen toplam fiyat (tüm grupların fiyatlarını topla)
  const expectedTotalPrice = groupedItemsArray.reduce((sum, group) => {
    // Toplam adet = fotoğraf sayısı (her fotoğraf için 1 adet)
    const totalQuantity = group.items.length
    const sizePrices = {
      '10x15': 16,
      '15x20': 19,
      '20x30': 26,
      '30x40': 36
    }
    const unitPrice = sizePrices[group.size] || 26
    // Grup fiyatı: toplam adet × bulk birim fiyat
    const groupPrice = totalQuantity * unitPrice
    return sum + groupPrice
  }, 0)
  
  console.log('💰 Cart Fiyat Hesaplama:')
  console.log(`  Sepet Item Sayısı: ${cartItems.length}`)
  console.log(`  Grup Sayısı: ${groupedItemsArray.length}`)
  console.log(`  Her Grubun Fiyatı:`, groupedItemsArray.map(g => `${g.totalPrice} TL`).join(', '))
  console.log(`  Beklenen Toplam Fiyat: ${expectedTotalPrice} TL`)
  console.log(`  Gerçek Toplam Fiyat: ${totalPrice} TL`)
  const isPriceCorrect = Math.abs(totalPrice - expectedTotalPrice) < 0.01
  const priceDifference = totalPrice - expectedTotalPrice
  console.log(`  Doğru mu?: ${isPriceCorrect ? '✅ EVET' : '❌ HAYIR'}`)
  console.log(`  Fark: ${priceDifference} TL`)
  console.log(`  Kargo Fiyatı: ${shippingPrice} TL`)
  console.log(`  Final Toplam: ${finalTotal} TL`)
  console.log(`  Ücretsiz Kargo?: ${totalPrice >= 99 ? '✅ EVET' : '❌ HAYIR'}`)

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '4rem 0', minHeight: '60vh', textAlign: 'center' }}>
          <div className="container">
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              <Icon name="cart" size={40} />
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Sepetiniz Boş</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Sepetinize ürün eklemek için ana sayfaya dönün
            </p>
            <Link to="/" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              Alışverişe Başla
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem 0', minHeight: '80vh' }}>
        <div className="container">
          <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Sepetim</h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: '2rem'
          }}>
            {/* Sepet Öğeleri - Gruplanmış */}
            <div>
              {groupedItemsArray.map((group, groupIndex) => {
                const rotationIndex = photoRotationIndex[group.id] ?? 0
                const nextIndex = photoNextIndex[group.id]
                const isTransitioning = !!photoTransition[group.id]
                const rotatingItem = group.items[rotationIndex] || group.items[0]
                const nextItem = typeof nextIndex === 'number'
                  ? (group.items[nextIndex] || rotatingItem)
                  : rotatingItem
                return (
                <div
                  key={group.id}
                  style={{
                    background: '#ffffff',
                    padding: isMobile ? '1rem' : '1.5rem',
                    borderRadius: '16px',
                    marginBottom: '1.25rem',
                    border: '1px solid #eef2f7',
                    boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)',
                    transition: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedItemGroup(group)}
                >
                  {/* Ürün Başlığı */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    marginBottom: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #edf2f7'
                  }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem', color: '#1f2937', fontWeight: 700 }}>
                        {group.productName || 'Fotoğraf Baskı'}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                        Ürün detayları
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '0.5rem',
                        fontSize: '0.85rem'
                      }}>
                        <span style={{
                          padding: '0.35rem 0.75rem',
                          background: '#f1f5f9',
                          color: '#0f172a',
                          borderRadius: '999px',
                          border: '1px solid #e2e8f0',
                          fontWeight: 600
                        }}>
                          Boyut: {group.size === 'custom' && group.customSize
                            ? `${group.customSize.width}x${group.customSize.height} cm`
                            : group.size || '20x30'}
                        </span>
                        <span style={{
                          padding: '0.35rem 0.75rem',
                          background: '#fef3c7',
                          color: '#92400e',
                          borderRadius: '999px',
                          border: '1px solid #fde68a',
                          fontWeight: 600
                        }}>
                          Adet: 1
                        </span>
                        <span style={{
                          padding: '0.35rem 0.75rem',
                          background: '#ede9fe',
                          color: '#5b21b6',
                          borderRadius: '999px',
                          border: '1px solid #ddd6fe',
                          fontWeight: 600
                        }}>
                          Fotoğraf: 1
                        </span>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '0.6rem'
                    }}>
                      <div style={{
                        width: isMobile ? '96px' : '120px',
                        aspectRatio: '1',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 10px rgba(15, 23, 42, 0.08)',
                        position: 'relative'
                      }}>
                        <img
                          src={rotatingItem?.photo?.preview || rotatingItem?.photo?.url || '/placeholder.jpg'}
                          alt="Seçili fotoğraf"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            inset: 0,
                            opacity: isTransitioning ? 0 : 1,
                            transition: 'opacity 0.6s ease'
                          }}
                          onError={(e) => {
                            e.target.src = '/placeholder.jpg'
                          }}
                        />
                        <img
                          src={nextItem?.photo?.preview || nextItem?.photo?.url || '/placeholder.jpg'}
                          alt="Seçili fotoğraf"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            inset: 0,
                            opacity: isTransitioning ? 1 : 0,
                            transition: 'opacity 0.6s ease'
                          }}
                          onError={(e) => {
                            e.target.src = '/placeholder.jpg'
                          }}
                        />
                      </div>
                      <div style={{
                        textAlign: 'right',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '0.65rem 0.9rem',
                        minWidth: isMobile ? 'auto' : '150px'
                      }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.2rem' }}>Toplam</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#4f46e5' }}>
                          ₺{group.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedItemGroup(group)
                      }}
                      style={{
                        background: 'var(--primary-color)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: isMobile ? '0.7rem 1rem' : '0.85rem 1.25rem',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        transition: 'none',
                        boxShadow: 'var(--shadow)'
                      }}
                    >
                      Tüm Fotoğrafları Gör ({group.items.length})
                    </button>
                  </div>
                </div>
              )})}

              <button
                onClick={() => {
                  if (window.confirm('Sepetinizdeki tüm ürünleri kaldırmak istediğinizden emin misiniz?')) {
                    clearCart()
                  }
                }}
                style={{
                  background: '#f3f4f6',
                  color: '#666',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'color 0.2s, background-color 0.2s, border-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  justifyContent: 'center'
                }}
              >
                Sepeti Temizle
              </button>
            </div>

            {/* Sipariş Özeti */}
            <div>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                position: isMobile ? 'relative' : 'sticky',
                top: isMobile ? '0' : '2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Sipariş Özeti</h2>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Ara Toplam</span>
                    <span>₺{totalPrice.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Kargo</span>
                    <span>
                      {totalPrice >= 99 ? (
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>ÜCRETSİZ</span>
                      ) : (
                        `₺${shippingPrice}`
                      )}
                    </span>
                  </div>
                  {totalPrice < 99 && (
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#666',
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      background: '#f0f9ff',
                      borderRadius: '6px'
                    }}>
                      ₺{(99 - totalPrice).toFixed(2)} daha ekleyin, kargo ücretsiz olsun!
                    </div>
                  )}
                </div>

                <div style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '600' }}>
                    <span>Toplam</span>
                    <span style={{ color: 'var(--primary-color)' }}>₺{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Kullanıcı giriş yapmamışsa kayıt ol/giriş yap bölümü */}
                {!isAuthenticated ? (
                  <div style={{
                    marginBottom: '1rem',
                    padding: '1.25rem',
                    background: 'var(--bg-color)',
                    borderRadius: '8px',
                    color: 'var(--text-color)',
                    textAlign: 'center',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow)'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
                      <Icon name="lock" size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.6rem', fontWeight: '600' }}>
                      Siparişi Tamamlamak İçin
                    </h3>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      marginBottom: '1rem', 
                      color: 'var(--text-light)',
                      lineHeight: '1.5'
                    }}>
                      Hızlı ve güvenli sipariş vermek için lütfen giriş yapın veya kayıt olun
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                      <Link
                        to="/login"
                        state={{ from: '/cart', message: 'Sipariş verebilmek için lütfen giriş yapın veya kayıt olun.' }}
                        className="btn btn-primary btn-block"
                      >
                        Giriş Yap
                      </Link>
                      <Link
                        to="/register"
                        state={{ from: '/cart', message: 'Sipariş verebilmek için lütfen kayıt olun.' }}
                        className="btn btn-secondary btn-block"
                      >
                        Kayıt Ol
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Adres Bilgilerini Doldur Butonu */}
                    {!showAddressForm && (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          background: 'var(--primary-color)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'color 0.2s, background-color 0.2s',
                          marginBottom: '1rem'
                        }}
                      >
                        Adres Bilgilerini Doldur
                      </button>
                    )}

                    {/* Adres Formu */}
                    {showAddressForm && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.75rem'
                        }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>İletişim Bilgileri</h3>
                          <button
                            onClick={() => {
                              setShowAddressForm(false)
                              setShowPaymentForm(false)
                              setPreparedOrderData(null)
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-light)',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              padding: '0.25rem 0.5rem'
                            }}
                          >
                            Kapat
                          </button>
                        </div>
                        <div style={{
                          padding: '0.6rem',
                          marginBottom: '0.75rem',
                          background: 'var(--bg-light)',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: 'var(--text-color)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}>
                          <Icon name="check" size={12} />
                          <span>Giriş yaptınız: <strong>{user?.email || user?.firstName || 'Kullanıcı'}</strong></span>
                        </div>
                        <div style={{ marginBottom: '0.75rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.875rem' }}>
                            Kargo Tipi
                          </label>
                          <select
                            value={shippingType}
                            onChange={(e) => setShippingType(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.6rem',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              fontSize: '0.9rem'
                            }}
                          >
                            <option value="standard">Standart Kargo (3-5 gün, ₺15)</option>
                            <option value="express">Express Kargo (1-2 gün, ₺35)</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          placeholder="Ad *"
                          value={customerInfo.firstName}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            marginBottom: '0.6rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Soyad *"
                          value={customerInfo.lastName}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            marginBottom: '0.6rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        />
                        <input
                          type="email"
                          placeholder="E-posta *"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            marginBottom: '0.6rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        />
                        <textarea
                          placeholder="Adres *"
                          value={customerInfo.address}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                          required
                          rows="3"
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            marginBottom: '0.6rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            resize: 'vertical'
                          }}
                        />
                        <input
                          type="tel"
                          placeholder="Telefon (Opsiyonel)"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            marginBottom: '0.75rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        />
                        
                        {/* Ödeme Formunu Aç Butonu */}
                        {!showPaymentForm && (
                          <button
                            onClick={async () => {
                              // Adres bilgilerini kontrol et
                              if (!customerInfo.email || !customerInfo.address || !customerInfo.firstName || !customerInfo.lastName) {
                                alert('Lütfen tüm zorunlu alanları doldurun')
                                return
                              }
                              
                              if (customerInfo.address.trim().length < 10) {
                                alert('Adres en az 10 karakter olmalıdır')
                                return
                              }
                              
                              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                              if (!emailRegex.test(customerInfo.email.trim())) {
                                alert('Geçerli bir e-posta adresi giriniz')
                                return
                              }
                              
                              setIsSubmitting(true)
                              
                              try {
                                // OrderId oluştur
                                const newOrderId = Date.now().toString()
                                
                                // Fotoğrafları base64'e çevir
                                const photosArray = []
                                let photoFilesToProcess = []
                                
                                if (location.state?.photos && location.state.photos.length > 0) {
                                  photoFilesToProcess = location.state.photos
                                } else if (photoFiles && photoFiles.length > 0) {
                                  photoFilesToProcess = photoFiles
                                } else {
                                  photoFilesToProcess = cartItems
                                    .map(item => item.photo?.file)
                                    .filter(file => file instanceof File)
                                }
                                
                                if (photoFilesToProcess.length === 0) {
                                  photoFilesToProcess = cartItems.map(item => ({
                                    preview: item.photo?.preview,
                                    name: item.photo?.filename || `photo-${cartItems.indexOf(item)}.jpg`
                                  }))
                                }
                                
                                if (photoFilesToProcess.length === 0) {
                                  alert('Fotoğraf bulunamadı. Lütfen tekrar deneyin.')
                                  setIsSubmitting(false)
                                  return
                                }
                                
                                const convertPhoto = (photoFile, index) => {
                                  return new Promise((resolve, reject) => {
                                    if (photoFile instanceof File) {
                                      const reader = new FileReader()
                                      reader.onloadend = () => {
                                        const base64String = reader.result.split(',')[1]
                                        resolve({
                                          filename: photoFile.name || `photo-${index}.jpg`,
                                          originalName: photoFile.name || `photo-${index}.jpg`,
                                          base64: base64String,
                                          mimetype: photoFile.type || 'image/jpeg',
                                          size: photoFile.size || 0
                                        })
                                      }
                                      reader.onerror = reject
                                      reader.readAsDataURL(photoFile)
                                    } else if (photoFile.preview) {
                                      const preview = photoFile.preview
                                      if (preview.startsWith('data:image/')) {
                                        const base64String = preview.split(',')[1]
                                        const mimetype = preview.match(/data:image\/([^;]+)/)?.[1] || 'jpeg'
                                        resolve({
                                          filename: photoFile.name || `photo-${index}.jpg`,
                                          originalName: photoFile.name || `photo-${index}.jpg`,
                                          base64: base64String,
                                          mimetype: `image/${mimetype}`,
                                          size: 0
                                        })
                                      } else {
                                        fetch(preview)
                                          .then(response => response.blob())
                                          .then(blob => {
                                            const reader = new FileReader()
                                            reader.onloadend = () => {
                                              const base64String = reader.result.split(',')[1]
                                              resolve({
                                                filename: photoFile.name || `photo-${index}.jpg`,
                                                originalName: photoFile.name || `photo-${index}.jpg`,
                                                base64: base64String,
                                                mimetype: blob.type || 'image/jpeg',
                                                size: blob.size || 0
                                              })
                                            }
                                            reader.onerror = reject
                                            reader.readAsDataURL(blob)
                                          })
                                          .catch(reject)
                                      }
                                    } else {
                                      reject(new Error(`Fotoğraf ${index} işlenemedi`))
                                    }
                                  })
                                }
                                
                                const photoPromises = photoFilesToProcess.map((photoFile, index) => 
                                  convertPhoto(photoFile, index)
                                )
                                const convertedPhotos = await Promise.all(photoPromises)
                                photosArray.push(...convertedPhotos)
                                
                                const firstItem = cartItems[0]
                                
                                // Sipariş verisini hazırla
                                const orderData = {
                                  id: newOrderId,
                                  photos: photosArray,
                                  photo: photosArray[0] || null,
                                  items: cartItems,
                                  size: firstItem.product.size,
                                  customSize: firstItem.product.customSize,
                                  quantity: firstItem.quantity,
                                  customerInfo: {
                                    ...customerInfo,
                                    email: customerInfo.email.trim(),
                                    address: customerInfo.address.trim(),
                                    firstName: customerInfo.firstName.trim(),
                                    lastName: customerInfo.lastName.trim()
                                  },
                                  shippingType,
                                  price: finalTotal,
                                  totalPrice: totalPrice,
                                  shippingPrice: shippingPrice,
                                  status: 'Yeni',
                                  paymentStatus: 'pending',
                                  notes: `${photosArray.length} fotoğraf`,
                                  createdAt: new Date().toISOString()
                                }
                                
                                // localStorage'a kaydet
                                saveOrderToStorage(orderData)
                                
                                setPreparedOrderData(orderData)
                                setOrderId(newOrderId)
                                setShowPaymentForm(true)
                                setIsSubmitting(false)
                              } catch (error) {
                                console.error('Sipariş hazırlama hatası:', error)
                                alert('Sipariş hazırlanırken bir hata oluştu. Lütfen tekrar deneyin.')
                                setIsSubmitting(false)
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              fontSize: '0.95rem',
                              fontWeight: '600',
                              background: 'var(--primary-color)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'color 0.2s, background-color 0.2s'
                            }}
                          >
                            Ödeme Formunu Aç
                          </button>
                        )}
                      </div>
                    )}

                    {/* Ödeme Formu */}
                    {showPaymentForm && preparedOrderData && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: 'var(--bg-light)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.75rem',
                          paddingBottom: '0.6rem',
                          borderBottom: '1px solid var(--border-color)'
                        }}>
                          <h3 style={{ 
                            fontSize: '1rem', 
                            margin: 0, 
                            color: 'var(--text-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontWeight: '600'
                          }}>
                            <Icon name="lock" size={14} /> Güvenli Ödeme
                          </h3>
                          <button
                            onClick={() => {
                              setShowPaymentForm(false)
                              setPreparedOrderData(null)
                              setPaymentError(null)
                              setShow3DSecure(false)
                              setThreeDSecureHtml(null)
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-light)',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              padding: '0.25rem 0.5rem'
                            }}
                          >
                            Kapat
                          </button>
                        </div>

                        {show3DSecure && threeDSecureHtml ? (
                          <div style={{ 
                            width: '100%', 
                            minHeight: '500px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            <div style={{
                              padding: '1rem',
                              textAlign: 'center',
                              background: 'var(--bg-light)',
                              borderBottom: '1px solid var(--border-color)'
                            }}>
                              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>
                                <Icon name="lock" size={20} />
                              </div>
                              <h3 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1.1rem', fontWeight: '600' }}>3D Secure Doğrulama</h3>
                              <p style={{ margin: '0.4rem 0 0 0', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                                Güvenli ödeme için bankanızın doğrulama sayfasına yönlendiriliyorsunuz...
                              </p>
                            </div>
                            <div 
                              id="threeds-container"
                              style={{ 
                                width: '100%', 
                                minHeight: '500px',
                                padding: '0',
                                background: 'white',
                                borderRadius: '8px',
                                overflow: 'hidden'
                              }}
                            />
                          </div>
                        ) : (
                          <>
                            {paymentError && (
                              <div style={{
                                marginBottom: '0.75rem',
                                padding: '0.75rem',
                                background: '#fee',
                                border: '1px solid #fcc',
                                borderRadius: '6px',
                                color: '#c33',
                                fontSize: '0.85rem'
                              }}>
                                {paymentError}
                              </div>
                            )}

                            <PaymentForm 
                              onSubmit={handlePaymentSubmit}
                              loading={isSubmitting}
                              error={paymentError}
                            />

                            {/* Güvenlik Bilgisi */}
                            <div style={{
                              marginTop: '0.75rem',
                              padding: '0.6rem',
                              background: 'var(--bg-gray)',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              textAlign: 'center',
                              fontSize: '0.7rem',
                              color: 'var(--text-light)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              lineHeight: '1.4'
                            }}>
                              <Icon name="lock" size={11} />
                              <span>Ödemeleriniz 256-bit SSL sertifikası ile korunmaktadır. Kart bilgileriniz hiçbir şekilde saklanmaz.</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Başarı Mesajı */}
                    {submitSuccess && (
                      <div style={{
                        background: '#f8fafc',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: 'var(--text-color)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow)',
                        marginTop: '1rem'
                      }}>
                        <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: 'var(--primary-color)' }}>
                          <Icon name="check" size={24} />
                        </div>
                        <h3 style={{ marginBottom: '0.4rem', fontSize: '1.1rem', fontWeight: '600' }}>Sipariş Başarıyla Oluşturuldu!</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>
                          Sipariş No: <strong>#{orderId}</strong>
                        </p>
                        <Link
                          to="/"
                          className="btn btn-primary btn-small"
                        >
                          Ana Sayfaya Dön
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Fotoğraf Yönetim Modal */}
      {selectedItemGroup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '2rem'
        }}
        onClick={() => setSelectedItemGroup(null)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#2c3e50' }}>
                  {selectedItemGroup.productName || 'Fotoğraf Baskı'}
                </h2>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '0.35rem 0.75rem',
                    background: '#e3f2fd',
                    color: '#1976d2',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    Boyut: {selectedItemGroup.size === 'custom' && selectedItemGroup.customSize
                      ? `${selectedItemGroup.customSize.width}x${selectedItemGroup.customSize.height} cm`
                      : selectedItemGroup.size}
                  </span>
                  <span style={{
                    padding: '0.35rem 0.75rem',
                    background: '#fff3e0',
                    color: '#f57c00',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    Adet: {selectedItemGroup.quantity}
                  </span>
                  <span style={{
                    padding: '0.35rem 0.75rem',
                    background: '#f3e5f5',
                    color: '#7b1fa2',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    Fotoğraf: {selectedItemGroup.items.length}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItemGroup(null)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e5e7eb'
                  e.currentTarget.style.transform = 'rotate(90deg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                  e.currentTarget.style.transform = 'rotate(0deg)'
                }}
                title="Kapat"
              >
                ✕
              </button>
            </div>

            {/* Fotoğraflar Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              {selectedItemGroup.items.map((item, itemIndex) => (
                <div
                  key={item.id}
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '3px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea'
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <img
                    src={item.photo?.preview || item.photo?.url || '/placeholder.jpg'}
                    alt={`Fotoğraf ${itemIndex + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg'
                    }}
                  />
                  {/* Fotoğraf numarası */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(102, 126, 234, 0.9)',
                    color: 'white',
                    fontSize: '0.85rem',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    #{itemIndex + 1}
                  </div>
                  {/* Sil butonu */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (selectedItemGroup.items.length <= 1) {
                        alert('En az 1 fotoğraf olmalıdır. Tüm ürünü silmek için ürün kartındaki "Kaldır" butonunu kullanın.')
                        return
                      }
                      if (window.confirm('Bu fotoğrafı kaldırmak istediğinizden emin misiniz?')) {
                        removeFromCart(item.id)
                        // Eğer son fotoğraf kaldırıldıysa modal'ı kapat
                        if (selectedItemGroup.items.length === 1) {
                          setSelectedItemGroup(null)
                        }
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1'
                      e.currentTarget.style.background = 'rgba(220, 38, 38, 1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0'
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)'
                    }}
                    title="Fotoğrafı kaldır"
                  >
                    ✕
                  </button>
                  {/* Değiştir butonu */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.style.display = 'none'
                      input.onchange = (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          if (!file.type.startsWith('image/')) {
                            alert('Lütfen bir resim dosyası seçin')
                            document.body.removeChild(input)
                            return
                          }
                          if (file.size > 10 * 1024 * 1024) {
                            alert('Dosya boyutu çok büyük. Lütfen 10MB\'dan küçük bir dosya seçin.')
                            document.body.removeChild(input)
                            return
                          }
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            updateCartItemPhoto(item.id, {
                              ...file,
                              preview: reader.result
                            })
                          }
                          reader.readAsDataURL(file)
                        }
                        document.body.removeChild(input)
                      }
                      document.body.appendChild(input)
                      input.click()
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(37, 99, 235, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.4rem 0.7rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1'
                      e.currentTarget.style.background = 'rgba(37, 99, 235, 1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0'
                      e.currentTarget.style.background = 'rgba(37, 99, 235, 0.9)'
                    }}
                    title="Fotoğrafı değiştir"
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Icon name="camera" size={12} /> Değiştir
                    </span>
                  </button>
                </div>
              ))}
              {/* Yeni fotoğraf ekle */}
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.multiple = false
                  input.style.display = 'none'
                  input.onchange = (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (!file.type.startsWith('image/')) {
                        alert('Lütfen bir resim dosyası seçin')
                        document.body.removeChild(input)
                        return
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        alert('Dosya boyutu çok büyük. Lütfen 10MB\'dan küçük bir dosya seçin.')
                        document.body.removeChild(input)
                        return
                      }
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        const newCartItem = {
                          product: {
                            size: selectedItemGroup.size,
                            name: selectedItemGroup.productName,
                            description: '',
                            customSize: selectedItemGroup.customSize
                          },
                          photo: {
                            preview: reader.result,
                            filename: file.name,
                            mimetype: file.type,
                            size: file.size
                          },
                          quantity: selectedItemGroup.quantity,
                          price: selectedItemGroup.items[0]?.price || 0,
                          shippingType: 'standard'
                        }
                        addToCart(newCartItem)
                      }
                      reader.readAsDataURL(file)
                    }
                    document.body.removeChild(input)
                  }
                  document.body.appendChild(input)
                  input.click()
                }}
                style={{
                  aspectRatio: '1',
                  borderRadius: '12px',
                  border: '3px dashed #cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: '#f8fafc',
                  transition: 'all 0.3s ease',
                  color: '#64748b'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea'
                  e.currentTarget.style.background = '#f0f4ff'
                  e.currentTarget.style.color = '#667eea'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1'
                  e.currentTarget.style.background = '#f8fafc'
                  e.currentTarget.style.color = '#64748b'
                }}
                title="Yeni fotoğraf ekle"
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  <Icon name="plus" size={28} />
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Yeni Fotoğraf Ekle</div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => setSelectedItemGroup(null)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#f3f4f6',
                  color: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Cart

