import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Home() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const stepsRef = useRef(null)
  const pricingRef = useRef(null)
  const carouselRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState({
    hero: false,
    steps: false,
    pricing: false
  })

  // Carousel fotoğrafları - Fotoğraf baskı hizmetine uygun görseller
  // Pexels'tan ücretsiz yüksek kaliteli fotoğraflar
  const carouselImages = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop', // Duvarda çerçeveli anı fotoğrafları - wall gallery
      alt: 'Duvarda çerçeveli anı fotoğrafları',
      title: 'Anılarınızı Ölümsüzleştirin',
      subtitle: 'En değerli anılarınızı profesyonel çerçevelerle süsleyin',
      gradient: 'linear-gradient(135deg, var(--primary-gold) 0%, var(--primary-color) 50%, var(--primary-dark) 100%)'
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop', // Masa üstünde küçük fotoğraflar ve polo kartlar - polaroid instant photos
      alt: 'Polo kartlar ve küçük fotoğraflar',
      title: 'Polo Kartlar ve Küçük Baskılar',
      subtitle: '10x15 ve 15x20 boyutlarında özel polo kartlar',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop', // Anı duvarı - aile fotoğrafları - memory wall
      alt: 'Anı duvarı aile fotoğrafları',
      title: 'Aile Anılarınız',
      subtitle: 'Sevdiklerinizle geçirdiğiniz özel anları çerçeveleyin',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 4,
      image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop', // Çerçeveli fotoğraf koleksiyonu - photo frames collection
      alt: 'Çerçeveli fotoğraf koleksiyonu',
      title: 'Fotoğraf Koleksiyonunuz',
      subtitle: 'Farklı boyutlarda profesyonel baskı ve çerçeveleme',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ]

  // Otomatik carousel geçişi
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 5000) // 5 saniyede bir geçiş

    return () => clearInterval(interval)
  }, [carouselImages.length])

  // Carousel geçiş fonksiyonları
  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
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

  const products = [
    {
      size: '10x15',
      name: '10x15 cm',
      description: 'Küçük boyut',
      unitPrice: 16, // 15 adet birim fiyat
      totalPrice: 240, // 15 adet × 16 TL = 240 TL
      features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat'],
      image: '/images/product-1.png'
    },
    {
      size: '15x20',
      name: '15x20 cm',
      description: 'Orta boyut',
      unitPrice: 19, // 15 adet birim fiyat
      totalPrice: 285, // 15 adet × 19 TL = 285 TL
      features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat'],
      image: '/images/product-2.png'
    },
    {
      size: '20x30',
      name: '20x30 cm',
      description: 'Popüler boyut',
      unitPrice: 26, // 15 adet birim fiyat
      totalPrice: 390, // 15 adet × 26 TL = 390 TL
      features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat'],
      featured: true,
      image: '/images/product-3.png'
    },
    {
      size: '30x40',
      name: '30x40 cm',
      description: 'Büyük boyut',
      unitPrice: 36, // 15 adet birim fiyat
      totalPrice: 540, // 15 adet × 36 TL = 540 TL
      features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat'],
      image: '/images/product-4.png'
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
            {carouselImages.map((slide, index) => (
              <div
                key={slide.id}
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
                  backgroundImage: `url(${slide.image}), ${slide.gradient}`,
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
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
                  zIndex: 1
                }}></div>
                
                {/* Content */}
                <div className="container" style={{
                  position: 'relative',
                  zIndex: 2,
                  textAlign: 'center',
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}>
                  <div style={{
                    animation: index === currentSlide && isVisible.hero ? 'slideInDown 0.8s ease-out' : 'none'
                  }}>
                    <h1 style={{
                      fontSize: '3.5rem',
                      marginBottom: '1rem',
                      fontWeight: 900,
                      color: '#ffffff',
                      textShadow: '3px 3px 6px rgba(0,0,0,0.7)'
                    }}>
                      {slide.title}
                    </h1>
                    <p 
                      className="hero-subtitle"
                      style={{
                        fontSize: '1.5rem',
                        marginBottom: '2rem',
                        color: '#ffffff',
                        fontWeight: 500,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                        animation: index === currentSlide && isVisible.hero ? 'slideInDown 0.8s ease-out 0.2s both' : 'none'
                      }}
                    >
                      {slide.subtitle}
                    </p>
                    <p style={{ 
                      marginTop: '1rem', 
                      fontSize: '1.1rem', 
                      color: '#f0f0f0',
                      textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                      animation: index === currentSlide && isVisible.hero ? 'slideInDown 0.8s ease-out 0.4s both' : 'none'
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
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: '#2c3e50',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 1)'
                e.target.style.transform = 'translateY(-50%) scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.9)'
                e.target.style.transform = 'translateY(-50%) scale(1)'
              }}
              aria-label="Önceki slide"
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              className="carousel-arrow carousel-arrow-right"
              style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: '#2c3e50',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 1)'
                e.target.style.transform = 'translateY(-50%) scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.9)'
                e.target.style.transform = 'translateY(-50%) scale(1)'
              }}
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
              {carouselImages.map((_, index) => (
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

        <section 
          ref={stepsRef}
          className={`how-it-works ${isVisible.steps ? 'fade-in-up' : ''}`}
          style={{
            opacity: isVisible.steps ? 1 : 0,
            transform: isVisible.steps ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
          }}
        >
          <div className="container">
            <h2 style={{
              animation: isVisible.steps ? 'slideInUp 0.8s ease-out' : 'none'
            }}>Nasıl Çalışır?</h2>
            <div className="steps">
              <div 
                className="step"
                style={{
                  animation: isVisible.steps ? 'fadeInLeft 0.6s ease-out 0.1s both' : 'none'
                }}
              >
                <div className="step-number" style={{
                  animation: isVisible.steps ? 'bounceIn 0.6s ease-out 0.3s both' : 'none'
                }}>1</div>
                <h3>Fotoğrafınızı Yükleyin</h3>
                <p>İstediğiniz boyutta fotoğrafınızı yükleyin</p>
              </div>
              <div 
                className="step"
                style={{
                  animation: isVisible.steps ? 'fadeInLeft 0.6s ease-out 0.2s both' : 'none'
                }}
              >
                <div className="step-number" style={{
                  animation: isVisible.steps ? 'bounceIn 0.6s ease-out 0.4s both' : 'none'
                }}>2</div>
                <h3>Boyut ve Adet Seçin</h3>
                <p>Standart veya özel boyut seçin, adet belirleyin</p>
              </div>
              <div 
                className="step"
                style={{
                  animation: isVisible.steps ? 'fadeInLeft 0.6s ease-out 0.3s both' : 'none'
                }}
              >
                <div className="step-number" style={{
                  animation: isVisible.steps ? 'bounceIn 0.6s ease-out 0.5s both' : 'none'
                }}>3</div>
                <h3>Bilgilerinizi Girin</h3>
                <p>İletişim ve adres bilgilerinizi tamamlayın</p>
              </div>
              <div 
                className="step"
                style={{
                  animation: isVisible.steps ? 'fadeInLeft 0.6s ease-out 0.4s both' : 'none'
                }}
              >
                <div className="step-number" style={{
                  animation: isVisible.steps ? 'bounceIn 0.6s ease-out 0.6s both' : 'none'
                }}>4</div>
                <h3>Baskı ve Teslimat</h3>
                <p>Otomatik baskı, çerçeveleme ve kargo</p>
              </div>
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
            <h2 style={{
              animation: isVisible.pricing ? 'slideInUp 0.8s ease-out' : 'none'
            }}>Ürünlerimiz</h2>
            <p style={{ 
              textAlign: 'center', 
              color: '#666', 
              marginBottom: '2rem',
              animation: isVisible.pricing ? 'slideInUp 0.8s ease-out 0.2s both' : 'none'
            }}>
              Ürün seçin, fotoğraflarınızı yükleyin ve sepete ekleyin
            </p>
            <div className="pricing-grid">
              {products.map((product, index) => (
                <div
                  key={product.size}
                  className={`pricing-card ${product.featured ? 'featured' : ''}`}
                  onClick={() => handleProductClick(product)}
                  style={{
                    animation: isVisible.pricing ? `fadeInUp 0.6s ease-out ${0.3 + index * 0.1}s both` : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div 
                    className="pricing-card-image"
                    style={{
                      backgroundImage: product.image ? `url(${product.image})` : 'linear-gradient(135deg, var(--bg-light) 0%, var(--bg-gray) 100%)',
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
                        📷
                      </div>
                    )}
                    {/* Overlay for better text readability */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: product.image ? 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)' : 'transparent',
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

