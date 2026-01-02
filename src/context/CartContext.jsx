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
      id: Date.now().toString(),
      ...cartItemWithoutBase64,
      createdAt: new Date().toISOString()
    }
    const updatedCart = [...cartItems, newItem]
    setCartItems(updatedCart)
    
    // localStorage quota kontrolü
    try {
      localStorage.setItem('cart', JSON.stringify(updatedCart))
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('⚠️ Sepet localStorage quota aşıldı, eski öğeler temizleniyor...')
        // Son 20 öğeyi tut
        const cleanedCart = updatedCart.slice(-20)
        localStorage.setItem('cart', JSON.stringify(cleanedCart))
        setCartItems(cleanedCart)
      } else {
        throw error
      }
    }
  }

  // Sepetten çıkar
  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
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

  // Sepet ürün sayısı
  const getCartCount = () => {
    return cartItems.length
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

