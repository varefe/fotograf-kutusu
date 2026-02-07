import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import PaymentForm from '../components/PaymentForm'
import AlertPopup from '../components/AlertPopup'
import ConfirmPopup from '../components/ConfirmPopup'
import PhotoEditor from '../components/PhotoEditor'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { calculatePrice } from '../utils/priceCalculator'
import { API_URL } from '../config/api'
import { saveOrderToStorage } from '../utils/encryption'

function Cart() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartItems, removeFromCart, clearCart, getCartTotal, updateCartItemPhoto, addToCart, addMultipleToCart } = useCart()
  const { user, isAuthenticated, getAuthHeaders } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false) // Fotoğraflar işleniyor mu?
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [selectedItemGroup, setSelectedItemGroup] = useState(null) // Seçilen ürün grubu (tüm fotoğrafları içeren)
  const [showPaymentForm, setShowPaymentForm] = useState(false) // Ödeme formunu göster/gizle
  const [showReview, setShowReview] = useState(false) // Siparişi gözden geçir
  const [paymentCompleted, setPaymentCompleted] = useState(false) // Ödeme başarılı oldu mu?
  const [preparedOrderData, setPreparedOrderData] = useState(null) // Hazırlanan sipariş verisi
  const [paymentError, setPaymentError] = useState(null) // Ödeme hatası
  const [cardLastFour, setCardLastFour] = useState(null) // Kartın son 4 hanesi
  const [cardExpiry, setCardExpiry] = useState(null) // Kartın son kullanma tarihi (MM/YY)
  const [cvcLastDigit, setCvcLastDigit] = useState(null) // CVV'nin son hanesi
  const [showOrderSuccessPopup, setShowOrderSuccessPopup] = useState(false) // Sipariş başarı popup'ı göster
  const [orderCode, setOrderCode] = useState(null) // Sipariş kodu
  const [show3DSecure, setShow3DSecure] = useState(false) // 3D Secure göster
  const [threeDSecureHtml, setThreeDSecureHtml] = useState(null) // 3D Secure HTML içeriği
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [photoRotationIndex, setPhotoRotationIndex] = useState({})
  const [photoNextIndex, setPhotoNextIndex] = useState({})
  const [photoTransition, setPhotoTransition] = useState({})
  const [alertMessage, setAlertMessage] = useState(null)
  const [alertType, setAlertType] = useState('info')
  const [confirmMessage, setConfirmMessage] = useState(null)
  const [confirmCallback, setConfirmCallback] = useState(null)
  const [editingPhoto, setEditingPhoto] = useState(null) // Düzenlenen fotoğraf
  const [editingPhotoItemId, setEditingPhotoItemId] = useState(null) // Düzenlenen fotoğrafın item ID'si
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

  // localStorage'dan kart bilgilerini yükle
  useEffect(() => {
    const savedCardLastFour = localStorage.getItem('cardLastFour')
    const savedCardExpiry = localStorage.getItem('cardExpiry')
    const savedCvcLastDigit = localStorage.getItem('cvcLastDigit')
    
    if (savedCardLastFour) {
      setCardLastFour(savedCardLastFour)
    }
    if (savedCardExpiry) {
      setCardExpiry(savedCardExpiry)
    }
    if (savedCvcLastDigit) {
      setCvcLastDigit(savedCvcLastDigit)
    }
  }, [])

  // Modal açıkken, sepet güncellendiğinde selectedItemGroup'u güncelle
  useEffect(() => {
    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Cart.jsx:useEffect:selectedItemGroup',message:'useEffect triggered',data:{hasSelectedItemGroup:!!selectedItemGroup,selectedItemGroupId:selectedItemGroup?.id,cartItemsCount:cartItems.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
    } catch(e) {}
    // #endregion
    if (!selectedItemGroup) return
    
    try {
      // Güncel cartItems'tan aynı grup bilgisini bul
      const currentGroupKey = selectedItemGroup.id
      const matchingItems = cartItems.filter(item => {
        const key = `${item.product?.size || 'unknown'}-${item.quantity || 0}-${item.product?.name || 'unknown'}`
        return key === currentGroupKey
      })

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Cart.jsx:useEffect:selectedItemGroup',message:'Matching items found',data:{currentGroupKey,matchingItemsCount:matchingItems.length,previousItemsCount:selectedItemGroup.items.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion

      if (matchingItems.length > 0) {
        // SessionStorage'dan preview'ları yükle
        let sessionPreviews = {}
        try {
          const savedPreviews = sessionStorage.getItem('cartPreviews')
          if (savedPreviews) {
            sessionPreviews = JSON.parse(savedPreviews)
          }
        } catch (e) {
          // SessionStorage okuma hatası olursa sessizce devam et
        }
        
        // Preview'ları items'lara ekle
        const itemsWithPreviews = matchingItems.map(item => ({
          ...item,
          photo: item.photo ? {
            ...item.photo,
            preview: item.photo.preview || sessionPreviews[item.id] || undefined
          } : undefined
        }))
        
        // İlk item'dan grup bilgilerini al
        const firstItem = itemsWithPreviews[0]
        const currentGroup = {
          id: currentGroupKey,
          size: firstItem.product?.size,
          quantity: firstItem.quantity,
          productName: firstItem.product?.name,
          customSize: firstItem.product?.customSize,
          items: itemsWithPreviews,
          totalPrice: 0
        }
        
        // Grup fiyatını hesapla
        const totalQuantity = currentGroup.items.length
        const sizePrices = {
          '10x15': 16,
          '15x20': 19,
          '20x30': 26,
          '30x40': 36
        }
        const unitPrice = sizePrices[currentGroup.size] || 26
        currentGroup.totalPrice = totalQuantity * unitPrice
        
        // Sadece gerçekten değiştiyse güncelle (sonsuz döngüyü önlemek için)
        if (currentGroup.items.length !== selectedItemGroup.items.length || 
            JSON.stringify(currentGroup.items.map(i => i.id)) !== JSON.stringify(selectedItemGroup.items.map(i => i.id))) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Cart.jsx:useEffect:selectedItemGroup',message:'Updating selectedItemGroup',data:{newItemsCount:currentGroup.items.length,oldItemsCount:selectedItemGroup.items.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
          // #endregion
          setSelectedItemGroup(currentGroup)
        }
      } else {
        // Grup boşaldıysa modal'ı kapat
        setSelectedItemGroup(null)
      }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Cart.jsx:useEffect:selectedItemGroup',message:'Error in useEffect',data:{errorMessage:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      console.error('Modal güncelleme hatası:', error)
      // Hata durumunda modal'ı kapat
      setSelectedItemGroup(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems])

  // Alert gösterme helper fonksiyonu
  const showAlert = (message, type = 'warning') => {
    setAlertMessage(message)
    setAlertType(type)
  }

  // Confirm gösterme helper fonksiyonu
  const showConfirm = (message, onConfirm) => {
    setConfirmMessage(message)
    setConfirmCallback(() => onConfirm)
  }

  const handleConfirm = () => {
    if (confirmCallback) {
      confirmCallback()
    }
    setConfirmMessage(null)
    setConfirmCallback(null)
  }

  const handleCancel = () => {
    setConfirmMessage(null)
    setConfirmCallback(null)
  }

  const handleCheckout = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H1',location:'Cart.jsx:handleCheckout:start',message:'handleCheckout start',data:{isAuthenticated,cartItemsCount:cartItems.length,showContactInfo,showPaymentForm},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // Kullanıcı giriş kontrolü
    if (!isAuthenticated) {
      showAlert('Sipariş verebilmek için lütfen giriş yapın veya kayıt olun', 'warning')
      navigate('/login', { 
        state: { 
          from: '/cart',
          message: 'Sipariş verebilmek için lütfen giriş yapın veya kayıt olun.'
        } 
      })
      return
    }

    if (cartItems.length === 0) {
      showAlert('Sepetiniz boş', 'warning')
      return
    }

    if (!customerInfo.email || !customerInfo.address) {
      showAlert('Lütfen e-posta ve adres bilgilerini doldurun', 'warning')
      return
    }

    // Adres uzunluk kontrolü
    if (customerInfo.address.trim().length < 10) {
      showAlert('Adres en az 10 karakter olmalıdır', 'warning')
      return
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerInfo.email.trim())) {
      showAlert('Geçerli bir e-posta adresi giriniz', 'warning')
      return
    }

    // Miktar kontrolü (minimum 15)
    const firstItem = cartItems[0]
    if (firstItem.quantity < 15) {
      showAlert('Minimum 15 adet seçmelisiniz', 'warning')
      return
    }

    setIsSubmitting(true)
    setShowContactInfo(false)
    setShowPaymentForm(true) // Hemen ödeme formunu göster
    setShowReview(false)

    // ÖNEMLİ: Önce ödeme alınacak, sonra fotoğraflar işlenip backend'e kaydedilecek
    try {
      const firstItem = cartItems[0]
      
      // Miktar kontrolü
      if (firstItem.quantity < 15) {
        showAlert('Minimum 15 adet seçmelisiniz', 'warning')
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
      
      // Kargo fiyatı (300 TL üzeri ücretsiz)
      const shippingPrice = 15
      const finalTotal = totalPrice >= 300 ? totalPrice : totalPrice + shippingPrice
      
      // Toplam fiyatı kullan (tüm grupların toplamı)
      const calculatedPrice = finalTotal

      // Sipariş verisini oluştur (fotoğraflar olmadan - ödeme sonrası işlenecek)
      const orderId = Date.now().toString()
      const orderData = {
        id: orderId,
        photos: [], // Fotoğraflar ödeme sonrası eklenecek
        photo: null, // Fotoğraflar ödeme sonrası eklenecek
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
        status: 'Bekliyor', // Sipariş durumu: 'Bekliyor', 'Ödeme Alındı', 'Başarısız', 'İptal Edildi'
        paymentStatus: 'pending', // Ödeme durumu: 'pending', 'paid', 'failed', 'cancelled'
        notes: `${cartItems.length} fotoğraf`,
        createdAt: new Date().toISOString()
      }
      
      // Sipariş verisini state'e kaydet (fotoğraflar olmadan)
      setPreparedOrderData(orderData)
      setOrderId(orderId)
      setIsSubmitting(false)
      
      // Sayfayı ödeme formuna kaydır
      setTimeout(() => {
        const paymentSection = document.getElementById('payment-section')
        if (paymentSection) {
          paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
      
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error)
      showAlert('Sipariş oluşturulurken bir hata oluştu', 'error')
      setIsSubmitting(false)
    }
  }
  
  // Sipariş durumunu güncelle
  const updateOrderStatus = async (orderId, paymentStatus, status) => {
    try {
      const apiEndpoint = API_URL === '/api' || API_URL.startsWith('/api')
        ? `/api/orders/${orderId}/payment-status`
        : API_URL.includes('://')
          ? `${API_URL}/api/orders/${orderId}/payment-status`
          : `/api/orders/${orderId}/payment-status`
      
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          paymentStatus,
          status
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.warn('Sipariş durumu güncellenemedi:', errorText)
      } else {
        const result = await response.json()
        console.log('✅ Sipariş durumu güncellendi:', { paymentStatus, status, orderId: result.order?._id || result.order?.id })
      }
    } catch (error) {
      console.error('Sipariş durumu güncelleme hatası:', error)
      // Hata olsa bile devam et
    }
  }
  
  // Fotoğrafları base64'e çevir ve backend'e gönder (ödeme başarılı olduktan sonra veya gözden geçir butonuna basıldığında)
  const processPhotosAndSaveOrder = async (orderId, orderData) => {
    try {
      setIsProcessingPhotos(true)
      
      const photosArray = []
      
      // Önce location.state'ten fotoğrafları al
      let photoFilesToProcess = []
      
      // 1. Önce File objelerini topla (location.state, photoFiles, veya cartItems'tan)
      const fileObjects = []
      if (location.state?.photos && location.state.photos.length > 0) {
        location.state.photos.forEach(photo => {
          if (photo instanceof File) {
            fileObjects.push(photo)
          }
        })
      }
      if (photoFiles && photoFiles.length > 0) {
        photoFiles.forEach(photo => {
          if (photo instanceof File && !fileObjects.includes(photo)) {
            fileObjects.push(photo)
          }
        })
      }
      // CartItems'tan file objelerini topla
      cartItems.forEach(item => {
        if (item.photo?.file instanceof File && !fileObjects.includes(item.photo.file)) {
          fileObjects.push(item.photo.file)
        }
      })
      
      // 2. Eğer File objesi varsa, onları kullan
      if (fileObjects.length > 0) {
        photoFilesToProcess = fileObjects
      } else {
        // 3. File objesi yoksa, cartItems'tan preview'ları kullan (memory'de veya sessionStorage'da tutuluyor)
        // Önce sessionStorage'dan preview'ları yükle
        let sessionPreviews = {}
        try {
          const savedPreviews = sessionStorage.getItem('cartPreviews')
          if (savedPreviews) {
            sessionPreviews = JSON.parse(savedPreviews)
          }
        } catch (e) {
          // SessionStorage okuma hatası olursa sessizce devam et
        }
        
        photoFilesToProcess = cartItems
          .map((item, index) => {
            // Önce state'teki preview'ı kontrol et, yoksa sessionStorage'dan al
            const preview = item.photo?.preview || sessionPreviews[item.id]
            return {
              preview: preview,
              filename: item.photo?.filename || `photo-${index}.jpg`,
              mimetype: item.photo?.mimetype || 'image/jpeg',
              size: item.photo?.size || 0
            }
          })
          .filter(item => item.preview) // Preview'ı olanları al
      }

      if (photoFilesToProcess.length === 0) {
        console.error('Fotoğraf bulunamadı - Debug:', {
          locationStatePhotos: location.state?.photos?.length || 0,
          photoFilesLength: photoFiles?.length || 0,
          cartItemsLength: cartItems.length,
          cartItemsWithPreview: cartItems.filter(item => item.photo?.preview).length,
          cartItemsWithFile: cartItems.filter(item => item.photo?.file instanceof File).length
        })
        throw new Error('Fotoğraflar bulunamadı')
      }

      // Her fotoğrafı base64'e çevir (optimize edilmiş - data URL'leri direkt kullan)
      const convertPhoto = (photoFile, index) => {
        return new Promise((resolve, reject) => {
          if (photoFile instanceof File) {
            // File objesi varsa - async işle
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
            // Preview varsa (memory'de tutuluyor) - SYNC işle (çok daha hızlı)
            const preview = photoFile.preview
            if (preview.startsWith('data:image/')) {
              // Data URL ise direkt base64'e çevir (SYNC - çok hızlı)
              const base64String = preview.split(',')[1]
              const mimetype = preview.match(/data:image\/([^;]+)/)?.[1] || 'jpeg'
              resolve({
                filename: photoFile.filename || `photo-${index}.jpg`,
                originalName: photoFile.filename || `photo-${index}.jpg`,
                base64: base64String,
                mimetype: `image/${mimetype}`,
                size: photoFile.size || 0
              })
            } else {
              // Blob URL ise fetch ile al (async ama nadir durum)
              fetch(preview)
                .then(response => response.blob())
                .then(blob => {
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    const base64String = reader.result.split(',')[1]
                    resolve({
                      filename: photoFile.filename || `photo-${index}.jpg`,
                      originalName: photoFile.filename || `photo-${index}.jpg`,
                      base64: base64String,
                      mimetype: blob.type || photoFile.mimetype || 'image/jpeg',
                      size: blob.size || photoFile.size || 0
                    })
                  }
                  reader.onerror = reject
                  reader.readAsDataURL(blob)
                })
                .catch(reject)
            }
          } else {
            // Ne File ne de preview varsa hata ver
            reject(new Error(`Fotoğraf ${index} işlenemedi: File objesi veya preview bulunamadı`))
          }
        })
      }

      // Önce data URL'leri (preview'lar) sync olarak işle (çok hızlı)
      const syncPhotos = []
      const asyncPhotos = []
      
      photoFilesToProcess.forEach((photoFile, index) => {
        if (photoFile instanceof File) {
          // File objesi - async işle
          asyncPhotos.push({ photoFile, index })
        } else if (photoFile.preview && photoFile.preview.startsWith('data:image/')) {
          // Data URL - sync işle (anında)
          const base64String = photoFile.preview.split(',')[1]
          const mimetype = photoFile.preview.match(/data:image\/([^;]+)/)?.[1] || 'jpeg'
          syncPhotos.push({
            filename: photoFile.filename || `photo-${index}.jpg`,
            originalName: photoFile.filename || `photo-${index}.jpg`,
            base64: base64String,
            mimetype: `image/${mimetype}`,
            size: photoFile.size || 0
          })
        } else {
          // Blob URL veya diğer - async işle
          asyncPhotos.push({ photoFile, index })
        }
      })
      
      // Sync fotoğrafları hemen ekle
      photosArray.push(...syncPhotos)
      
      // Async fotoğrafları paralel olarak işle (sadece gerekli olanlar)
      if (asyncPhotos.length > 0) {
        const photoPromises = asyncPhotos.map(({ photoFile, index }) => 
          convertPhoto(photoFile, index)
        )
        const convertedPhotos = await Promise.all(photoPromises)
        photosArray.push(...convertedPhotos)
      }
      
      // Sipariş verisini güncelle (fotoğrafları ekle)
      const updatedOrderData = {
        ...orderData,
        photos: photosArray,
        photo: photosArray[0] || null,
        notes: `${photosArray.length} fotoğraf`,
        // Ödeme durumunu belirle
        paymentStatus: orderData.paymentStatus || 'pending', // 'pending', 'paid', 'failed', 'cancelled'
        status: orderData.status || 'Bekliyor' // 'Bekliyor', 'Ödeme Alındı', 'Başarısız', 'İptal Edildi'
      }
      
      // Backend'e kaydet
      const apiEndpoint = API_URL === '/api' || API_URL.startsWith('/api')
        ? '/api/orders'
        : API_URL.includes('://')
          ? `${API_URL}/api/orders`
          : '/api/orders'
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedOrderData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Sipariş kaydedilemedi: ${errorText}`)
      }
      
      const result = await response.json()
      console.log('✅ Sipariş veritabanına kaydedildi:', result)
      
      // Backend'den dönen sipariş bilgilerini al
      const savedOrder = result.order || result
      const savedOrderId = savedOrder?._id || savedOrder?.id || orderId
      const orderGroupId = savedOrder?.orderGroupId
      
      // localStorage'a kaydet (base64'ler dahil)
      const updatedOrderDataWithId = {
        ...updatedOrderData,
        id: savedOrderId.toString(),
        orderGroupId: orderGroupId // orderGroupId'yi de ekle
      }
      saveOrderToStorage(updatedOrderDataWithId)
      
      setIsProcessingPhotos(false)
      return updatedOrderDataWithId
    } catch (error) {
      console.error('Fotoğrafları işleme hatası:', error)
      setIsProcessingPhotos(false)
      throw error
    }
  }

  // Sepet öğelerini grupla (aynı size, quantity, product.name olanları)
  // SessionStorage'dan preview'ları yükle
  let sessionPreviews = {}
  try {
    const savedPreviews = sessionStorage.getItem('cartPreviews')
    if (savedPreviews) {
      sessionPreviews = JSON.parse(savedPreviews)
    }
  } catch (e) {
    // SessionStorage okuma hatası olursa sessizce devam et
  }
  
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
    // Preview'ı sessionStorage'dan yükle
    const itemWithPreview = {
      ...item,
      photo: item.photo ? {
        ...item.photo,
        preview: item.photo.preview || sessionPreviews[item.id] || undefined
      } : undefined
    }
    groups[key].items.push(itemWithPreview)
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
  
  // Debug: Grup fiyatlarını logla (sadece development modunda ve sınırlı sayıda)
  // Bu loglar render sırasında çalıştığı için sonsuz döngüye neden olabilir - kaldırıldı
  // Gerekirse useMemo veya useEffect içinde loglama yapılmalı

  const groupedItemsArray = Object.values(groupedCartItems)
  const rotationKey = groupedItemsArray
    .map((group) => `${group.id}:${group.items.length}`)
    .join('|')
  const activeTab = showReview
    ? 'review'
    : showPaymentForm
      ? 'payment'
      : showContactInfo
        ? 'contact'
        : 'summary'
  const rightPanelMinHeight = isMobile ? 'auto' : '520px'
  const resetPaymentState = () => {
    setShowPaymentForm(false)
    setPreparedOrderData(null)
    setPaymentError(null)
    setShow3DSecure(false)
    setThreeDSecureHtml(null)
    setPaymentCompleted(false) // Ödeme durumunu sıfırla
    // Kart bilgilerini localStorage'dan silme - review sekmesinde görünmeye devam etsin
    // setCardLastFour(null) // Kart bilgisini sıfırla
    // setCardExpiry(null) // Son kullanma tarihini sıfırla
    // setCvcLastDigit(null) // CVV bilgisini sıfırla
  }
  const goToSummary = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run_tabs',hypothesisId:'H1',location:'Cart.jsx:goToSummary',message:'goToSummary called',data:{activeTab,showContactInfo,showPaymentForm},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setShowReview(false)
    resetPaymentState()
    setShowContactInfo(false)
  }
  const goToContact = () => {
    if (!isAuthenticated) {
      return
    }
    
    // Fotoğraf adedi kontrolü (minimum 15)
    const totalPhotoCount = cartItems.length
    if (totalPhotoCount < 15) {
      showAlert(`Minimum 15 fotoğraf seçmelisiniz. Şu anda sepette ${totalPhotoCount} fotoğraf var.`, 'warning')
      return
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run_tabs',hypothesisId:'H2',location:'Cart.jsx:goToContact',message:'goToContact called',data:{activeTab,showContactInfo,showPaymentForm,isAuthenticated},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setShowReview(false)
    resetPaymentState()
    setShowContactInfo(true)
  }
  const goToPayment = () => {
    if (showPaymentForm) return
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run_tabs',hypothesisId:'H3',location:'Cart.jsx:goToPayment',message:'goToPayment called',data:{activeTab,showContactInfo,showPaymentForm,cartItemsCount:cartItems.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setShowReview(false)
    handleCheckout()
  }
  const goToReview = async () => {
    // Ödeme başarılı olduysa sipariş zaten oluşturulmuş, sadece gözden geçir sekmesine geç
    // Ödeme yapılmadıysa ve sipariş oluşturulmadıysa, burada sipariş oluşturulmayacak
    // Kullanıcı "Siparişi Oluştur" butonuna basmalı
    
    setShowReview(true)
    setShowContactInfo(false)
    setShowPaymentForm(false)
  }
  
  // "Siparişi Gözden Geçir" butonuna basıldığında siparişi veritabanına kaydet (fotoğraflar olmadan)
  const saveOrderForReview = async () => {
    if (!orderId || !preparedOrderData) {
      showAlert('Sipariş bilgileri bulunamadı. Lütfen tekrar deneyin.', 'error')
      return { success: false, result: null }
    }
    
    try {
      setIsProcessingPhotos(true)
      
      // Fotoğraflar OLMADAN sadece iletişim bilgileri ve durumu kaydet
      // Test modu için paymentStatus: 'test' gönder (backend'de validasyon atlanır)
      const orderDataWithoutPhotos = {
        ...preparedOrderData,
        photos: [], // Fotoğraflar boş
        photo: null, // Fotoğraflar boş
        paymentStatus: 'test', // Test modu - backend'de validasyon atlanır
        status: 'Bekliyor',
        notes: `${cartItems.length} fotoğraf (ödeme sonrası eklenecek)`
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H1',location:'Cart.jsx:saveOrderForReview',message:'Sending order data',data:{paymentStatus:orderDataWithoutPhotos.paymentStatus,hasToken:!!localStorage.getItem('token'),orderId},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      
      // Backend'e kaydet (fotoğraflar olmadan)
      const apiEndpoint = API_URL === '/api' || API_URL.startsWith('/api')
        ? '/api/orders'
        : API_URL.includes('://')
          ? `${API_URL}/api/orders`
          : '/api/orders'
      
      // Test modunda token gönderme (optionalAuth token olmadan da çalışır)
      const headers = {
        'Content-Type': 'application/json'
      }
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H1',location:'Cart.jsx:saveOrderForReview',message:'Fetch request',data:{apiEndpoint,hasAuthHeader:!!headers.Authorization,paymentStatus:orderDataWithoutPhotos.paymentStatus},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderDataWithoutPhotos)
      })
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H1',location:'Cart.jsx:saveOrderForReview',message:'Response received',data:{status:response.status,statusText:response.statusText,ok:response.ok},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Sipariş kaydedilemedi: ${errorText}`)
      }
      
      const result = await response.json()
      console.log('✅ Sipariş veritabanına kaydedildi (fotoğraflar olmadan):', result)
      
      // Sipariş kodu oluştur (orderGroupId varsa onu kullan, yoksa sipariş ID'sini kullan)
      const savedOrder = result.order || result
      const orderGroupId = savedOrder?.orderGroupId
      // Sipariş ID'sini al (MongoDB ObjectId formatında olmalı)
      const savedOrderId = savedOrder?._id || savedOrder?.id
      console.log('🔍 Sipariş ID:', savedOrderId, 'Type:', typeof savedOrderId)
      
      let newOrderCode
      if (orderGroupId) {
        // orderGroupId'den sipariş kodu oluştur (son 8 karakteri al)
        newOrderCode = orderGroupId.replace('GROUP-', '').substring(0, 8).toUpperCase()
      } else {
        // orderGroupId yoksa sipariş ID'sini kullan
        newOrderCode = savedOrderId ? savedOrderId.toString().slice(-8).toUpperCase() : orderId.toString().slice(-8).toUpperCase()
      }
      setOrderCode(newOrderCode)
      
      setIsProcessingPhotos(false)
      return { success: true, result, orderId: savedOrderId } // orderId'yi de döndür
    } catch (error) {
      console.error('Sipariş kaydetme hatası:', error)
      showAlert('Sipariş kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.', 'error')
      setIsProcessingPhotos(false)
      return { success: false, result: null }
    }
  }

  // Siparişi oluştur (ödeme olmadan - test için)
  const createOrderWithoutPayment = async () => {
    // Önce sipariş verilerini hazırla (eğer yoksa)
    if (!preparedOrderData) {
      // Sipariş verilerini oluştur
      if (cartItems.length === 0) {
        showAlert('Sepetiniz boş', 'warning')
        return
      }

      if (!customerInfo.email || !customerInfo.address) {
        showAlert('Lütfen e-posta ve adres bilgilerini doldurun', 'warning')
        return
      }

      const firstItem = cartItems[0]
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
        const totalQuantity = groups[key].items.length
        const sizePrices = {
          '10x15': 16,
          '15x20': 19,
          '20x30': 26,
          '30x40': 36
        }
        const unitPrice = sizePrices[item.product?.size] || 26
        groups[key].totalPrice = totalQuantity * unitPrice
        return groups
      }, {})
      
      const groupedItemsArray = Object.values(groupedCartItems)
      const totalPrice = groupedItemsArray.reduce((sum, group) => sum + (group.totalPrice || 0), 0)
      const shippingPrice = 15
      const finalTotal = totalPrice >= 300 ? totalPrice : totalPrice + shippingPrice

      const newOrderId = Date.now().toString()
      const newOrderData = {
        id: newOrderId,
        photos: [],
        photo: null,
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
        price: finalTotal,
        status: 'Bekliyor',
        paymentStatus: 'test',
        notes: `${cartItems.length} fotoğraf`,
        createdAt: new Date().toISOString()
      }
      
      setPreparedOrderData(newOrderData)
      setOrderId(newOrderId)
    }

    // Önce siparişi fotoğraflar OLMADAN kaydet (sipariş ID'si için)
    const saveResult = await saveOrderForReview()
    if (!saveResult.success) {
      return false
    }

    const result = saveResult.result
    if (!result) {
      showAlert('Sipariş kaydedilemedi', 'error')
      return false
    }

    // Sipariş kodu oluştur (orderGroupId varsa onu kullan, yoksa sipariş ID'sini kullan)
    const savedOrder = result.order || result
    const orderGroupId = savedOrder?.orderGroupId
    // Sipariş ID'sini al (MongoDB ObjectId formatında olmalı)
    const savedOrderId = savedOrder?._id || savedOrder?.id || saveResult.orderId
    console.log('🔍 createOrderWithoutPayment - Sipariş ID:', savedOrderId, 'Type:', typeof savedOrderId)
    
    if (!savedOrderId) {
      console.error('❌ Sipariş ID bulunamadı!', { savedOrder, result, saveResult })
      showAlert('Sipariş ID bulunamadı. Lütfen tekrar deneyin.', 'error')
      return false
    }
    
    let newOrderCode
    if (orderGroupId) {
      // orderGroupId'den sipariş kodu oluştur (son 8 karakteri al)
      newOrderCode = orderGroupId.replace('GROUP-', '').substring(0, 8).toUpperCase()
    } else {
      // orderGroupId yoksa sipariş ID'sini kullan
      newOrderCode = savedOrderId.toString().slice(-8).toUpperCase()
    }
    setOrderCode(newOrderCode)
    setShowOrderSuccessPopup(true)

    // Şimdi fotoğrafları işle ve siparişi güncelle
    try {
      setIsProcessingPhotos(true)
      
      // Fotoğrafları base64'e çevir
      const photosArray = []
      
      // Önce location.state'ten fotoğrafları al
      let photoFilesToProcess = []
      
      // 1. Önce File objelerini topla
      const fileObjects = []
      if (location.state?.photos && location.state.photos.length > 0) {
        location.state.photos.forEach(photo => {
          if (photo instanceof File) {
            fileObjects.push(photo)
          }
        })
      }
      if (photoFiles && photoFiles.length > 0) {
        photoFiles.forEach(photo => {
          if (photo instanceof File && !fileObjects.includes(photo)) {
            fileObjects.push(photo)
          }
        })
      }
      cartItems.forEach(item => {
        if (item.photo?.file instanceof File && !fileObjects.includes(item.photo.file)) {
          fileObjects.push(item.photo.file)
        }
      })
      
      // 2. Eğer File objesi varsa, onları kullan
      if (fileObjects.length > 0) {
        photoFilesToProcess = fileObjects
      } else {
        // 3. File objesi yoksa, cartItems'tan preview'ları kullan
        let sessionPreviews = {}
        try {
          const savedPreviews = sessionStorage.getItem('cartPreviews')
          if (savedPreviews) {
            sessionPreviews = JSON.parse(savedPreviews)
          }
        } catch (e) {}
        
        photoFilesToProcess = cartItems
          .map((item, index) => {
            const preview = item.photo?.preview || sessionPreviews[item.id]
            return {
              preview: preview,
              filename: item.photo?.filename || `photo-${index}.jpg`,
              mimetype: item.photo?.mimetype || 'image/jpeg',
              size: item.photo?.size || 0
            }
          })
          .filter(item => item.preview)
      }

      if (photoFilesToProcess.length === 0) {
        console.warn('Fotoğraf bulunamadı, sipariş fotoğrafsız kaydedildi')
        setIsProcessingPhotos(false)
        return true
      }

      // Fotoğrafları base64'e çevir
      const convertPhoto = (photoFile, index) => {
        return new Promise((resolve, reject) => {
          if (photoFile instanceof File) {
            const reader = new FileReader()
            reader.onloadend = () => {
              const base64String = reader.result.split(',')[1]
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H2',location:'Cart.jsx:convertPhoto',message:'Photo converted from File',data:{index,base64Length:base64String?.length,filename:photoFile.name}})}).catch(()=>{});
              // #endregion
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
          } else if (photoFile.preview && photoFile.preview.startsWith('data:image/')) {
            const base64String = photoFile.preview.split(',')[1]
            const mimetype = photoFile.preview.match(/data:image\/([^;]+)/)?.[1] || 'jpeg'
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H2',location:'Cart.jsx:convertPhoto',message:'Photo converted from preview',data:{index,base64Length:base64String?.length,filename:photoFile.filename}})}).catch(()=>{});
            // #endregion
            resolve({
              filename: photoFile.filename || `photo-${index}.jpg`,
              originalName: photoFile.filename || `photo-${index}.jpg`,
              base64: base64String,
              mimetype: `image/${mimetype}`,
              size: photoFile.size || 0
            })
          } else {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H2',location:'Cart.jsx:convertPhoto',message:'Photo conversion failed',data:{index,hasFile:photoFile instanceof File,hasPreview:!!photoFile.preview}})}).catch(()=>{});
            // #endregion
            reject(new Error(`Fotoğraf ${index} işlenemedi`))
          }
        })
      }

      // Sync ve async fotoğrafları ayır
      const syncPhotos = []
      const asyncPhotos = []
      
      photoFilesToProcess.forEach((photoFile, index) => {
        if (photoFile instanceof File) {
          asyncPhotos.push({ photoFile, index })
        } else if (photoFile.preview && photoFile.preview.startsWith('data:image/')) {
          const base64String = photoFile.preview.split(',')[1]
          const mimetype = photoFile.preview.match(/data:image\/([^;]+)/)?.[1] || 'jpeg'
          syncPhotos.push({
            filename: photoFile.filename || `photo-${index}.jpg`,
            originalName: photoFile.filename || `photo-${index}.jpg`,
            base64: base64String,
            mimetype: `image/${mimetype}`,
            size: photoFile.size || 0
          })
        } else {
          asyncPhotos.push({ photoFile, index })
        }
      })
      
      photosArray.push(...syncPhotos)
      
      if (asyncPhotos.length > 0) {
        const photoPromises = asyncPhotos.map(({ photoFile, index }) => 
          convertPhoto(photoFile, index)
        )
        const convertedPhotos = await Promise.all(photoPromises)
        photosArray.push(...convertedPhotos)
      }
      
      // Mevcut siparişi güncelle (PATCH)
      // savedOrderId'nin string formatında olduğundan emin ol
      const orderIdString = savedOrderId ? savedOrderId.toString() : orderId.toString()
      console.log('🔍 PATCH için sipariş ID:', orderIdString)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H3',location:'Cart.jsx:createOrderWithoutPayment:PATCH',message:'Sending PATCH request with photos',data:{orderId:orderIdString,photosCount:photosArray.length,hasPhotos:photosArray.length>0,firstPhotoBase64Length:photosArray[0]?.base64?.length}})}).catch(()=>{});
      // #endregion
      
      const apiEndpoint = API_URL === '/api' || API_URL.startsWith('/api')
        ? `/api/orders/${orderIdString}`
        : API_URL.includes('://')
          ? `${API_URL}/api/orders/${orderIdString}`
          : `/api/orders/${orderIdString}`
      
      const headers = {
        'Content-Type': 'application/json'
      }
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const updateResponse = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          photos: photosArray,
          photo: photosArray[0] || null,
          notes: `${photosArray.length} fotoğraf`
        })
      })
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H1',location:'Cart.jsx:createOrderWithoutPayment:PATCH',message:'PATCH response received',data:{status:updateResponse.status,ok:updateResponse.ok}})}).catch(()=>{});
      // #endregion
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text()
        console.error('Sipariş güncelleme hatası:', errorText)
        throw new Error(`Fotoğraflar kaydedilemedi: ${errorText}`)
      }
      
      const updateResult = await updateResponse.json()
      console.log('✅ Fotoğraflar siparişe eklendi:', updateResult)
      
      // Güncellenmiş siparişten orderGroupId'yi al ve sipariş kodunu güncelle
      const updatedOrder = updateResult.order || updateResult
      const updatedOrderGroupId = updatedOrder?.orderGroupId
      if (updatedOrderGroupId && !orderCode) {
        // Eğer sipariş kodu henüz oluşturulmadıysa, orderGroupId'den oluştur
        const newOrderCode = updatedOrderGroupId.replace('GROUP-', '').substring(0, 8).toUpperCase()
        setOrderCode(newOrderCode)
      }
      
      setIsProcessingPhotos(false)
      return true
    } catch (error) {
      console.error('Fotoğrafları kaydetme hatası:', error)
      showAlert('Sipariş oluşturuldu ancak fotoğraflar kaydedilirken bir hata oluştu. Lütfen destek ekibiyle iletişime geçin.', 'warning')
      setIsProcessingPhotos(false)
      // Sipariş oluşturuldu ama fotoğraflar kaydedilemedi - yine de başarılı say
      return true
    }
  }
  const canGoBack = activeTab !== 'summary'
  // Fotoğraf adedi kontrolü: summary'den contact'e geçerken minimum 15 fotoğraf olmalı
  const totalPhotoCount = cartItems.length
  const canGoNext = activeTab !== 'review' && (isAuthenticated || activeTab !== 'summary') && (activeTab !== 'summary' || totalPhotoCount >= 15)
  const goBack = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run_tabs',hypothesisId:'H4',location:'Cart.jsx:goBack',message:'goBack clicked',data:{activeTab},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (activeTab === 'review') {
      setShowReview(false)
      setShowPaymentForm(true)
    } else if (activeTab === 'payment') {
      goToContact()
    } else if (activeTab === 'contact') {
      goToSummary()
    }
  }
  const goNext = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run_tabs',hypothesisId:'H5',location:'Cart.jsx:goNext',message:'goNext clicked',data:{activeTab,isAuthenticated},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (activeTab === 'summary') {
      // Fotoğraf adedi kontrolü (minimum 15)
      const totalPhotoCount = cartItems.length
      if (totalPhotoCount < 15) {
        showAlert(`Minimum 15 fotoğraf seçmelisiniz. Şu anda sepette ${totalPhotoCount} fotoğraf var.`, 'warning')
        return
      }
      goToContact()
    } else if (activeTab === 'contact') {
      goToPayment()
    } else if (activeTab === 'payment') {
      // Gözden geçir sekmesine geç
      goToReview()
    }
  }
  const renderStepNav = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem'
    }}>
      <button
        onClick={goBack}
        disabled={!canGoBack}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '999px',
          border: '1px solid #e2e8f0',
          background: canGoBack ? '#ffffff' : '#f1f5f9',
          color: canGoBack ? '#1f2937' : '#94a3b8',
          cursor: canGoBack ? 'pointer' : 'not-allowed',
          fontSize: '1rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label="Geri"
      >
        ←
      </button>
      <button
        onClick={goNext}
        disabled={!canGoNext}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '999px',
          border: '1px solid #e2e8f0',
          background: canGoNext ? '#ffffff' : '#f1f5f9',
          color: canGoNext ? '#1f2937' : '#94a3b8',
          cursor: canGoNext ? 'pointer' : 'not-allowed',
          fontSize: '1rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label="İleri"
      >
        →
      </button>
    </div>
  )

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

      // Kart bilgilerini sakla (hem state'e hem localStorage'a)
      if (cardData.cardNumber) {
        const cardNumber = cardData.cardNumber.replace(/\s/g, '') // Boşlukları temizle
        const lastFour = cardNumber.slice(-4) // Son 4 haneyi al
        setCardLastFour(lastFour)
        localStorage.setItem('cardLastFour', lastFour)
      }
      
      // Son kullanma tarihini sakla
      if (cardData.expireMonth && cardData.expireYear) {
        const expiry = `${cardData.expireMonth}/${cardData.expireYear}`
        setCardExpiry(expiry)
        localStorage.setItem('cardExpiry', expiry)
      }
      
      // CVV'nin son hanesini sakla
      if (cardData.cvc) {
        const cvc = String(cardData.cvc).trim()
        const lastDigit = cvc.slice(-1) // Son haneyi al
        setCvcLastDigit(lastDigit)
        localStorage.setItem('cvcLastDigit', lastDigit)
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
          // Ödeme başarılı oldu, önce state'i güncelle
          setPaymentCompleted(true)
          
          // Sipariş durumunu "Ödeme Alındı" olarak güncelle
          try {
            await updateOrderStatus(orderId, 'paid', 'Ödeme Alındı')
          } catch (updateError) {
            console.error('Sipariş durumu güncelleme hatası:', updateError)
          }
          
          // Ödeme başarılı oldu, şimdi fotoğrafları işle ve backend'e kaydet
          try {
            const savedOrder = await processPhotosAndSaveOrder(orderId, {
              ...preparedOrderData,
              paymentStatus: 'paid',
              status: 'Ödeme Alındı'
            })
            
            // Sipariş kodu oluştur (orderGroupId varsa onu kullan, yoksa sipariş ID'sini kullan)
            // processPhotosAndSaveOrder yeni bir sipariş oluşturuyor, backend'den orderGroupId dönecek
            // Backend'den dönen sonucu kontrol et
            const orderGroupId = savedOrder?.orderGroupId
            let newOrderCode
            if (orderGroupId) {
              // orderGroupId'den sipariş kodu oluştur
              newOrderCode = orderGroupId.replace('GROUP-', '').substring(0, 8).toUpperCase()
            } else {
              // orderGroupId yoksa sipariş ID'sini kullan
              const savedOrderId = savedOrder?.id || orderId
              newOrderCode = savedOrderId.toString().slice(-8).toUpperCase()
            }
            setOrderCode(newOrderCode)
            
            navigate(`/payment/success?orderId=${orderId}`)
          } catch (photoError) {
            console.error('Fotoğraf işleme hatası:', photoError)
            // Fotoğraf işleme hatası olsa bile ödeme başarılı olduğu için success sayfasına git
            // Ama kullanıcıya bilgi ver
            showAlert('Ödeme başarılı ancak fotoğraflar kaydedilirken bir sorun oluştu. Lütfen destek ekibiyle iletişime geçin.', 'warning')
            navigate(`/payment/success?orderId=${orderId}`)
          }
        }
      } else {
        // Ödeme başarısız - sipariş durumunu güncelle
        const errorMessage = data.error || data.message || 'Ödeme başlatılamadı'
        setPaymentError(errorMessage)
        
        // Bakiye yetersiz veya yanlış kart bilgisi kontrolü
        const isPaymentFailed = errorMessage.toLowerCase().includes('bakiye') || 
                                errorMessage.toLowerCase().includes('yetersiz') ||
                                errorMessage.toLowerCase().includes('geçersiz') ||
                                errorMessage.toLowerCase().includes('yanlış') ||
                                errorMessage.toLowerCase().includes('failed') ||
                                errorMessage.toLowerCase().includes('declined')
        
        if (orderId && preparedOrderData) {
          try {
            await updateOrderStatus(
              orderId, 
              isPaymentFailed ? 'failed' : 'pending',
              isPaymentFailed ? 'Başarısız' : 'Bekliyor'
            )
          } catch (updateError) {
            console.error('Sipariş durumu güncelleme hatası:', updateError)
          }
        }
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

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H3',location:'Cart.jsx:paymentView:state',message:'payment/contact visibility',data:{showPaymentForm,hasPreparedOrderData:!!preparedOrderData,showContactInfo},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [showPaymentForm, preparedOrderData, showContactInfo])

  // Sepet toplamını hesapla (tüm grupların fiyatlarını topla)
  // Her grup tek bir ürün olarak gösteriliyor, tüm grupların toplamını al
  const totalPrice = groupedItemsArray.reduce((sum, group) => sum + (group.totalPrice || 0), 0)
  
  // Kargo fiyatı (300 TL üzeri ücretsiz)
  const shippingPrice = 15
  const finalTotal = totalPrice >= 300 ? totalPrice : totalPrice + shippingPrice
  
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
  
  // Debug logları kaldırıldı - render sırasında çalıştığı için sonsuz döngüye neden oluyordu
  // Gerekirse useMemo veya useEffect içinde loglama yapılmalı

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
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr',
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
                          background: '#ede9fe',
                          color: '#5b21b6',
                          borderRadius: '999px',
                          border: '1px solid #ddd6fe',
                          fontWeight: 600
                        }}>
                          {group.items.length} Fotoğraf
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
                        // Preview'ları sessionStorage'dan yükle
                        let sessionPreviews = {}
                        try {
                          const savedPreviews = sessionStorage.getItem('cartPreviews')
                          if (savedPreviews) {
                            sessionPreviews = JSON.parse(savedPreviews)
                          }
                        } catch (e) {
                          // SessionStorage okuma hatası olursa sessizce devam et
                        }
                        // Preview'ları items'lara ekle
                        const groupWithPreviews = {
                          ...group,
                          items: group.items.map(item => ({
                            ...item,
                            photo: item.photo ? {
                              ...item.photo,
                              preview: item.photo.preview || sessionPreviews[item.id] || undefined
                            } : undefined
                          }))
                        }
                        setSelectedItemGroup(groupWithPreviews)
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
                  showConfirm('Sepetinizdeki tüm ürünleri kaldırmak istediğinizden emin misiniz?', () => {
                    clearCart()
                  })
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
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '0.4rem',
                padding: '0.35rem',
                background: '#f1f5f9',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                marginBottom: '1rem',
                width: '100%'
              }}>
                {[
                  { id: 'summary', label: 'Sipariş Özeti' },
                  { id: 'contact', label: 'İletişim' },
                  { id: 'payment', label: 'Ödeme' },
                  { id: 'review', label: 'Gözden Geçir' }
                ].map((tab) => {
                  const isActive = activeTab === tab.id
                  const handleTabClick = () => {
                    // Fotoğraf adedi kontrolü: contact, payment ve review sekmelerine geçerken minimum 15 fotoğraf olmalı
                    if (tab.id === 'summary') {
                      goToSummary()
                    } else if (tab.id === 'contact') {
                      const totalPhotoCount = cartItems.length
                      if (totalPhotoCount < 15) {
                        showAlert(`Minimum 15 fotoğraf seçmelisiniz. Şu anda sepette ${totalPhotoCount} fotoğraf var.`, 'warning')
                        return
                      }
                      goToContact()
                    } else if (tab.id === 'review') {
                      // Gözden geçir sekmesine geç
                      goToReview()
                    } else {
                      // payment sekmesi için de kontrol
                      const totalPhotoCount = cartItems.length
                      if (totalPhotoCount < 15) {
                        showAlert(`Minimum 15 fotoğraf seçmelisiniz. Şu anda sepette ${totalPhotoCount} fotoğraf var.`, 'warning')
                        return
                      }
                      goToPayment()
                    }
                  }
                  return (
                    <div
                      key={tab.id}
                      onClick={handleTabClick}
                      style={{
                        width: '100%',
                        minWidth: 0,
                        maxWidth: '100%',
                        textAlign: 'center',
                        padding: isMobile ? '0.5rem 0.25rem' : '0.55rem 0.4rem',
                        fontSize: isMobile ? '0.65rem' : '0.7rem',
                        fontWeight: 600,
                        borderRadius: '10px',
                        background: isActive ? '#2563eb' : 'transparent',
                        color: isActive ? '#ffffff' : (
                          (tab.id !== 'summary' && cartItems.length < 15)
                            ? '#94a3b8' 
                            : '#64748b'
                        ),
                        transition: 'all 0.2s ease',
                        cursor: (
                          (tab.id !== 'summary' && cartItems.length < 15)
                        ) ? 'not-allowed' : 'pointer',
                        userSelect: 'none',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        opacity: (
                          (tab.id !== 'summary' && cartItems.length < 15)
                        ) ? 0.5 : 1,
                        boxSizing: 'border-box'
                      }}
                      title={
                        tab.id !== 'summary' && cartItems.length < 15 
                          ? 'Minimum 15 fotoğraf seçmelisiniz' 
                          : ''
                      }
                    >
                      {tab.label}
                    </div>
                  )
                })}
              </div>
              {showPaymentForm && (
                <div id="payment-section" style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  minHeight: rightPanelMinHeight,
                  position: isMobile ? 'relative' : 'sticky',
                  top: isMobile ? '0' : '2rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  {renderStepNav()}
                  {isProcessingPhotos && (
                    <div style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: '1rem', color: '#475569', marginBottom: '0.5rem' }}>
                        ⏳ Fotoğraflar işleniyor...
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        Lütfen bekleyin, bu işlem birkaç saniye sürebilir.
                      </div>
                    </div>
                  )}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.25rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '2px solid #e5e7eb'
                  }}>
                    <h2 style={{ 
                      fontSize: '1.3rem', 
                      margin: 0, 
                      color: '#2c3e50',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Icon name="lock" size={18} /> Güvenli Ödeme
                    </h2>
                  </div>

                  {show3DSecure && threeDSecureHtml ? (
                    <div style={{ 
                      width: '100%', 
                      minHeight: '560px',
                      border: '1px solid #e9ecef',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        padding: '1rem',
                        textAlign: 'center',
                        background: '#f8f9fa',
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        <div style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
                          <Icon name="lock" size={22} />
                        </div>
                        <h3 style={{ margin: 0, color: '#2c3e50' }}>3D Secure Doğrulama</h3>
                        <p style={{ margin: '0.4rem 0 0 0', color: '#6c757d', fontSize: '0.9rem' }}>
                          Güvenli ödeme için bankanızın doğrulama sayfasına yönlendiriliyorsunuz...
                        </p>
                      </div>
                      <div 
                        id="threeds-container"
                        style={{ 
                          width: '100%', 
                          minHeight: '520px',
                          padding: '0',
                          background: 'white',
                          borderRadius: '12px',
                          overflow: 'hidden'
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      {preparedOrderData && (
                        <div style={{ 
                          marginBottom: '1.25rem', 
                          padding: '0.9rem',
                          background: '#f8f9fa',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <p style={{ 
                            margin: 0, 
                            color: '#2c3e50', 
                            fontSize: '1.05rem', 
                            fontWeight: 'bold' 
                          }}>
                            Toplam: {new Intl.NumberFormat('tr-TR', { 
                              style: 'currency', 
                              currency: 'TRY' 
                            }).format(preparedOrderData.price || 0)}
                          </p>
                        </div>
                      )}
                      
                      {paymentError && (
                        <div style={{
                          marginBottom: '1rem',
                          padding: '1rem',
                          background: '#fee',
                          border: '1px solid #fcc',
                          borderRadius: '8px',
                          color: '#c33'
                        }}>
                          {paymentError}
                        </div>
                      )}

                      {preparedOrderData && (
                        <>
                          {/* Test Modu: Ödeme formunu atla, direkt gözden geçir sekmesine geç */}
                          <div style={{
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '8px',
                            textAlign: 'center'
                          }}>
                            <p style={{ margin: 0, color: '#0369a1', fontSize: '0.9rem' }}>
                              🧪 Test Modu: Ödeme formunu atlayıp direkt gözden geçir sekmesine geçebilirsiniz
                            </p>
                          </div>
                          
                          <button
                            onClick={async () => {
                              // Önce siparişi veritabanına kaydet (fotoğraflar olmadan)
                              const saved = await saveOrderForReview()
                              if (saved) {
                                // Başarılı olduysa gözden geçir sekmesine geç
                                setShowReview(true)
                                setShowContactInfo(false)
                                setShowPaymentForm(false)
                              }
                            }}
                            disabled={isProcessingPhotos}
                            style={{
                              width: '100%',
                              padding: '1rem',
                              background: isProcessingPhotos ? '#e2e8f0' : '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              cursor: isProcessingPhotos ? 'not-allowed' : 'pointer',
                              marginBottom: '1.5rem',
                              transition: 'all 0.2s'
                            }}
                          >
                            {isProcessingPhotos ? 'Kaydediliyor...' : 'Ödeme Olmadan Gözden Geçir (Test)'}
                          </button>
                          
                          <div style={{
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                            color: '#64748b',
                            fontSize: '0.85rem'
                          }}>
                            veya
                          </div>
                          
                          <PaymentForm 
                            onSubmit={handlePaymentSubmit}
                            loading={isSubmitting || isProcessingPhotos}
                            error={paymentError}
                            actionLabel="Ödeme Yap ve Gözden Geçir"
                          />

                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
              {isAuthenticated && showContactInfo && !showPaymentForm && (
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  minHeight: rightPanelMinHeight,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  {renderStepNav()}
                  <div style={{
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Icon name="check" size={14} />
                    <span>Giriş yaptınız: <strong>{user?.email || user?.firstName || 'Kullanıcı'}</strong></span>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', color: '#374151' }}>
                      Ad Soyad
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <input
                        type="text"
                        placeholder="Ad *"
                        value={customerInfo.firstName}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Soyad *"
                        value={customerInfo.lastName}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', color: '#374151' }}>
                    Adres
                  </div>
                  <textarea
                    placeholder="Adres *"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    required
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      marginBottom: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', color: '#374151' }}>
                    Telefon
                  </div>
                  <input
                    type="tel"
                    placeholder="Telefon (Opsiyonel)"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      marginBottom: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                  <button
                    onClick={handleCheckout}
                    disabled={isSubmitting || !isAuthenticated || showPaymentForm}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      fontSize: '1.05rem',
                      fontWeight: 'bold',
                      background: (isSubmitting || !isAuthenticated || showPaymentForm) ? '#e2e8f0' : 'var(--primary-color)',
                      color: (isSubmitting || !isAuthenticated || showPaymentForm) ? '#64748b' : '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: (isSubmitting || !isAuthenticated || showPaymentForm) ? 'not-allowed' : 'pointer',
                      transition: 'color 0.2s, background-color 0.2s',
                      opacity: (isSubmitting || !isAuthenticated || showPaymentForm) ? 0.6 : 1
                    }}
                    title={!isAuthenticated ? 'Sipariş verebilmek için lütfen giriş yapın' : ''}
                  >
                    {isSubmitting ? 'Sipariş Oluşturuluyor...' : 
                     showPaymentForm ? 'Ödeme Formu Açık' : 
                     'Ödemeye Geç'}
                  </button>
                </div>
              )}
              {showReview && (
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  minHeight: rightPanelMinHeight,
                  position: isMobile ? 'relative' : 'sticky',
                  top: isMobile ? '0' : '2rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  {renderStepNav()}
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Siparişi Gözden Geçir</h2>

                  {/* Birleşik Sipariş Bilgileri */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    {/* Sipariş Özeti */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1f2937' }}>
                        Sipariş Özeti
                      </h3>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        {groupedItemsArray.map((group) => {
                          const sizeLabel = group.size === 'custom' && group.customSize
                            ? `${group.customSize.width}x${group.customSize.height} cm`
                            : (group.size || '20x30')
                          const photoCount = group.items.length
                          return (
                            <div
                              key={group.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.95rem',
                                color: '#334155',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                padding: '0.5rem 0.75rem'
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>{sizeLabel}</span>
                              <span style={{ color: '#64748b' }}>{photoCount} adet</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* İletişim Bilgileri */}
                    {(customerInfo.firstName || customerInfo.email || customerInfo.address) && (
                      <div style={{ 
                        marginBottom: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #e2e8f0'
                      }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1f2937' }}>
                          İletişim Bilgileri
                        </h3>
                        <div style={{ fontSize: '0.95rem' }}>
                          {(customerInfo.firstName || customerInfo.lastName) && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 600, color: '#64748b' }}>Ad Soyad: </span>
                              <span style={{ color: '#1f2937' }}>
                                {customerInfo.firstName || ''} {customerInfo.lastName || ''}
                              </span>
                            </div>
                          )}
                          {customerInfo.email && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 600, color: '#64748b' }}>E-posta: </span>
                              <span style={{ color: '#1f2937' }}>{customerInfo.email}</span>
                            </div>
                          )}
                          {customerInfo.phone && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 600, color: '#64748b' }}>Telefon: </span>
                              <span style={{ color: '#1f2937' }}>{customerInfo.phone}</span>
                            </div>
                          )}
                          {customerInfo.address && (
                            <div>
                              <span style={{ fontWeight: 600, color: '#64748b' }}>Adres: </span>
                              <span style={{ color: '#1f2937' }}>{customerInfo.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ödeme Bilgileri */}
                    {cardLastFour && (
                      <div style={{ 
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #e2e8f0'
                      }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1f2937' }}>
                          Ödeme Bilgileri
                        </h3>
                        <div style={{ fontSize: '0.95rem' }}>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 600, color: '#64748b' }}>Kart Numarası: </span>
                            <span style={{ color: '#1f2937' }}>
                              •••• {cardLastFour}
                            </span>
                          </div>
                          {cardExpiry && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 600, color: '#64748b' }}>Son Kullanma Tarihi: </span>
                              <span style={{ color: '#1f2937' }}>
                                {cardExpiry}
                              </span>
                            </div>
                          )}
                          {cvcLastDigit && (
                            <div>
                              <span style={{ fontWeight: 600, color: '#64748b' }}>CVV: </span>
                              <span style={{ color: '#1f2937' }}>
                                ••{cvcLastDigit}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fiyat Özeti */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Ara Toplam</span>
                      <span>₺{totalPrice.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Kargo</span>
                      <span>
                        {totalPrice >= 300 ? (
                          <span style={{ color: '#10b981', fontWeight: 'bold' }}>ÜCRETSİZ</span>
                        ) : (
                          `₺${shippingPrice}`
                        )}
                      </span>
                    </div>
                    {totalPrice < 300 && (
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#666',
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: '#f0f9ff',
                        borderRadius: '6px'
                      }}>
                        ₺{(300 - totalPrice).toFixed(2)} daha ekleyin, kargo ücretsiz olsun!
                      </div>
                    )}
                  </div>

                  <div style={{
                    borderTop: '2px solid #e5e7eb',
                    paddingTop: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      <span>Toplam</span>
                      <span style={{ color: '#667eea' }}>₺{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Siparişi Oluştur Butonu - Sadece ödeme yapılmadıysa göster */}
                  {!paymentCompleted && (
                    <>
                      <button
                        onClick={createOrderWithoutPayment}
                        disabled={isProcessingPhotos || isSubmitting || !customerInfo.email || !customerInfo.address}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          background: (isProcessingPhotos || isSubmitting || !customerInfo.email || !customerInfo.address) ? '#e2e8f0' : '#667eea',
                          color: (isProcessingPhotos || isSubmitting || !customerInfo.email || !customerInfo.address) ? '#64748b' : '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: (isProcessingPhotos || isSubmitting || !customerInfo.email || !customerInfo.address) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          marginTop: '1rem'
                        }}
                      >
                        {isProcessingPhotos ? 'Hazırlanıyor...' : isSubmitting ? 'İşleniyor...' : 'Siparişi Oluştur'}
                      </button>
                      {(!customerInfo.email || !customerInfo.address) && (
                        <p style={{
                          marginTop: '0.75rem',
                          fontSize: '0.85rem',
                          color: '#ef4444',
                          textAlign: 'center'
                        }}>
                          Sipariş oluşturmak için lütfen iletişim bilgilerini doldurun
                        </p>
                      )}
                    </>
                  )}
                  
                  {/* Ödeme yapıldıysa bilgilendirme mesajı */}
                  {paymentCompleted && (
                    <div style={{
                      background: '#d1fae5',
                      border: '2px solid #10b981',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      marginTop: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        ✅
                      </div>
                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#065f46',
                        marginBottom: '0.5rem',
                        marginTop: 0
                      }}>
                        Ödeme Alındı
                      </h3>
                      <p style={{
                        fontSize: '1rem',
                        color: '#047857',
                        margin: 0
                      }}>
                        Siparişiniz başarıyla oluşturulmuş ve ödeme alınmıştır.
                      </p>
                      {orderCode && (
                        <div style={{
                          marginTop: '1rem',
                          padding: '0.75rem',
                          background: 'white',
                          borderRadius: '8px',
                          border: '1px solid #10b981'
                        }}>
                          <p style={{
                            fontSize: '0.9rem',
                            color: '#64748b',
                            margin: '0 0 0.5rem 0'
                          }}>
                            Sipariş Kodu:
                          </p>
                          <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#065f46',
                            letterSpacing: '0.1em',
                            fontFamily: 'monospace'
                          }}>
                            {orderCode}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
              {!showContactInfo && !showPaymentForm && !showReview && (
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  minHeight: rightPanelMinHeight,
                  position: isMobile ? 'relative' : 'sticky',
                  top: isMobile ? '0' : '2rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  {renderStepNav()}
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Sipariş Özeti</h2>
                  <div style={{
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    {groupedItemsArray.map((group) => {
                      const sizeLabel = group.size === 'custom' && group.customSize
                        ? `${group.customSize.width}x${group.customSize.height} cm`
                        : (group.size || '20x30')
                      const photoCount = group.items.length
                      return (
                        <div
                          key={group.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.95rem',
                            color: '#334155',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '0.5rem 0.75rem'
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{sizeLabel}</span>
                          <span style={{ color: '#64748b' }}>{photoCount} adet</span>
                        </div>
                      )
                    })}
                  </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Ara Toplam</span>
                    <span>₺{totalPrice.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Kargo</span>
                    <span>
                      {totalPrice >= 300 ? (
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>ÜCRETSİZ</span>
                      ) : (
                        `₺${shippingPrice}`
                      )}
                    </span>
                  </div>
                  {totalPrice < 300 && (
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#666',
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      background: '#f0f9ff',
                      borderRadius: '6px'
                    }}>
                      ₺{(300 - totalPrice).toFixed(2)} daha ekleyin, kargo ücretsiz olsun!
                    </div>
                  )}
                </div>

                <div style={{
                  borderTop: '2px solid #e5e7eb',
                  paddingTop: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <span>Toplam</span>
                    <span style={{ color: '#667eea' }}>₺{finalTotal.toFixed(2)}</span>
                  </div>
                </div>


                {/* Kullanıcı giriş yapmamışsa kayıt ol/giriş yap bölümü */}
                {!isAuthenticated ? (
                  <div style={{
                    marginBottom: '1.5rem',
                    padding: '1.5rem',
                    background: 'var(--bg-color)',
                    borderRadius: '12px',
                    color: 'var(--text-color)',
                    textAlign: 'center',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow)'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                      <Icon name="lock" size={28} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                      Siparişi Tamamlamak İçin
                    </h3>
                    <p style={{ 
                      fontSize: '0.95rem', 
                      marginBottom: '1.5rem', 
                      color: 'var(--text-light)',
                      lineHeight: '1.6'
                    }}>
                      Hızlı ve güvenli sipariş vermek için lütfen giriş yapın veya kayıt olun
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
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
                  <div style={{ marginBottom: '1.5rem' }}>
                    <button
                      onClick={goToContact}
                      disabled={cartItems.length < 15}
                      style={{
                        width: '100%',
                        padding: '0.9rem 1rem',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        background: cartItems.length < 15 ? '#e2e8f0' : 'var(--primary-color)',
                        color: cartItems.length < 15 ? '#64748b' : '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: cartItems.length < 15 ? 'not-allowed' : 'pointer',
                        transition: 'color 0.2s, background-color 0.2s',
                        opacity: cartItems.length < 15 ? 0.6 : 1
                      }}
                      title={cartItems.length < 15 ? `Minimum 15 fotoğraf seçmelisiniz. Şu anda sepette ${cartItems.length} fotoğraf var.` : ''}
                    >
                      İletişim Bilgileri
                    </button>
                    {cartItems.length < 15 && (
                      <p style={{
                        marginTop: '0.75rem',
                        fontSize: '0.85rem',
                        color: '#ef4444',
                        textAlign: 'center'
                      }}>
                        Minimum 15 fotoğraf seçmelisiniz ({cartItems.length}/15)
                      </p>
                    )}
                  </div>
                )}

                {/* Güvenlik ve Bilgilendirme Bölümü */}
                <div style={{
                  marginTop: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {/* Güvenli Ödeme */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ color: '#10b981', flexShrink: 0 }}>
                      <Icon name="lock" size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.2rem' }}>
                        Güvenli Ödeme
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        256-bit SSL ile korunmaktadır
                      </div>
                    </div>
                  </div>

                  {/* Kargo Bilgisi */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ color: '#3b82f6', flexShrink: 0 }}>
                      <Icon name="truck" size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.2rem' }}>
                        {totalPrice >= 300 ? 'Ücretsiz Kargo' : 'Hızlı Kargo'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {totalPrice >= 300 
                          ? 'Siparişiniz ücretsiz kargo ile gönderilir'
                          : `₺${(300 - totalPrice).toFixed(2)} daha ekleyin, kargo ücretsiz olsun`
                        }
                      </div>
                    </div>
                  </div>

                  {/* İade Garantisi */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ color: '#8b5cf6', flexShrink: 0 }}>
                      <Icon name="refresh-cw" size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.2rem' }}>
                        Memnuniyet Garantisi
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Kalite beklentinizi karşılamazsa iade edebilirsiniz
                      </div>
                    </div>
                  </div>
                </div>

                {submitSuccess ? (
                  <div style={{
                    background: '#f8fafc',
                    padding: '2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow)',
                    marginTop: '1rem'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                      <Icon name="check" size={28} />
                    </div>
                    <h3 style={{ marginBottom: '0.5rem' }}>Sipariş Başarıyla Oluşturuldu!</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
                      Sipariş No: <strong>#{orderId}</strong>
                    </p>
                    <Link
                      to="/"
                      className="btn btn-primary btn-small"
                    >
                      Ana Sayfaya Dön
                    </Link>
                  </div>
                ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Ödeme Formu Bölümü */}
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
            borderRadius: '12px',
            padding: '1.5rem',
            maxWidth: '800px',
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
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  marginBottom: '0.5rem'
                }}>
                  <h2 style={{ 
                    fontSize: '1.25rem', 
                    margin: 0,
                    color: '#1f2937',
                    fontWeight: 600
                  }}>
                    {selectedItemGroup.size === 'custom' && selectedItemGroup.customSize
                      ? `${selectedItemGroup.customSize.width}x${selectedItemGroup.customSize.height} cm`
                      : selectedItemGroup.size || '20x30'}
                  </h2>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}>
                    {selectedItemGroup.items.length} fotoğraf
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItemGroup(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9'
                  e.currentTarget.style.color = '#1f2937'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#64748b'
                }}
                title="Kapat"
              >
                ✕
              </button>
            </div>

            {/* Fotoğraflar Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              {selectedItemGroup.items.map((item, itemIndex) => (
                <div
                  key={item.id}
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    background: '#f9fafb',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                    const overlay = e.currentTarget.querySelector('.photo-overlay')
                    if (overlay) overlay.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = 'none'
                    const overlay = e.currentTarget.querySelector('.photo-overlay')
                    if (overlay) overlay.style.opacity = '0'
                  }}
                >
                  <img
                    src={item.photo?.preview || item.photo?.url || '/placeholder.jpg'}
                    alt={`Fotoğraf ${itemIndex + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg'
                    }}
                  />
                  {/* Hover overlay - Butonlar */}
                  <div 
                  className="photo-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    pointerEvents: 'auto',
                    backdropFilter: 'blur(2px)'
                  }}
                  >
                    {/* Düzenle butonu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingPhoto(item.photo)
                        setEditingPhotoItemId(item.id)
                      }}
                      style={{
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#7c3aed'
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#8b5cf6'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      <Icon name="edit" size={16} />
                      Düzenle
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
                              showAlert('Lütfen bir resim dosyası seçin', 'warning')
                              document.body.removeChild(input)
                              return
                            }
                            // Dosya boyutu kontrolü kaldırıldı - kullanıcı istediği boyutta fotoğraf ekleyebilir
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              updateCartItemPhoto(item.id, {
                                ...file,
                                preview: reader.result, // Memory'de tut (görüntüleme için)
                                file: file // File objesini de tut (base64'e çevirmek için)
                              })
                              
                              // selectedItemGroup'u hemen güncelle (anında görünmesi için)
                              if (selectedItemGroup) {
                                const updatedItems = selectedItemGroup.items.map(groupItem => 
                                  groupItem.id === item.id 
                                    ? {
                                        ...groupItem,
                                        photo: {
                                          ...groupItem.photo,
                                          preview: reader.result,
                                          filename: file.name,
                                          mimetype: file.type,
                                          size: file.size,
                                          file: file
                                        }
                                      }
                                    : groupItem
                                )
                                setSelectedItemGroup({
                                  ...selectedItemGroup,
                                  items: updatedItems
                                })
                              }
                            }
                            reader.readAsDataURL(file)
                          }
                          document.body.removeChild(input)
                        }
                        document.body.appendChild(input)
                        input.click()
                      }}
                      style={{
                        background: 'white',
                        color: '#2563eb',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.625rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        minWidth: '100px',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#eff6ff'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                      title="Fotoğrafı değiştir"
                    >
                      <Icon name="camera" size={16} />
                      <span>Değiştir</span>
                    </button>
                    {/* Sil butonu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (selectedItemGroup.items.length <= 1) {
                          showAlert('En az 1 fotoğraf olmalıdır. Tüm ürünü silmek için ürün kartındaki "Kaldır" butonunu kullanın.', 'warning')
                          return
                        }
                        showConfirm('Bu fotoğrafı kaldırmak istediğinizden emin misiniz?', () => {
                          removeFromCart(item.id)
                          // useEffect ile selectedItemGroup otomatik güncellenecek
                        })
                      }}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.625rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        minWidth: '100px',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dc2626'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ef4444'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                      title="Fotoğrafı kaldır"
                    >
                      <Icon name="trash" size={16} />
                      <span>Sil</span>
                    </button>
                  </div>
                </div>
              ))}
              {/* Yeni fotoğraf ekle */}
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.multiple = true // Çoklu dosya seçimine izin ver
                  input.style.display = 'none'
                  input.onchange = (e) => {
                    const files = Array.from(e.target.files || [])
                    if (files.length === 0) {
                      document.body.removeChild(input)
                      return
                    }
                    
                    // Tüm dosyaları işle
                    const validFiles = files.filter(file => {
                      if (!file.type.startsWith('image/')) {
                        showAlert(`${file.name} bir resim dosyası değil.`, 'warning')
                        return false
                      }
                      return true
                    })
                    
                    if (validFiles.length === 0) {
                      document.body.removeChild(input)
                      return
                    }
                    
                    // Tüm dosyaları paralel olarak oku (çok daha hızlı)
                    const readFile = (file) => {
                      return new Promise((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onloadend = () => resolve({
                          preview: reader.result,
                          filename: file.name,
                          mimetype: file.type,
                          size: file.size,
                          file: file
                        })
                        reader.onerror = () => reject(new Error(`${file.name} okunamadı`))
                        reader.readAsDataURL(file)
                      })
                    }
                    
                    // Tüm dosyaları paralel olarak oku
                    Promise.all(validFiles.map(file => readFile(file).catch(err => {
                      console.error('Dosya okuma hatası:', err)
                      showAlert(err.message || 'Dosya okunamadı', 'error')
                      return null // Hatalı dosyaları null olarak işaretle
                    }))).then(fileDataArray => {
                      // Null olmayan dosyaları sepete ekle
                      const validFileData = fileDataArray.filter(data => data !== null)
                      
                      if (validFileData.length === 0) {
                        showAlert('Hiçbir fotoğraf eklenemedi.', 'error')
                        try {
                          document.body.removeChild(input)
                        } catch (e) {}
                        return
                      }
                      
                      // Tüm fotoğrafları toplu olarak sepete ekle (tek state güncellemesi - çok daha hızlı)
                      const newCartItems = validFileData.map((fileData) => ({
                        product: {
                          size: selectedItemGroup.size,
                          name: selectedItemGroup.productName,
                          description: '',
                          customSize: selectedItemGroup.customSize
                        },
                        photo: {
                          preview: fileData.preview, // Memory'de tut (görüntüleme için)
                          filename: fileData.filename,
                          mimetype: fileData.mimetype,
                          size: fileData.size,
                          file: fileData.file // File objesini de tut (base64'e çevirmek için)
                        },
                        quantity: selectedItemGroup.quantity,
                        price: selectedItemGroup.items[0]?.price || 0,
                        shippingType: 'standard'
                      }))
                      
                      // Toplu ekleme (tek state güncellemesi)
                      addMultipleToCart(newCartItems)
                      
                      // selectedItemGroup'u hemen güncelle (anında görünmesi için)
                      // Yeni eklenen item'ları mevcut gruba ekle (preview'ları dahil)
                      if (selectedItemGroup) {
                        // Yeni item'lar için ID'leri oluştur (addMultipleToCart ile aynı mantık)
                        const baseTimestamp = Date.now()
                        const newItemsWithIds = newCartItems.map((item, index) => ({
                          ...item,
                          id: `${baseTimestamp + index}-${Math.random().toString(36).substr(2, 9)}`,
                          createdAt: new Date().toISOString()
                        }))
                        
                        // SessionStorage'a preview'ları kaydet
                        try {
                          const existingPreviews = sessionStorage.getItem('cartPreviews')
                          const previewsMap = existingPreviews ? JSON.parse(existingPreviews) : {}
                          newItemsWithIds.forEach(item => {
                            if (item.photo?.preview) {
                              previewsMap[item.id] = item.photo.preview
                            }
                          })
                          sessionStorage.setItem('cartPreviews', JSON.stringify(previewsMap))
                        } catch (e) {
                          // SessionStorage hatası olursa sessizce devam et
                        }
                        
                        const updatedGroup = {
                          ...selectedItemGroup,
                          items: [...selectedItemGroup.items, ...newItemsWithIds],
                          totalPrice: (selectedItemGroup.items.length + newItemsWithIds.length) * (selectedItemGroup.items[0]?.price || 0)
                        }
                        setSelectedItemGroup(updatedGroup)
                      }
                      
                      showAlert(`${validFileData.length} fotoğraf sepete eklendi.`, 'success')
                      
                      try {
                        document.body.removeChild(input)
                      } catch (e) {
                        // Input zaten kaldırılmış olabilir
                      }
                    })
                  }
                  document.body.appendChild(input)
                  input.click()
                }}
                style={{
                  aspectRatio: '1',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: '#f9fafb',
                  transition: 'all 0.2s ease',
                  color: '#64748b'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#94a3b8'
                  e.currentTarget.style.background = '#f1f5f9'
                  e.currentTarget.style.color = '#475569'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1'
                  e.currentTarget.style.background = '#f9fafb'
                  e.currentTarget.style.color = '#64748b'
                }}
                title="Yeni fotoğraf ekle"
              >
                <Icon name="plus" size={24} />
                <div style={{ 
                  fontSize: '0.8125rem', 
                  fontWeight: 500,
                  marginTop: '0.5rem'
                }}>
                  Ekle
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingTop: '1rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => setSelectedItemGroup(null)}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e2e8f0'
                  e.currentTarget.style.borderColor = '#cbd5e1'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f1f5f9'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Popup */}
      <AlertPopup
        message={alertMessage}
        type={alertType}
        show={!!alertMessage}
        onClose={() => setAlertMessage(null)}
      />

      {/* Confirm Popup */}
      <ConfirmPopup
        message={confirmMessage}
        show={!!confirmMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* Sipariş Başarı Popup */}
      {showOrderSuccessPopup && orderCode && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setShowOrderSuccessPopup(false)}
        >
          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes slideUp {
              from {
                transform: translateY(20px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2.5rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.3s ease-out',
              position: 'relative',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Başarı İkonu */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#d1fae5',
              border: '3px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2.5rem'
            }}>
              ✅
            </div>

            {/* Başlık */}
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#065f46',
              marginBottom: '1rem',
              marginTop: 0
            }}>
              Siparişiniz başarıyla oluşturulmuştur!
            </h3>

            {/* Sipariş Kodu Etiketi */}
            <p style={{
              fontSize: '1rem',
              color: '#047857',
              marginBottom: '0.75rem',
              marginTop: 0
            }}>
              Sipariş Kodu:
            </p>

            {/* Sipariş Kodu */}
            <div style={{
              background: '#f0fdf4',
              border: '2px solid #10b981',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              display: 'inline-block',
              marginBottom: '2rem'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#065f46',
                letterSpacing: '0.15em',
                fontFamily: 'monospace'
              }}>
                {orderCode}
              </div>
            </div>

            {/* Kapat Butonu */}
            <button
              onClick={() => setShowOrderSuccessPopup(false)}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px #10b98140'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 16px #10b98160'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px #10b98140'
              }}
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* Photo Editor Modal */}
      {editingPhoto && (
        <PhotoEditor
          photo={editingPhoto}
          onSave={(editedPhoto) => {
            if (editingPhotoItemId) {
              // Düzenlenen fotoğrafı cart item'a kaydet
              updateCartItemPhoto(editingPhotoItemId, editedPhoto)
              
              // selectedItemGroup'u güncelle
              if (selectedItemGroup) {
                const updatedItems = selectedItemGroup.items.map(groupItem => 
                  groupItem.id === editingPhotoItemId 
                    ? {
                        ...groupItem,
                        photo: editedPhoto
                      }
                    : groupItem
                )
                setSelectedItemGroup({
                  ...selectedItemGroup,
                  items: updatedItems
                })
              }
              
              showAlert('Fotoğraf başarıyla düzenlendi', 'success')
            }
            setEditingPhoto(null)
            setEditingPhotoItemId(null)
          }}
          onCancel={() => {
            setEditingPhoto(null)
            setEditingPhotoItemId(null)
          }}
        />
      )}
    </>
  )
}

export default Cart

