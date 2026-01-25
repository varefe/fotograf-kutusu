import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { calculatePrice, getBulkPrice } from '../utils/priceCalculator'

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

  // Thumbnail oluştur (performans için küçük boyut) - useCallback ile optimize edildi
  const createThumbnail = useCallback((file, maxWidth = 200, maxHeight = 200) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Aspect ratio korunarak resize
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.7)) // JPEG, %70 kalite
        }
        img.onerror = () => {
          // Hata durumunda orijinal dosyayı kullan
          resolve(null)
        }
        img.src = e.target.result
      }
      reader.onerror = () => {
        resolve(null)
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files)
    const imageFiles = files.filter(file => {
      // Sadece dosya tipi kontrolü (boyut kontrolü yok)
      if (!file.type.startsWith('image/')) {
        return false
      }
      return true
    })
    
    if (imageFiles.length === 0) {
      if (files.length > 0) {
        alert('Lütfen geçerli resim dosyaları seçin (JPEG, PNG, GIF, WebP)')
      }
      return
    }
    
    // Dosyaları hemen ekle (preview'lar asenkron yüklenecek)
    setPhotos(prev => [...prev, ...imageFiles])
    
    // Preview'ları batch olarak oluştur (performans için)
    // Her 5 fotoğrafta bir kısa bekleme (UI donmasını önle)
    const newPreviews = []
    for (let i = 0; i < imageFiles.length; i++) {
      const thumbnail = await createThumbnail(imageFiles[i])
      // Thumbnail oluşturulamazsa placeholder kullan
      newPreviews.push(thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5GbyZyZWc7cmE8L3RleHQ+PC9zdmc+')
      
      // Her 5 fotoğrafta bir kısa bekleme (UI donmasını önle)
      if (i % 5 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }
    
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddToCart = () => {
    if (photos.length === 0) {
      alert('Lütfen en az 15 fotoğraf seçin')
      return
    }

    if (photos.length < 15) {
      alert('Sepete eklemek için en az 15 fotoğraf seçmelisiniz')
      return
    }

    if (quantity < 15) {
      alert('Minimum 15 adet seçmelisiniz')
      return
    }

    // Her fotoğraf için ayrı ayrı fiyat hesapla (quantity adet için)
    // ÖNEMLİ: Her fotoğraf için quantity adet için fiyat hesaplanır, toplam adet için değil
    let basePrice = 0
    if (product.size === 'custom' && product.customSize) {
      const area = product.customSize.width * product.customSize.height
      basePrice = Math.ceil(area / 100) * 0.5
    } else {
      // Her fotoğraf için quantity adet için fiyat hesapla
      const bulkPrice = getBulkPrice(product.size, quantity)
      if (bulkPrice) {
        basePrice = bulkPrice
      } else {
        // Fallback: 15 adet fiyatı
        const sizePrices = { '10x15': 16, '15x20': 19, '20x30': 26, '30x40': 36 }
        basePrice = sizePrices[product.size] || 26
      }
    }
    
    // Her fotoğraf için fiyat (quantity adet × birim fiyat - kargo hariç)
    const pricePerPhoto = basePrice * quantity
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductUpload.jsx:151',message:'Price calculation in ProductUpload',data:{quantity,photosCount:photos.length,basePrice,pricePerPhoto,totalQuantity:quantity*photos.length,calculation:`${basePrice} TL/adet × ${quantity} adet = ${pricePerPhoto} TL/fotoğraf`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    console.log('💰 Fiyat Hesaplama (ProductUpload):', {
      quantity,
      photosCount: photos.length,
      basePrice: `${basePrice} TL/adet`,
      pricePerPhoto: `${pricePerPhoto} TL/fotoğraf`,
      calculation: `${basePrice} TL/adet × ${quantity} adet = ${pricePerPhoto} TL/fotoğraf`,
      totalForAllPhotos: `${pricePerPhoto} TL × ${photos.length} fotoğraf = ${pricePerPhoto * photos.length} TL`
    })

    // Fotoğrafları sepete ekle (base64'i storage'a kaydetme, sadece metadata)
    // Base64 ödeme sayfasına geçerken oluşturulacak
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductUpload.jsx:153',message:'Starting forEach loop',data:{photosCount:photos.length,previewsCount:previews.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    photos.forEach((photo, index) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductUpload.jsx:154',message:'forEach iteration',data:{index,photoName:photo.name,photosLength:photos.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const cartItem = {
        product: {
          size: product.size,
          name: product.name,
          description: product.description,
          customSize: product.customSize
        },
        photo: {
          preview: previews[index],
          filename: photo.name,
          mimetype: photo.type,
          size: photo.size
          // File objesi ve base64 storage'a kaydedilmiyor (quota için)
          // Base64 ödeme sayfasına geçerken oluşturulacak
        },
        quantity,
        price: pricePerPhoto,
        shippingType: 'standard'
      }

      addToCart(cartItem)
    })

    // File objelerini location.state ile Cart'a gönder (base64'e çevirmek için)
    setTimeout(() => {
      navigate('/cart', {
        state: {
          photos: photos // File objelerini Cart'a gönder
        }
      })
    }, 100)
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
                  JPEG, PNG, GIF, WEBP (Boyut sınırı yok)
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
                  background: previews.length >= 15 ? '#d1fae5' : '#fff3cd',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: previews.length >= 15 ? '#065f46' : '#856404',
                  border: `1px solid ${previews.length >= 15 ? '#10b981' : '#ffc107'}`
                }}>
                  {previews.length >= 15 ? (
                    <>✓ {previews.length} fotoğraf seçildi - Sepete eklenebilir</>
                  ) : (
                    <>⚠️ {previews.length} fotoğraf seçildi - En az 15 fotoğraf gerekli</>
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
                    ₺{(() => {
                      // Toplam fiyat: (birim fiyat × quantity) + kargo (sadece bir fotoğraf için)
                      const bulkPrices = {
                        '10x15': { 15: 16, 25: 14, 35: 8, 50: 7.5, 100: 7 },
                        '15x20': { 15: 19, 25: 16, 35: 14, 50: 13, 100: 12 },
                        '20x30': { 15: 26, 25: 22, 35: 20, 50: 19, 100: 18 },
                        '30x40': { 15: 36, 25: 32, 35: 30, 50: 29, 100: 28 }
                      }
                      const sizeData = bulkPrices[product.size] || { 15: 26 }
                      let unitPrice = sizeData[15]
                      if (quantity >= 100 && sizeData[100]) unitPrice = sizeData[100]
                      else if (quantity >= 50 && sizeData[50]) unitPrice = sizeData[50]
                      else if (quantity >= 35 && sizeData[35]) unitPrice = sizeData[35]
                      else if (quantity >= 25 && sizeData[25]) unitPrice = sizeData[25]
                      else if (quantity >= 15 && sizeData[15]) unitPrice = sizeData[15]
                      
                      // Sadece bir fotoğraf için fiyat hesapla
                      const subtotal = unitPrice * quantity
                      const shippingPrice = subtotal >= 99 ? 0 : 15
                      const total = subtotal + shippingPrice
                      
                      return total.toFixed(2)
                    })()}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={photos.length < 15 || quantity < 15}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: photos.length >= 15 && quantity >= 15 ? 'var(--primary-color)' : '#ccc',
                  color: photos.length >= 15 && quantity >= 15 ? '#000000' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: photos.length >= 15 && quantity >= 15 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s',
                  boxShadow: photos.length >= 15 && quantity >= 15 ? '0 2px 8px rgba(212, 175, 55, 0.3)' : 'none'
                }}
              >
                🛒 Sepete Ekle
              </button>
              {photos.length > 0 && photos.length < 15 && (
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
                  ⚠️ Sepete eklemek için en az 15 fotoğraf seçmelisiniz ({15 - photos.length} fotoğraf daha gerekli)
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

