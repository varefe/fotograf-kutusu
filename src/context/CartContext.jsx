import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])

  // LocalStorage'dan sepeti yükle
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        // SessionStorage'dan preview'ları yükle
        let previewsMap = {}
        try {
          const savedPreviews = sessionStorage.getItem('cartPreviews')
          if (savedPreviews) {
            previewsMap = JSON.parse(savedPreviews)
          }
        } catch (e) {
          // SessionStorage okuma hatası olursa sessizce devam et
        }
        
        // Preview'ları cartItems'a ekle
        const cleanedCart = parsedCart.map(item => ({
          ...item,
          photo: item.photo ? {
            ...item.photo,
            preview: previewsMap[item.id] || undefined, // SessionStorage'dan preview'ı yükle
            base64: undefined // Base64'i kaldır
          } : undefined
        }))
        setCartItems(cleanedCart)
        // Temizlenmiş sepeti localStorage'a kaydet
        try {
          localStorage.setItem('cart', JSON.stringify(cleanedCart.map(item => ({
            ...item,
            photo: item.photo ? {
              filename: item.photo.filename,
              mimetype: item.photo.mimetype,
              size: item.photo.size
            } : undefined
          }))))
        } catch (e) {
          // Quota hatası olursa sessizce devam et
        }
      } catch (error) {
        console.error('Sepet yükleme hatası:', error)
      }
    }
  }, [])

  // Sepete toplu ekle (performans için)
  const addMultipleToCart = (items) => {
    if (!items || items.length === 0) {
      return
    }
    
    const baseTimestamp = Date.now()
    const newItems = items.map((item, index) => ({
      id: `${baseTimestamp + index}-${Math.random().toString(36).substr(2, 9)}`,
      ...item,
      createdAt: new Date().toISOString()
    }))
    
    setCartItems(prevCartItems => {
      const updatedCart = [...prevCartItems, ...newItems]
      
      // Preview'ları sessionStorage'a kaydet (base64'e çevirmek için)
      try {
        const previewsMap = {}
        updatedCart.forEach((item) => {
          if (item.photo?.preview) {
            previewsMap[item.id] = item.photo.preview
          }
        })
        sessionStorage.setItem('cartPreviews', JSON.stringify(previewsMap))
      } catch (e) {
        // SessionStorage quota hatası olursa sessizce devam et
      }
      
      const cartForStorage = updatedCart.map(item => ({
        ...item,
        photo: item.photo ? {
          filename: item.photo.filename,
          mimetype: item.photo.mimetype,
          size: item.photo.size
        } : undefined
      }))
      
      try {
        localStorage.setItem('cart', JSON.stringify(cartForStorage))
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          const cleanedCart = updatedCart.slice(-20).map(item => ({
            ...item,
            photo: item.photo ? {
              filename: item.photo.filename,
              mimetype: item.photo.mimetype,
              size: item.photo.size
            } : undefined
          }))
          try {
            localStorage.setItem('cart', JSON.stringify(cleanedCart))
            return updatedCart.slice(-20)
          } catch (retryError) {
            localStorage.removeItem('cart')
            return updatedCart.slice(-20)
          }
        }
      }
      
      return updatedCart
    })
  }

  // Sepete ekle
  const addToCart = (item) => {
    // State'te preview ve file objelerini tut (görüntüleme ve base64'e çevirme için)
    // localStorage'a kaydederken bunları kaldıracağız
    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID için timestamp + random string
      ...item,
      createdAt: new Date().toISOString()
    }
    // FIX: Functional update kullanarak state güncelleme sorununu çöz
    // State güncellemesi asenkron olduğu için, functional update kullanarak her çağrıda güncel state'i al
    setCartItems(prevCartItems => {
      // State'te preview'ları tut (görüntüleme için)
      const updatedCart = [...prevCartItems, newItem]
      // Preview'ları sessionStorage'a kaydet (base64'e çevirmek için)
      try {
        const previewsMap = {}
        updatedCart.forEach((item, index) => {
          if (item.photo?.preview) {
            previewsMap[item.id] = item.photo.preview
          }
        })
        sessionStorage.setItem('cartPreviews', JSON.stringify(previewsMap))
      } catch (e) {
        // SessionStorage quota hatası olursa sessizce devam et
      }
      
      // localStorage'a kaydetmeden önce preview'ları kaldır (quota için)
      const cartForStorage = updatedCart.map(item => ({
        ...item,
        photo: item.photo ? {
          filename: item.photo.filename,
          mimetype: item.photo.mimetype,
          size: item.photo.size
          // preview ve base64 kaldırıldı
        } : undefined
      }))
      // localStorage quota kontrolü
      try {
        localStorage.setItem('cart', JSON.stringify(cartForStorage))
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.warn('⚠️ Sepet localStorage quota aşıldı, eski öğeler temizleniyor...')
          // Son 20 öğeyi tut ve sadece metadata kaydet
          const cleanedCart = updatedCart.slice(-20).map(item => ({
            ...item,
            photo: item.photo ? {
              filename: item.photo.filename,
              mimetype: item.photo.mimetype,
              size: item.photo.size
              // Preview ve base64 tamamen kaldırıldı
            } : undefined
          }))
          try {
            localStorage.setItem('cart', JSON.stringify(cleanedCart))
            return updatedCart.slice(-20)
          } catch (retryError) {
            localStorage.removeItem('cart')
            // State'te preview'ları tut (görüntüleme için)
            return updatedCart.slice(-20)
          }
        } else {
          throw error
        }
      }
      return updatedCart
    })
  }

  // Sepetten çıkar
  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId)
    setCartItems(updatedCart)
    
    // SessionStorage'dan da preview'ı kaldır
    try {
      const savedPreviews = sessionStorage.getItem('cartPreviews')
      if (savedPreviews) {
        const previewsMap = JSON.parse(savedPreviews)
        delete previewsMap[itemId]
        sessionStorage.setItem('cartPreviews', JSON.stringify(previewsMap))
      }
    } catch (e) {
      // SessionStorage hatası olursa sessizce devam et
    }
    
    localStorage.setItem('cart', JSON.stringify(updatedCart.map(item => ({
      ...item,
      photo: item.photo ? {
        filename: item.photo.filename,
        mimetype: item.photo.mimetype,
        size: item.photo.size
      } : undefined
    }))))
  }

  // Sepet öğesinin fotoğrafını güncelle
  const updateCartItemPhoto = (itemId, newPhoto) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === itemId) {
        // Yeni fotoğraf için preview oluştur
        let preview = newPhoto.preview
        if (!preview && newPhoto instanceof File) {
          preview = URL.createObjectURL(newPhoto)
        }
        
        return {
          ...item,
          photo: {
            ...item.photo,
            preview: preview || item.photo?.preview,
            filename: newPhoto.name || item.photo?.filename,
            mimetype: newPhoto.type || item.photo?.mimetype,
            size: newPhoto.size || item.photo?.size,
            file: newPhoto instanceof File ? newPhoto : undefined
          }
        }
      }
      return item
    })
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart.map(item => ({
      ...item,
      photo: item.photo ? {
        ...item.photo,
        file: undefined // File objesi serialize edilemez
      } : undefined
    }))))
  }

  // Sepeti temizle
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
  }

  // Sepet toplam fiyatı
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price || 0), 0)
  }

  // Sepet ürün sayısı (grupların sayısı - aynı size, quantity, product.name olanlar bir grup)
  const getCartCount = () => {
    if (cartItems.length === 0) return 0
    
    // Sepet öğelerini grupla (aynı size, quantity, product.name olanları)
    const groups = cartItems.reduce((groups, item) => {
      const key = `${item.product?.size || 'unknown'}-${item.quantity || 0}-${item.product?.name || 'unknown'}`
      if (!groups[key]) {
        groups[key] = true
      }
      return groups
    }, {})
    
    return Object.keys(groups).length
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        addMultipleToCart,
        removeFromCart,
        updateCartItemPhoto,
        clearCart,
        getCartTotal,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

