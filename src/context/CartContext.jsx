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
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Sepet yükleme hatası:', error)
      }
    }
  }, [])

  // Sepete ekle
  const addToCart = (item) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:29',message:'addToCart called',data:{photoFilename:item.photo?.filename,itemPrice:item.price,itemQuantity:item.quantity,itemSize:item.product?.size,currentCartItemsCount:cartItems.length,currentCartItems:cartItems.map(i=>({id:i.id,price:i.price,quantity:i.quantity,size:i.product?.size}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Base64 ve file objelerini kaldır (localStorage quota için)
    const cartItemWithoutBase64 = {
      ...item,
      photo: item.photo ? {
        ...item.photo,
        base64: undefined, // Base64'i kaldır (ödeme sayfasında tekrar oluşturulacak)
        file: undefined, // File objesi serialize edilemez
        preview: item.photo.preview // Preview'ı tut (küçük thumbnail)
      } : undefined
    }
    
    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID için timestamp + random string
      ...cartItemWithoutBase64,
      createdAt: new Date().toISOString()
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:49',message:'Before setCartItems with functional update',data:{newItemId:newItem.id,newItemPrice:newItem.price,newItemQuantity:newItem.quantity,currentCartItemsCount:cartItems.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // FIX: Functional update kullanarak state güncelleme sorununu çöz
    // State güncellemesi asenkron olduğu için, functional update kullanarak her çağrıda güncel state'i al
    setCartItems(prevCartItems => {
      const updatedCart = [...prevCartItems, newItem]
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:56',message:'Inside functional update',data:{prevCartItemsCount:prevCartItems.length,updatedCartLength:updatedCart.length,newItemId:newItem.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // localStorage quota kontrolü
      try {
        localStorage.setItem('cart', JSON.stringify(updatedCart))
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.warn('⚠️ Sepet localStorage quota aşıldı, eski öğeler temizleniyor...')
          // Son 20 öğeyi tut
          const cleanedCart = updatedCart.slice(-20)
          localStorage.setItem('cart', JSON.stringify(cleanedCart))
          return cleanedCart
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
    localStorage.setItem('cart', JSON.stringify(updatedCart))
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

