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
    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:45',message:'addMultipleToCart called',data:{itemsCount:items?.length||0,currentCartItemsCount:cartItems.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    } catch(e) {}
    // #endregion
    if (!items || items.length === 0) {
      // #region agent log
      try {
        fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:47',message:'addMultipleToCart early return',data:{reason:'empty items'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      } catch(e) {}
      // #endregion
      return
    }
    
    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:48',message:'Before mapping items',data:{itemsCount:items.length,firstItemPreviewSize:items[0]?.photo?.preview?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
    } catch(e) {}
    // #endregion
    
    const baseTimestamp = Date.now()
    const newItems = items.map((item, index) => ({
      id: `${baseTimestamp + index}-${Math.random().toString(36).substr(2, 9)}`,
      ...item,
      createdAt: new Date().toISOString()
    }))
    
    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:54',message:'Before setCartItems',data:{newItemsCount:newItems.length,currentCartItemsCount:cartItems.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    } catch(e) {}
    // #endregion
    
    setCartItems(prevCartItems => {
      // #region agent log
      try {
        fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:56',message:'Inside setCartItems functional update',data:{prevCartItemsCount:prevCartItems.length,newItemsCount:newItems.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
      } catch(e) {}
      // #endregion
      
      const updatedCart = [...prevCartItems, ...newItems]
      
      // #region agent log
      try {
        const previewSizes = updatedCart.map(i => i.photo?.preview?.length || 0)
        const totalPreviewSize = previewSizes.reduce((sum, size) => sum + size, 0)
        fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:60',message:'Before cartForStorage mapping',data:{updatedCartLength:updatedCart.length,totalPreviewSize,previewSizes:previewSizes.slice(0,5)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
      } catch(e) {}
      // #endregion
      
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
      
      // #region agent log
      try {
        const cartSize = JSON.stringify(cartForStorage).length
        fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:65',message:'Before localStorage.setItem',data:{cartSize,itemCount:cartForStorage.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
      } catch(e) {}
      // #endregion
      
      try {
        localStorage.setItem('cart', JSON.stringify(cartForStorage))
        // #region agent log
        try {
          fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:67',message:'localStorage.setItem success',data:{cartSize:JSON.stringify(cartForStorage).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
        } catch(e) {}
        // #endregion
      } catch (error) {
        // #region agent log
        try {
          fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:68',message:'localStorage.setItem error',data:{errorName:error.name,errorMessage:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
        } catch(e) {}
        // #endregion
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
            // #region agent log
            try {
              fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:77',message:'Cleaned cart saved',data:{cleanedCartSize:JSON.stringify(cleanedCart).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
            } catch(e) {}
            // #endregion
            return updatedCart.slice(-20)
          } catch (retryError) {
            // #region agent log
            try {
              fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:81',message:'Cleaned cart save failed',data:{errorName:retryError.name,errorMessage:retryError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
            } catch(e) {}
            // #endregion
            localStorage.removeItem('cart')
            return updatedCart.slice(-20)
          }
        } else {
          // #region agent log
          try {
            fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:85',message:'Non-quota error in localStorage',data:{errorName:error.name,errorMessage:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
          } catch(e) {}
          // #endregion
        }
      }
      
      // #region agent log
      try {
        fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:86',message:'Returning updatedCart',data:{updatedCartLength:updatedCart.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
      } catch(e) {}
      // #endregion
      
      return updatedCart
    })
  }

  // Sepete ekle
  const addToCart = (item) => {
    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:29',message:'addToCart called',data:{photoFilename:item.photo?.filename,itemPrice:item.price,itemQuantity:item.quantity,itemSize:item.product?.size,currentCartItemsCount:cartItems.length,currentCartItems:cartItems.map(i=>({id:i.id,price:i.price,quantity:i.quantity,size:i.product?.size}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    } catch(e) {}
    // #endregion
    // State'te preview ve file objelerini tut (görüntüleme ve base64'e çevirme için)
    // localStorage'a kaydederken bunları kaldıracağız
    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID için timestamp + random string
      ...item,
      createdAt: new Date().toISOString()
    }
    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:49',message:'Before setCartItems with functional update',data:{newItemId:newItem.id,newItemPrice:newItem.price,newItemQuantity:newItem.quantity,currentCartItemsCount:cartItems.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    } catch(e) {}
    // #endregion
    // FIX: Functional update kullanarak state güncelleme sorununu çöz
    // State güncellemesi asenkron olduğu için, functional update kullanarak her çağrıda güncel state'i al
    setCartItems(prevCartItems => {
      // State'te preview'ları tut (görüntüleme için)
      const updatedCart = [...prevCartItems, newItem]
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:56',message:'Inside functional update',data:{prevCartItemsCount:prevCartItems.length,updatedCartLength:updatedCart.length,newItemId:newItem.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
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
        // #region agent log
        const cartSize = JSON.stringify(cartForStorage).length
        fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:60',message:'Before localStorage.setItem',data:{cartSize,itemCount:cartForStorage.length,previewSizes:cartForStorage.map(i=>i.photo?.preview?.length||0)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        localStorage.setItem('cart', JSON.stringify(cartForStorage))
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:62',message:'localStorage.setItem success',data:{cartSize},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:64',message:'localStorage.setItem error',data:{errorName:error.name,errorMessage:error.message,cartSize:JSON.stringify(updatedCart).length,itemCount:updatedCart.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
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
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:68',message:'Cleaned cart saved',data:{cleanedCartSize:JSON.stringify(cleanedCart).length,itemCount:cleanedCart.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
            // State'te preview'ları tut (görüntüleme için)
            return updatedCart.slice(-20)
          } catch (retryError) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:72',message:'Cleaned cart save failed',data:{errorName:retryError.name,errorMessage:retryError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
            // Eğer hala quota aşılıyorsa, localStorage'ı tamamen temizle
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

