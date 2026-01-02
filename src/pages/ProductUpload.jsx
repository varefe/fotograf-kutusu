import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { calculatePrice } from '../utils/priceCalculator'

function ProductUpload() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart } = useCart()
  
  // URL'den ürün bilgilerini al
  const product = location.state?.product || {
    size: '20x30',
    name: '20x30 cm',
    description: 'Popüler boyut'
  }

  const [photos, setPhotos] = useState([])
  const [quantity, setQuantity] = useState(15) // Minimum 15 adet
  const [previews, setPreviews] = useState([])

  useEffect(() => {
    // Eğer ürün bilgisi yoksa ana sayfaya yönlendir
    if (!location.state?.product) {
      navigate('/')
    }
  }, [location, navigate])

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files)
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPhotos(prev => [...prev, file])
          setPreviews(prev => [...prev, reader.result])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddToCart = () => {
    if (photos.length === 0) {
      alert('Lütfen en az 2 fotoğraf seçin')
      return
    }

    if (photos.length < 2) {
      alert('Sepete eklemek için en az 2 fotoğraf seçmelisiniz')
      return
    }

    if (quantity < 15) {
      alert('Minimum 15 adet seçmelisiniz')
      return
    }

    // Her fotoğraf için sepet öğesi oluştur
    photos.forEach((photo, index) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]
        
        // Fiyat hesapla
        const price = calculatePrice(
          product.size,
          quantity,
          'standard', // Varsayılan kargo
          product.customSize
        )

        const cartItem = {
          product: {
            size: product.size,
            name: product.name,
            description: product.description,
            customSize: product.customSize
          },
          photo: {
            file: photo,
            preview: previews[index],
            base64: base64String,
            filename: photo.name,
            mimetype: photo.type,
            size: photo.size
          },
          quantity,
          price: price / photos.length, // Her fotoğraf için eşit fiyat
          shippingType: 'standard'
        }

        addToCart(cartItem)
      }
      reader.readAsDataURL(photo)
    })

    // Sepete ekledikten sonra sepet sayfasına yönlendir
    setTimeout(() => {
      navigate('/cart')
    }, 500)
  }

  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem 0', minHeight: '80vh' }}>
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {product.name} - Fotoğraf Yükle
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              {product.description}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {/* Fotoğraf Yükleme */}
            <div style={{
              background: '#f9fafb',
              padding: '2rem',
              borderRadius: '12px',
              border: '2px dashed #667eea'
            }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                1. Fotoğraflarınızı Seçin
              </h2>
              
              <input
                type="file"
                id="photoInput"
                multiple
                accept="image/*"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />
              
              <label
                htmlFor="photoInput"
                style={{
                  display: 'block',
                  padding: '2rem',
                  background: 'white',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '2px dashed #ccc',
                  marginBottom: '1rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea'
                  e.currentTarget.style.background = '#f0f4ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#ccc'
                  e.currentTarget.style.background = 'white'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#667eea', marginBottom: '0.5rem' }}>
                  Fotoğraflarınızı buraya sürükleyin
                </div>
                <div style={{ color: '#666' }}>veya tıklayarak seçin</div>
                <div style={{ fontSize: '0.9rem', color: '#999', marginTop: '0.5rem' }}>
                  JPEG, PNG, GIF, WEBP (Max: 10MB)
                </div>
              </label>

              {/* Seçilen Fotoğraflar */}
              {previews.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '1rem',
                  marginTop: '1.5rem'
                }}>
                  {previews.map((preview, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt={`Fotoğraf ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid #ddd'
                        }}
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {previews.length > 0 && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: previews.length >= 2 ? '#d1fae5' : '#fff3cd',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: previews.length >= 2 ? '#065f46' : '#856404',
                  border: `1px solid ${previews.length >= 2 ? '#10b981' : '#ffc107'}`
                }}>
                  {previews.length >= 2 ? (
                    <>✓ {previews.length} fotoğraf seçildi - Sepete eklenebilir</>
                  ) : (
                    <>⚠️ {previews.length} fotoğraf seçildi - En az 2 fotoğraf gerekli</>
                  )}
                </div>
              )}
            </div>

            {/* Adet ve Fiyat */}
            <div style={{
              background: '#f9fafb',
              padding: '2rem',
              borderRadius: '12px'
            }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                2. Adet Seçin
              </h2>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  fontSize: '1.1rem'
                }}>
                  Adet
                </label>
                  <input
                  type="number"
                  min="15"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 15)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '1.1rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}
                />
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.9rem',
                  color: '#666'
                }}>
                  Minimum 15 adet (tekli fiyat yok)
                </div>
              </div>

              {/* Fiyat Özeti */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                color: 'white',
                marginBottom: '1.5rem'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Birim Fiyat</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    ₺{(() => {
                      const bulkPrices = {
                        '10x15': { 15: 16, 25: 14, 35: 8, 50: 7.5, 100: 7 },
                        '15x20': { 15: 19, 25: 16, 35: 14, 50: 13, 100: 12 },
                        '20x30': { 15: 26, 25: 22, 35: 20, 50: 19, 100: 18 },
                        '30x40': { 15: 36, 25: 32, 35: 30, 50: 29, 100: 28 }
                      }
                      const sizeData = bulkPrices[product.size]
                      if (!sizeData) {
                        return ({ '10x15': 16, '15x20': 19, '20x30': 26, '30x40': 36 }[product.size] || 26).toFixed(2)
                      }
                      let bulkPrice = null
                      if (quantity >= 100) bulkPrice = sizeData[100]
                      else if (quantity >= 50) bulkPrice = sizeData[50]
                      else if (quantity >= 35) bulkPrice = sizeData[35]
                      else if (quantity >= 25) bulkPrice = sizeData[25]
                      else if (quantity >= 15) bulkPrice = sizeData[15]
                      
                      return (bulkPrice || { '10x15': 16, '15x20': 19, '20x30': 26, '30x40': 36 }[product.size] || 26).toFixed(2)
                    })()}
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Adet</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{quantity}</div>
                </div>
                <div style={{
                  borderTop: '2px solid rgba(255,255,255,0.3)',
                  paddingTop: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Toplam</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    ₺{calculatePrice(product.size, quantity, 'standard', product.customSize).toFixed(2)}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={photos.length < 2 || quantity < 15}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: photos.length >= 2 && quantity >= 15 ? 'var(--primary-color)' : '#ccc',
                  color: photos.length >= 2 && quantity >= 15 ? '#000000' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: photos.length >= 2 && quantity >= 15 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s',
                  boxShadow: photos.length >= 2 && quantity >= 15 ? '0 2px 8px rgba(212, 175, 55, 0.3)' : 'none'
                }}
              >
                🛒 Sepete Ekle
              </button>
              {photos.length === 1 && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  background: '#fff3cd',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#856404',
                  textAlign: 'center',
                  border: '1px solid #ffc107'
                }}>
                  ⚠️ Sepete eklemek için en az 2 fotoğraf seçmelisiniz
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default ProductUpload

