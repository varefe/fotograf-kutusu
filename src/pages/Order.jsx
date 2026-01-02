import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { saveOrderToStorage, getOrdersFromStorage, decryptData } from '../utils/encryption'
import { calculatePrice } from '../utils/priceCalculator'

function Order() {
  const navigate = useNavigate()
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showCustomSize, setShowCustomSize] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [formData, setFormData] = useState({
    size: '20x30',
    customWidth: '',
    customHeight: '',
    quantity: 15, // Minimum 15 adet
    shippingType: 'standard',
    email: '',
    address: '',
    phone: ''
  })

  // Canlı fiyat hesaplama
  const currentPrice = useMemo(() => {
    if (!selectedFile) return null
    
    const customSize = formData.size === 'custom' && formData.customWidth && formData.customHeight
      ? { width: parseFloat(formData.customWidth), height: parseFloat(formData.customHeight) }
      : undefined

    return calculatePrice(
      formData.size,
      parseInt(formData.quantity) || 1,
      formData.shippingType,
      customSize
    )
  }, [selectedFile, formData.size, formData.quantity, formData.shippingType, formData.customWidth, formData.customHeight])

  // Fiyat detayları (kargo ücretsiz kontrolü için)
  const priceDetails = useMemo(() => {
    if (!currentPrice) return null
    
    // Toplu fiyat kontrolü (sadece toplu fiyatlar)
    const getBulkPrice = (size, quantity) => {
      const bulkPrices = {
        '10x15': {
          bulk: { 25: 14, 35: 8, 50: 7.5, 100: 7 }
        },
        '15x20': {
          bulk: { 25: 16, 35: 14, 50: 13, 100: 12 }
        },
        '20x30': {
          bulk: { 25: 22, 35: 20, 50: 19, 100: 18 }
        },
        '30x40': {
          bulk: { 25: 32, 35: 30, 50: 29, 100: 28 }
        }
      }
      const sizeData = bulkPrices[formData.size]
      if (!sizeData) return null
      const qty = parseInt(formData.quantity) || 1
      if (qty >= 100 && sizeData.bulk[100]) return sizeData.bulk[100]
      if (qty >= 50 && sizeData.bulk[50]) return sizeData.bulk[50]
      if (qty >= 35 && sizeData.bulk[35]) return sizeData.bulk[35]
      if (qty >= 25 && sizeData.bulk[25]) return sizeData.bulk[25]
      return null // 25'ten az adet için null (toplu fiyat yok)
    }
    
    // Base price hesaplama (sadece toplu fiyat)
    let basePrice = 0
    if (formData.size === 'custom' && formData.customWidth && formData.customHeight) {
      const area = parseFloat(formData.customWidth) * parseFloat(formData.customHeight)
      basePrice = Math.ceil(area / 100) * 0.5
    } else {
      const bulkPrice = getBulkPrice(formData.size, parseInt(formData.quantity) || 1)
      if (bulkPrice) {
        basePrice = bulkPrice
      } else {
        // 25'ten az adet için minimum fiyat
        basePrice = { '10x15': 15, '15x20': 18, '20x30': 25, '30x40': 35 }[formData.size] || 25
      }
    }
    
    const quantity = parseInt(formData.quantity) || 1
    const subtotal = basePrice * quantity
    
    const shippingPrices = { 'standard': 15, 'express': 35 }
    let shippingPrice = shippingPrices[formData.shippingType] || 15
    if (subtotal >= 99) {
      shippingPrice = 0
    }
    
    return {
      basePrice,
      quantity,
      subtotal,
      shippingPrice,
      total: currentPrice,
      isBulkPrice: getBulkPrice(formData.size, quantity) !== null
    }
  }, [currentPrice, formData])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setPreview(null)
    setSelectedFile(null)
  }

  const handleSizeChange = (e) => {
    const value = e.target.value
    setFormData({ ...formData, size: value })
    setShowCustomSize(value === 'custom')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validasyon
    if (!selectedFile) {
      alert('Lütfen bir fotoğraf seçin')
      return
    }
    
    if (!formData.email || !formData.address) {
      alert('Lütfen e-posta ve adres bilgilerini doldurun')
      return
    }
    
    if (formData.size === 'custom' && (!formData.customWidth || !formData.customHeight)) {
      alert('Özel boyut için genişlik ve yükseklik girmelisiniz')
      return
    }
    
    setIsSubmitting(true)
    console.log('🚀 Sipariş gönderiliyor...')
    
    try {
      // Fotoğrafı base64'e çevir
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1] // data:image/... kısmını kaldır
        
        // API'ye gönderilecek veri
        const orderData = {
          photo: {
            filename: selectedFile.name,
            originalName: selectedFile.name,
            base64: base64String,
            mimetype: selectedFile.type,
            size: selectedFile.size
          },
          size: formData.size,
          customSize: formData.size === 'custom' ? {
            width: parseFloat(formData.customWidth),
            height: parseFloat(formData.customHeight)
          } : undefined,
          quantity: parseInt(formData.quantity),
          shippingType: formData.shippingType,
          email: formData.email,
          address: formData.address,
          phone: formData.phone || '',
          firstName: 'Müşteri',
          lastName: 'Müşteri',
          notes: '',
          // Varsayılan değerler (backend uyumluluğu için)
          frameType: 'none',
          paperType: 'glossy',
          colorMode: 'color'
        }
        
        // Fiyatı hesapla
        const calculatedPrice = calculatePrice(
          formData.size,
          parseInt(formData.quantity),
          formData.shippingType,
          formData.size === 'custom' ? {
            width: parseFloat(formData.customWidth),
            height: parseFloat(formData.customHeight)
          } : undefined
        )
        
        // DOĞRU AKIŞ: Önce ödeme, sonra sipariş kaydı
        // Sadece localStorage'a kaydet, backend'e kaydetme
        const orderId = Date.now().toString()
        const orderToSave = {
          ...orderData,
          id: orderId,
          price: calculatedPrice,
          status: 'Yeni',
          paymentStatus: 'pending',
          customerInfo: {
            firstName: orderData.firstName || 'Müşteri',
            lastName: orderData.lastName || 'Müşteri',
            email: orderData.email,
            phone: orderData.phone || '',
            address: orderData.address
          },
          createdAt: new Date().toISOString()
        }
        
        // Şifreleyerek localStorage'a kaydet
        const saved = saveOrderToStorage(orderToSave)
        
        if (saved) {
          console.log('✅ Sipariş localStorage\'a kaydedildi, ödeme sayfasına yönlendiriliyor:', orderId)
          
          // Loading state'i kapat
          setIsSubmitting(false)
          
          // Direkt window.location ile yönlendir (kesin çalışsın)
          const paymentUrl = `/payment?orderId=${orderId}`
          console.log('🚀 Yönlendirme URL:', paymentUrl)
          
          // Kısa bir gecikme sonrası yönlendir
          setTimeout(() => {
            window.location.href = paymentUrl
          }, 300)
        } else {
          console.error('❌ localStorage\'a kaydedilemedi')
          alert('Sipariş kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.')
          setIsSubmitting(false)
        }
      }
      
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Sipariş gönderme hatası:', error)
      alert('Sipariş gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="order-page">
          <div className="container">
            <h1>Sipariş Ver</h1>
            
            {submitSuccess ? (
              <div className="success-message" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '3rem',
                borderRadius: '12px',
                textAlign: 'center',
                color: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                marginTop: '2rem'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Siparişiniz Başarıyla Oluşturuldu!</h2>
                <p style={{ fontSize: '1.1rem', marginBottom: '1rem', opacity: 0.9 }}>
                  Sipariş No: <strong>#{orderId}</strong>
                </p>
                <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: 0.9 }}>
                  Siparişiniz şifreli olarak kaydedildi. En kısa sürede sizinle iletişime geçeceğiz.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/" className="btn btn-secondary" style={{
                    padding: '0.75rem 2rem',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    border: '2px solid white',
                    transition: 'all 0.3s'
                  }}>
                    Ana Sayfaya Dön
                  </Link>
                  <button
                    onClick={() => {
                      setSubmitSuccess(false)
                      setOrderId(null)
                      setFormData({
                        size: '20x30',
                        customWidth: '',
                        customHeight: '',
                        quantity: 1,
                        shippingType: 'standard',
                        email: '',
                        address: '',
                        phone: ''
                      })
                      setPreview(null)
                      setSelectedFile(null)
                      setShowCustomSize(false)
                    }}
                    style={{
                      padding: '0.75rem 2rem',
                      background: 'white',
                      color: '#667eea',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    Yeni Sipariş Ver
                  </button>
                </div>
              </div>
            ) : (
            <form className="order-form" onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="form-section">
                <h2>1. Fotoğraf Yükle</h2>
                <div 
                  className="upload-area" 
                  style={{
                    minHeight: '250px',
                    border: '3px dashed #4f46e5',
                    borderRadius: '12px',
                    padding: '40px',
                    background: '#f9fafb',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    textAlign: 'center'
                  }}
                  onClick={() => document.getElementById('photoInput').click()}
                >
                  <input 
                    type="file" 
                    id="photoInput" 
                    name="photo" 
                    accept="image/*" 
                    required 
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  {!preview ? (
                    <div className="upload-placeholder">
                      <span className="upload-icon" style={{ fontSize: '64px', display: 'block', marginBottom: '20px' }}>📷</span>
                      <p style={{ fontSize: '18px', color: '#4f46e5', fontWeight: '600', marginBottom: '10px' }}>
                        Fotoğrafınızı buraya sürükleyin
                      </p>
                      <p style={{ color: '#6b7280', marginBottom: '20px' }}>veya tıklayarak seçin</p>
                      <small style={{ color: '#9ca3af' }}>JPEG, PNG, GIF, WEBP (Max: 10MB)</small>
                    </div>
                  ) : (
                    <div className="upload-preview" style={{ position: 'relative', display: 'inline-block' }}>
                      <img 
                        src={preview} 
                        alt="Önizleme" 
                        style={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                      <button 
                        type="button" 
                        className="btn-remove" 
                        onClick={handleRemovePhoto}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          fontSize: '20px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h2>2. Boyut Seç</h2>
                <div className="form-group">
                  <label htmlFor="size">Boyut <span className="required">*</span></label>
                  <select 
                    id="size" 
                    name="size" 
                    required 
                    value={formData.size}
                    onChange={handleSizeChange}
                  >
                    <option value="">Seçiniz</option>
                    <option value="10x15">10x15 cm</option>
                    <option value="15x20">15x20 cm</option>
                    <option value="20x30">20x30 cm</option>
                    <option value="30x40">30x40 cm</option>
                    <option value="custom">Özel Boyut</option>
                  </select>
                </div>

                {showCustomSize && (
                  <div className="custom-size-group">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="customWidth">Genişlik (cm) <span className="required">*</span></label>
                        <input 
                          type="number" 
                          id="customWidth" 
                          name="customWidth" 
                          min="1" 
                          step="0.1" 
                          placeholder="Örn: 25"
                          value={formData.customWidth}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="customHeight">Yükseklik (cm) <span className="required">*</span></label>
                        <input 
                          type="number" 
                          id="customHeight" 
                          name="customHeight" 
                          min="1" 
                          step="0.1" 
                          placeholder="Örn: 35"
                          value={formData.customHeight}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <p className="form-help">Özel boyut seçtiğinizde genişlik ve yükseklik değerlerini girmelisiniz.</p>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="quantity">Adet</label>
                  <input 
                    type="number" 
                    id="quantity" 
                    name="quantity" 
                    min="15" 
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                  <small className="form-help">Minimum 15 adet (tekli fiyat yok)</small>
                </div>
              </div>

              <div className="form-section">
                <h2>3. Kargo Seçimi</h2>
                <div className="form-group">
                  <label htmlFor="shippingType">Kargo Tipi</label>
                  <select 
                    id="shippingType" 
                    name="shippingType"
                    value={formData.shippingType}
                    onChange={handleInputChange}
                  >
                    <option value="standard">Standart Kargo (3-5 gün, ₺15)</option>
                    <option value="express">Express Kargo (1-2 gün, ₺35)</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h2>4. İletişim Bilgileri</h2>
                <div className="form-group">
                  <label htmlFor="email">E-posta <span className="required">*</span></label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required 
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="address">Adres <span className="required">*</span></label>
                  <textarea 
                    id="address" 
                    name="address" 
                    rows="3" 
                    required 
                    placeholder="Teslimat adresinizi giriniz"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Telefon (Opsiyonel)</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    placeholder="555 555 55 55"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Fiyat Özeti */}
              {currentPrice && selectedFile && (
                <div className="form-section" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginTop: '2rem',
                  color: 'white',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                }}>
                  <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                    💰 Fiyat Özeti
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Birim Fiyat</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        ₺{priceDetails ? (priceDetails.subtotal / priceDetails.quantity).toFixed(2) : '0.00'}
                      </div>
                      {priceDetails?.isBulkPrice && (
                        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                          🎁 Toplu Fiyat
                        </div>
                      )}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Adet</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{formData.quantity} adet</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Kargo</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {priceDetails && priceDetails.shippingPrice === 0 ? 'ÜCRETSİZ 🎉' : `₺${priceDetails?.shippingPrice || (formData.shippingType === 'standard' ? '15' : '35')}`}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    borderTop: '2px solid rgba(255,255,255,0.3)',
                    paddingTop: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Toplam Tutar</div>
                      {priceDetails?.isBulkPrice ? (
                        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.25rem' }}>
                          🎁 Toplu fiyat uygulandı! (25+ adet)
                        </div>
                      ) : parseInt(formData.quantity) >= 3 && (
                        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.25rem' }}>
                          {parseInt(formData.quantity) >= 10 ? '🎁 %15 indirim uygulandı!' :
                           parseInt(formData.quantity) >= 5 ? '🎁 %10 indirim uygulandı!' :
                           '🎁 %5 indirim uygulandı!'}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                      ₺{currentPrice.toFixed(2)}
                    </div>
                  </div>
                  {priceDetails && priceDetails.subtotal < 99 && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}>
                      🚚 ₺{(99 - priceDetails.subtotal).toFixed(2)} daha ekleyin, kargo ücretsiz olsun!
                    </div>
                  )}
                </div>
              )}

              <div className="form-actions" style={{ textAlign: 'center', marginTop: '40px' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-large" 
                  style={{ fontSize: '18px', padding: '15px 40px' }}
                  disabled={isSubmitting || !selectedFile}
                >
                  {isSubmitting ? '⏳ Sipariş Oluşturuluyor...' : '📸 Sipariş Ver ve Ödemeye Geç'}
                </button>
                {isSubmitting && (
                  <p style={{ marginTop: '1rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                    Lütfen bekleyin, ödeme sayfasına yönlendirileceksiniz...
                  </p>
                )}
              </div>
            </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Order

