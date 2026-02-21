import { useNavigate, useLocation } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import SEO from '../components/SEO'
import ProductComparison from '../components/ProductComparison'
import { API_URL } from '../config/api'
import product1 from '../assets/product-1.png'
import product2 from '../assets/product-2.png'
import product3 from '../assets/product-3.png'
import product4 from '../assets/product-4.png'

const DEFAULT_IMAGES = [product1, product2, product3, product4]
const FALLBACK_PRODUCTS = [
  { size: '10x15', name: '10x15 cm', description: 'Küçük boyut', unitPrice: 16, totalPrice: 240, features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat'], image: product1 },
  { size: '15x20', name: '15x20 cm', description: 'Orta boyut', unitPrice: 19, totalPrice: 285, features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat'], image: product2 },
  { size: '20x30', name: '20x30 cm', description: 'Popüler boyut', unitPrice: 26, totalPrice: 390, features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat'], featured: true, image: product3 },
  { size: '30x40', name: '30x40 cm', description: 'Büyük boyut', unitPrice: 36, totalPrice: 540, features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat'], image: product4 }
]

/** Ürünler üstünde kullanıcıyı yönlendiren kategoriler (ilgi / kullanım alanı) */
const PRODUCT_CATEGORIES = [
  { id: 'memories', label: 'Anılarımı çerçeveleyeceğim', subtitle: 'En çok tercih edilen boyut', targetSize: '20x30', icon: 'camera' },
  { id: 'gift', label: 'Hediye arıyorum', subtitle: 'Sevdiklerinize özel', targetSize: '20x30', icon: 'cart' },
  { id: 'small', label: 'Polo kart & küçük baskı', subtitle: '10x15, 15x20', targetSize: '10x15', icon: 'image' },
  { id: 'wall', label: 'Duvar için büyük boy', subtitle: '30x40 ve üzeri', targetSize: '30x40', icon: 'crop' }
]

function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const heroRef = useRef(null)
  const stepsRef = useRef(null)
  const pricingRef = useRef(null)
  const carouselRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState({
    hero: true,
    steps: false,
    pricing: false
  })
  const [showComparison, setShowComparison] = useState(false)
  const [productsList, setProductsList] = useState([])
  const [carouselImages, setCarouselImages] = useState(null) // null = henüz yüklenmedi, [] = API boş

  const DEFAULT_CAROUSEL_IMAGES = [
    { id: 'def1', image: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop', alt: 'Duvarda çerçeveli anı fotoğrafları', title: 'Anılarınızı Ölümsüzleştirin', subtitle: 'En değerli anılarınızı profesyonel çerçevelerle süsleyin' },
    { id: 'def2', image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop', alt: 'Polo kartlar ve küçük fotoğraflar', title: 'Polo Kartlar ve Küçük Baskılar', subtitle: '10x15 ve 15x20 boyutlarında özel polo kartlar' },
    { id: 'def3', image: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop', alt: 'Anı duvarı aile fotoğrafları', title: 'Aile Anılarınız', subtitle: 'Sevdiklerinizle geçirdiğiniz özel anları çerçeveleyin' },
    { id: 'def4', image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop', alt: 'Çerçeveli fotoğraf koleksiyonu', title: 'Fotoğraf Koleksiyonunuz', subtitle: 'Farklı boyutlarda profesyonel baskı ve çerçeveleme' }
  ]
  const hiddenDefaultIds = (() => { try { return JSON.parse(localStorage.getItem('carousel_hidden_default_ids') || '[]') } catch { return [] } })()
  const defaultSlidesFiltered = DEFAULT_CAROUSEL_IMAGES.filter(s => !hiddenDefaultIds.includes(s.id))

  const fetchCarousel = useCallback(() => {
    const apiBase = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
    fetch(`${apiBase}/carousel?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.slides && data.slides.length > 0) {
          setCarouselImages(data.slides)
        } else {
          setCarouselImages([])
        }
      })
      .catch(() => setCarouselImages([]))
  }, [])

  useEffect(() => {
    fetchCarousel()
  }, [fetchCarousel])

  // Admin'de carousel güncellenince veya sekme tekrar açılınca güncel slaytları al
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchCarousel()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [fetchCarousel])

  useEffect(() => {
    const apiBase = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
    fetch(`${apiBase}/products`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.products && data.products.length > 0) {
          setProductsList(data.products.map((p, i) => ({
            ...p,
            features: p.features || [],
            image: p.image || DEFAULT_IMAGES[i % DEFAULT_IMAGES.length]
          })))
        }
      })
      .catch(() => {})
  }, [])

  const products = productsList.length > 0 ? productsList : FALLBACK_PRODUCTS
  const apiBase = API_URL.replace(/\/api\/?$/, '')
  // Frontend asset'leri (Vite /assets, /src) frontend origin'den; diğerleri (örn. /uploads) backend'den
  const productImageUrl = (img) => {
    if (!img) return ''
    if (img.startsWith('http') || img.startsWith('data:')) return img
    const path = img.startsWith('/') ? img : `/${img}`
    if (path.startsWith('/assets') || path.startsWith('/src/')) return `${window.location.origin}${path}`
    return `${apiBase}${path}`
  }

  const activeCarouselSlides = carouselImages === null
    ? (defaultSlidesFiltered.length > 0 ? defaultSlidesFiltered : DEFAULT_CAROUSEL_IMAGES)
    : (carouselImages.length > 0 ? carouselImages : (defaultSlidesFiltered.length > 0 ? defaultSlidesFiltered : DEFAULT_CAROUSEL_IMAGES))

  // Otomatik carousel geçişi
  useEffect(() => {
    if (activeCarouselSlides.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeCarouselSlides.length)
    }, 5000) // 5 saniyede bir geçiş

    return () => clearInterval(interval)
  }, [activeCarouselSlides.length])

  // Carousel geçiş fonksiyonları
  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeCarouselSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeCarouselSlides.length) % activeCarouselSlides.length)
  }

  // Scroll animasyonları için Intersection Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = entry.target.getAttribute('data-section')
          setIsVisible(prev => ({ ...prev, [section]: true }))
        }
      })
    }, observerOptions)

    if (heroRef.current) {
      heroRef.current.setAttribute('data-section', 'hero')
      observer.observe(heroRef.current)
    }
    if (stepsRef.current) {
      stepsRef.current.setAttribute('data-section', 'steps')
      observer.observe(stepsRef.current)
    }
    if (pricingRef.current) {
      pricingRef.current.setAttribute('data-section', 'pricing')
      observer.observe(pricingRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleProductClick = (product) => {
    navigate('/product', {
      state: { product }
    })
  }

  /** Kategori butonuna tıklanınca ürünler bölümüne scroll edip ilgili ürün kartını vurgular */
  const scrollToProductCategory = (targetSize) => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => {
      const el = document.getElementById(`product-${targetSize}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('product-card-highlight')
        setTimeout(() => el.classList.remove('product-card-highlight'), 2000)
      }
    }, 400)
  }

  return (
    <>
      <SEO 
        title="Fotoğraf Kutusu - Profesyonel Fotoğraf Baskı ve Çerçeveleme"
        description="Yüksek kaliteli fotoğraf baskı, çerçeveleme ve özel boyut fotoğraf hizmetleri. 10x15'ten 70x100'e kadar tüm boyutlarda profesyonel baskı. Hızlı teslimat, uygun fiyatlar. Anılarınızı ölümsüzleştirin!"
        keywords="fotoğraf baskı, fotoğraf çerçeveleme, fotoğraf basım, fotoğraf kutusu, fotoğraf siparişi, online fotoğraf baskı, fotoğraf boyutları, özel boyut fotoğraf, profesyonel fotoğraf baskı"
        url="/"
      />
      <Navbar />
      {location.state?.orderSuccess && location.state?.orderCode && (
        <div
          style={{
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            border: '2px solid #10b981',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            margin: '1rem auto',
            maxWidth: '600px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
          }}
        >
          <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#065f46' }}>
            Siparişiniz oluşturuldu.
          </span>
          <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#047857' }}>
            #{location.state.orderCode}
          </span>
        </div>
      )}
      <main>
        <div 
          ref={heroRef}
          className={`hero ${isVisible.hero ? 'fade-in-up' : ''}`}
          style={{
            opacity: isVisible.hero ? 1 : 0,
            transform: isVisible.hero ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Carousel Container */}
          <div 
            ref={carouselRef}
            className="hero-carousel"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              minHeight: '500px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Carousel Slides */}
            {activeCarouselSlides.map((slide, index) => (
              <div
                key={slide.id ?? slide._id ?? index}
                className="carousel-slide"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: index === currentSlide ? 1 : 0,
                  transform: `translateX(${(index - currentSlide) * 100}%)`,
                  transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
                  backgroundImage: slide.image ? `url(${slide.image})` : 'none',
                  backgroundColor: slide.image ? undefined : '#1e293b',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: index === currentSlide ? 2 : 1
                }}
              >
                {/* Overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(2, 6, 23, 0.45)',
                  zIndex: 1
                }}></div>
                
                {/* Content */}
                <div className="container" style={{
                  position: 'relative',
                  zIndex: 2,
                  textAlign: 'center',
                  color: '#f8fafc'
                }}>
                  <div>
                    <h1 style={{
                      fontSize: '3.5rem',
                      marginBottom: '1rem',
                      fontWeight: 900,
                      color: '#ffffff'
                    }}>
                      {slide.title || 'Fotoğraf Kutusu'}
                    </h1>
                    <p 
                      className="hero-subtitle"
                      style={{
                        fontSize: '1.5rem',
                        marginBottom: '2rem',
                        color: '#e2e8f0',
                        fontWeight: 500
                      }}
                    >
                      {slide.subtitle || 'Profesyonel fotoğraf baskı ve çerçeveleme'}
                    </p>
                    <p style={{ 
                      marginTop: '1rem', 
                      fontSize: '1.1rem', 
                      color: '#cbd5f5'
                    }}>
                      Ürün seçin, fotoğraflarınızı yükleyin, sepete ekleyin!
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="carousel-arrow carousel-arrow-left"
              aria-label="Önceki slide"
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              className="carousel-arrow carousel-arrow-right"
              aria-label="Sonraki slide"
            >
              ›
            </button>

            {/* Dots Indicator */}
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '10px',
              zIndex: 10
            }}>
              {activeCarouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  style={{
                    width: index === currentSlide ? '30px' : '12px',
                    height: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: index === currentSlide ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0
                  }}
                  onMouseEnter={(e) => {
                    if (index !== currentSlide) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.8)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== currentSlide) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.5)'
                    }
                  }}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <section className="product-categories">
          <div className="container">
            <p className="product-categories-badge">Ne arıyorsunuz?</p>
            <h2>İhtiyacınıza göre ürünü bulun</h2>
            <p className="product-categories-sub">Bir kategori seçin, size uygun ürünü hemen görün.</p>
            <div className="product-categories-grid">
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className="product-category-card"
                  onClick={() => scrollToProductCategory(cat.targetSize)}
                >
                  <span className="product-category-icon">
                    <Icon name={cat.icon} size={26} />
                  </span>
                  <span className="product-category-label">{cat.label}</span>
                  <span className="product-category-subtitle">{cat.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section 
          ref={pricingRef}
          className={`pricing ${isVisible.pricing ? 'fade-in-up' : ''}`}
          style={{
            opacity: isVisible.pricing ? 1 : 0,
            transform: isVisible.pricing ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
          }}
        >
          <div className="container">
            <h2>Ürünlerimiz</h2>
            <p style={{ 
              textAlign: 'center', 
              color: '#666', 
              marginBottom: '2rem'
            }}>
              Ürün seçin, fotoğraflarınızı yükleyin ve sepete ekleyin
            </p>
            <div className="pricing-grid">
              {products.map((product, index) => (
                <div
                  key={product.size}
                  id={`product-${product.size}`}
                  className={`pricing-card ${product.featured ? 'featured' : ''}`}
                  onClick={() => handleProductClick(product)}
                  style={{
                    cursor: 'pointer'
                  }}
                >
                  <div 
                    className="pricing-card-image"
                    style={{
                      backgroundImage: product.image ? `url(${productImageUrl(product.image)})` : 'none',
                      backgroundColor: product.image ? 'transparent' : 'var(--bg-gray)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {!product.image && (
                      <div style={{
                        fontSize: '4rem',
                        color: 'var(--primary-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%'
                      }}>
                        <Icon name="camera" size={40} />
                      </div>
                    )}
                    {/* Overlay for better text readability */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: product.image ? 'rgba(2, 6, 23, 0.15)' : 'transparent',
                      pointerEvents: 'none'
                    }}></div>
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
                      {(product.features || []).map((feature, index) => (
                        <li key={index} style={{ padding: '0.25rem 0', fontSize: '0.875rem', color: '#555' }}>
                          ✓ {feature}
                        </li>
                      ))}
                    </ul>
                    <button className="btn btn-primary btn-block">
                      Fotoğraf Yükle
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
              <Icon name="lock" size={16} className="security-badge-icon" />
              <span>SSL Sertifikası ile Güvenli Alışveriş</span>
            </div>
          </div>
        </section>

        <section 
          ref={stepsRef}
          className={`highlights-section ${isVisible.steps ? 'fade-in-up' : ''}`}
          style={{
            opacity: isVisible.steps ? 1 : 0,
            transform: isVisible.steps ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
          }}
        >
          <div className="container">
            <p className="highlights-badge">Neden biz?</p>
            <h2>Anılarınız güvende, teslimat hızlı</h2>
            <p className="highlights-sub">Fotoğraf Kutusu ile sipariş vermek hem kolay hem güvenilir.</p>
            <div className="highlights-grid">
              <div className="highlight-card">
                <span className="highlight-icon">
                  <Icon name="camera" size={28} />
                </span>
                <h3>Profesyonel baskı</h3>
                <p>Yüksek çözünürlüklü, renkleri canlı baskılar; çerçeve dahil.</p>
              </div>
              <div className="highlight-card">
                <span className="highlight-icon">
                  <Icon name="shield" size={28} />
                </span>
                <h3>Güvenli alışveriş</h3>
                <p>Ödeme ve kişisel bilgileriniz güvende, güvenle sipariş verin.</p>
              </div>
              <div className="highlight-card">
                <span className="highlight-icon">
                  <Icon name="truck" size={28} />
                </span>
                <h3>Hızlı teslimat</h3>
                <p>Baskı ve kargo süreçleri hızlı; siparişiniz kapınızda.</p>
              </div>
              <div className="highlight-card">
                <span className="highlight-icon">
                  <Icon name="check-circle" size={28} />
                </span>
                <h3>Kolay sipariş</h3>
                <p>Yükle, boyut ve adet seç, bilgilerini gir; gerisini biz hallederiz.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Product Comparison Modal */}
      {showComparison && (
        <ProductComparison
          onAddToCart={(productData) => {
            // Navigate to product upload with pre-filled data
            navigate('/product-upload', {
              state: {
                prefillSize: productData.size,
                prefillQuantity: productData.quantity,
                prefillShipping: productData.shippingType
              }
            })
            setShowComparison(false)
          }}
          onClose={() => setShowComparison(false)}
        />
      )}
    </>
  )
}

export default Home

