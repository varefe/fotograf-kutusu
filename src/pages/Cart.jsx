import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { calculatePrice } from '../utils/priceCalculator'

function Cart() {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart()
  const { user, isAuthenticated, getAuthHeaders } = useAuth()
  const [shippingType, setShippingType] = useState('standard')
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    address: '',
    phone: '',
    firstName: '',
    lastName: ''
  })

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
    if (cartItems.length === 0) {
      alert('Sepetiniz boş')
      return
    }

    if (!customerInfo.email || !customerInfo.address) {
      alert('Lütfen e-posta ve adres bilgilerini doldurun')
      return
    }

    // Ödeme sayfasına yönlendir (tüm sepet öğeleri için)
    try {
      const firstItem = cartItems[0]
      const calculatedPrice = calculatePrice(
        firstItem.product.size,
        firstItem.quantity,
        shippingType,
        firstItem.product.customSize
      )

      const orderData = {
        photo: firstItem.photo,
        size: firstItem.product.size,
        customSize: firstItem.product.customSize,
        quantity: firstItem.quantity,
        shippingType,
        email: customerInfo.email,
        address: customerInfo.address,
        phone: customerInfo.phone || '',
        firstName: customerInfo.firstName || 'Müşteri',
        lastName: customerInfo.lastName || 'Müşteri',
        notes: '',
        frameType: 'none',
        paperType: 'glossy',
        colorMode: 'color',
        price: calculatedPrice
      }

      navigate('/payment', {
        state: {
          orderData,
          remainingItems: cartItems.slice(1),
          cartItems: cartItems // Tüm sepet öğeleri
        }
      })
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error)
      alert('Sipariş oluşturulurken bir hata oluştu')
    }
  }

  // Sepet toplamını hesapla (her öğenin fiyatını topla)
  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + (item.price || 0)
  }, 0)
  
  const shippingPrice = shippingType === 'standard' ? 15 : 35
  const finalTotal = totalPrice >= 99 ? totalPrice : totalPrice + shippingPrice

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '4rem 0', minHeight: '60vh', textAlign: 'center' }}>
          <div className="container">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
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
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem'
          }}>
            {/* Sepet Öğeleri */}
            <div>
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '1rem',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    gap: '1.5rem'
                  }}
                >
                  <img
                    src={item.photo.preview}
                    alt={item.product.name}
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                      {item.product.name}
                    </h3>
                    <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                      {item.product.description}
                    </p>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Adet:</strong> {item.quantity}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea' }}>
                      ₺{item.price.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      height: 'fit-content'
                    }}
                  >
                    Kaldır
                  </button>
                </div>
              ))}

              <button
                onClick={clearCart}
                style={{
                  background: '#f3f4f6',
                  color: '#666',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
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
                position: 'sticky',
                top: '2rem'
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
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>ÜCRETSİZ 🎉</span>
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
                  borderTop: '2px solid #e5e7eb',
                  paddingTop: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <span>Toplam</span>
                    <span style={{ color: '#667eea' }}>₺{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Kargo Tipi
                  </label>
                  <select
                    value={shippingType}
                    onChange={(e) => setShippingType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="standard">Standart Kargo (3-5 gün, ₺15)</option>
                    <option value="express">Express Kargo (1-2 gün, ₺35)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>İletişim Bilgileri</h3>
                  <input
                    type="email"
                    placeholder="E-posta *"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      marginBottom: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
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
                      padding: '0.75rem',
                      marginBottom: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
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
                      padding: '0.75rem',
                      marginBottom: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <button
                  onClick={handleCheckout}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#5568d3'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#667eea'
                  }}
                >
                  Ödemeye Geç
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Cart

