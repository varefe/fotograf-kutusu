import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Home() {
  const navigate = useNavigate()

  const products = [
    {
      size: '10x15',
      name: '10x15 cm',
      description: 'Küçük boyut',
      unitPrice: 16, // 15 adet birim fiyat
      totalPrice: 240, // 15 adet × 16 TL = 240 TL
      features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat']
    },
    {
      size: '15x20',
      name: '15x20 cm',
      description: 'Orta boyut',
      unitPrice: 19, // 15 adet birim fiyat
      totalPrice: 285, // 15 adet × 19 TL = 285 TL
      features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat']
    },
    {
      size: '20x30',
      name: '20x30 cm',
      description: 'Popüler boyut',
      unitPrice: 26, // 15 adet birim fiyat
      totalPrice: 390, // 15 adet × 26 TL = 390 TL
      features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat'],
      featured: true
    },
    {
      size: '30x40',
      name: '30x40 cm',
      description: 'Büyük boyut',
      unitPrice: 36, // 15 adet birim fiyat
      totalPrice: 540, // 15 adet × 36 TL = 540 TL
      features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat']
    }
  ]

  const handleProductClick = (product) => {
    navigate('/product', {
      state: { product }
    })
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="hero">
          <div className="container">
            <h1>Fotoğrafınızı Baskıya Dönüştürün</h1>
            <p className="hero-subtitle">Yüksek kaliteli baskı ve profesyonel çerçeveleme hizmeti</p>
            <p style={{ marginTop: '1rem', fontSize: '1.1rem', color: '#666' }}>
              Ürün seçin, fotoğraflarınızı yükleyin, sepete ekleyin!
            </p>
          </div>
        </div>

        <section className="how-it-works">
          <div className="container">
            <h2>Nasıl Çalışır?</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Fotoğrafınızı Yükleyin</h3>
                <p>İstediğiniz boyutta fotoğrafınızı yükleyin</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Boyut ve Adet Seçin</h3>
                <p>Standart veya özel boyut seçin, adet belirleyin</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Bilgilerinizi Girin</h3>
                <p>İletişim ve adres bilgilerinizi tamamlayın</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <h3>Baskı ve Teslimat</h3>
                <p>Otomatik baskı, çerçeveleme ve kargo</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pricing">
          <div className="container">
            <h2>Ürünlerimiz</h2>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
              Ürün seçin, fotoğraflarınızı yükleyin ve sepete ekleyin
            </p>
            <div className="pricing-grid">
              {products.map((product) => (
                <div
                  key={product.size}
                  className={`pricing-card ${product.featured ? 'featured' : ''}`}
                  onClick={() => handleProductClick(product)}
                >
                  <div className="pricing-card-image">
                    📷
                  </div>
                  <div className="pricing-card-content">
                    <h3>{product.name}</h3>
                    <div className="price">
                      ₺{product.totalPrice}
                      <span className="price-unit"> / 15 adet</span>
                    </div>
                    <p className="price-note" style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                      Birim fiyat: ₺{product.unitPrice}
                    </p>
                    <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.95rem' }}>{product.description}</p>
                    <ul style={{ textAlign: 'left', marginBottom: '1.5rem', listStyle: 'none', padding: 0 }}>
                      {product.features.map((feature, index) => (
                        <li key={index} style={{ padding: '0.25rem 0', fontSize: '0.875rem', color: '#555' }}>
                          ✓ {feature}
                        </li>
                      ))}
                    </ul>
                    <button style={{
                      width: '100%',
                      padding: '0.875rem',
                      background: 'var(--primary-color)',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--primary-gold)'
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'var(--primary-color)'
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)'
                    }}
                    >
                      Fotoğraf Yükle →
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="pricing-note">
              * Minimum 15 adet (tekli fiyat yok)<br/>
              * 15+ adet için toplu fiyat uygulanır<br/>
              * 99 TL üzeri ücretsiz kargo<br/>
              * Tüm ürünler yüksek kalite baskı ve çerçeve dahildir
            </p>
          </div>
        </section>

        <section className="payment-security-section">
          <div className="container">
            <h2>Güvenli Ödeme</h2>
            <p className="security-subtitle">Ödemeleriniz SSL sertifikası ile korunmaktadır</p>
            <div className="payment-security-logos">
              <img 
                src="/logos/visa.png" 
                alt="Visa" 
                className="payment-security-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <img 
                src="/logos/mastercard.png" 
                alt="MasterCard" 
                className="payment-security-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <img 
                src="/logos/iyzico-ile-ode-horizontal.png" 
                alt="iyzico ile Öde" 
                className="payment-security-logo"
                style={{ height: '50px' }}
              />
            </div>
            <div className="security-badge">
              <span className="security-badge-icon">🔒</span>
              <span>SSL Sertifikası ile Güvenli Alışveriş</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Home

