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
    const newItem = {
      id: Date.now().toString(),
      ...item,
      createdAt: new Date().toISOString()
    }
    const updatedCart = [...cartItems, newItem]
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
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

