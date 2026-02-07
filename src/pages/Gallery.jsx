import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import Icon from '../components/Icon'
import { API_URL } from '../config/api'

function Gallery() {
  const [galleries, setGalleries] = useState([])
  const [categoryCounts, setCategoryCounts] = useState({})
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showFeatured, setShowFeatured] = useState(false)

  const categories = [
    { value: 'all', label: 'Tümü' },
    { value: '10x15', label: '10x15 cm' },
    { value: '15x20', label: '15x20 cm' },
    { value: '20x30', label: '20x30 cm' },
    { value: '30x40', label: '30x40 cm' },
    { value: '30x45', label: '30x45 cm' },
    { value: '40x50', label: '40x50 cm' },
    { value: '50x70', label: '50x70 cm' },
    { value: '70x100', label: '70x100 cm' },
    { value: 'custom', label: 'Özel Boyut' }
  ]

  useEffect(() => {
    loadGalleries()
  }, [selectedCategory, showFeatured])

  const loadGalleries = async () => {
    try {
      setLoading(true)
      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      const params = new URLSearchParams({
        category: selectedCategory,
        ...(showFeatured && { featured: 'true' })
      })
      
      const response = await fetch(`${apiUrl}/gallery?${params}`)
      const data = await response.json()

      if (data.success) {
        setGalleries(data.galleries || [])
        setCategoryCounts(data.categoryCounts || {})
      }
    } catch (error) {
      console.error('Galeri yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const openLightbox = (gallery) => {
    setSelectedImage(gallery)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    document.body.style.overflow = 'auto'
  }

  const navigateImage = (direction) => {
    if (!selectedImage || galleries.length === 0) return
    
    const currentIndex = galleries.findIndex(g => g._id === selectedImage._id)
    if (currentIndex === -1) return
    
    let newIndex
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % galleries.length
    } else {
      newIndex = currentIndex - 1
      if (newIndex < 0) newIndex = galleries.length - 1
    }
    
    setSelectedImage(galleries[newIndex])
  }

  useEffect(() => {
    if (!selectedImage) return
    
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        closeLightbox()
      } else if (e.key === 'ArrowRight') {
        const currentIndex = galleries.findIndex(g => g._id === selectedImage._id)
        if (currentIndex !== -1) {
          const newIndex = (currentIndex + 1) % galleries.length
          setSelectedImage(galleries[newIndex])
        }
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = galleries.findIndex(g => g._id === selectedImage._id)
        if (currentIndex !== -1) {
          let newIndex = currentIndex - 1
          if (newIndex < 0) newIndex = galleries.length - 1
          setSelectedImage(galleries[newIndex])
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedImage, galleries])

  return (
    <>
      <SEO 
        title="Ürün Galerisi"
        description="Fotoğraf Kutusu ürün galerisi. Farklı boyutlarda fotoğraf baskı örnekleri ve müşteri çalışmaları."
        keywords="fotoğraf kutusu galeri, fotoğraf baskı örnekleri, müşteri çalışmaları, fotoğraf boyutları"
        url="/gallery"
      />
      <Navbar />
      <main>
        <div className="page-header">
          <div className="container">
            <h1>Ürün Galerisi</h1>
            <p style={{ fontSize: '1.2rem', marginTop: '1rem', opacity: 0.95 }}>
              Farklı boyutlarda fotoğraf baskı örnekleri ve müşteri çalışmaları
            </p>
          </div>
        </div>

        <section className="content-section" style={{ padding: '3rem 0' }}>
          <div className="container">
            {/* Filtreler */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon name="filter" size={18} />
                  Kategori:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    minWidth: '150px'
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label} {categoryCounts[cat.value] ? `(${categoryCounts[cat.value]})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showFeatured}
                  onChange={(e) => setShowFeatured(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>Öne Çıkanlar</span>
              </label>
            </div>

            {/* Galeri Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Galeri yükleniyor...</p>
              </div>
            ) : galleries.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <Icon name="image" size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
                <p style={{ color: '#666', fontSize: '1.1rem' }}>
                  Bu kategoride henüz görsel bulunmamaktadır.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                {galleries.map((gallery) => (
                  <div
                    key={gallery._id}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    onClick={() => openLightbox(gallery)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {gallery.isFeatured && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#fbbf24',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        zIndex: 1
                      }}>
                        ⭐ Öne Çıkan
                      </div>
                    )}
                    <div style={{
                      width: '100%',
                      height: '250px',
                      overflow: 'hidden',
                      background: '#f3f4f6'
                    }}>
                      {gallery.image?.base64 && (
                        <img
                          src={`data:${gallery.image.mimetype || 'image/jpeg'};base64,${gallery.image.base64}`}
                          alt={gallery.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
                          }}
                        />
                      )}
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h3 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: '#2c3e50'
                      }}>
                        {gallery.title}
                      </h3>
                      {gallery.description && (
                        <p style={{
                          margin: '0 0 0.5rem 0',
                          fontSize: '0.9rem',
                          color: '#666',
                          lineHeight: '1.5',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {gallery.description}
                        </p>
                      )}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.85rem',
                        color: '#666'
                      }}>
                        <span>
                          <Icon name="ruler" size={14} style={{ marginRight: '0.25rem' }} />
                          {gallery.size === 'custom' && gallery.customSize
                            ? `${gallery.customSize.width}x${gallery.customSize.height} cm`
                            : gallery.size}
                        </span>
                        {gallery.viewCount > 0 && (
                          <span>
                            <Icon name="eye" size={14} style={{ marginRight: '0.25rem' }} />
                            {gallery.viewCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={closeLightbox}
        >
          <div
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              style={{
                position: 'absolute',
                top: '-50px',
                right: 0,
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '1.5rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                zIndex: 10001
              }}
            >
              ×
            </button>

            {/* Navigation Buttons */}
            {galleries.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const currentIndex = galleries.findIndex(g => g._id === selectedImage._id)
                    let newIndex = currentIndex - 1
                    if (newIndex < 0) newIndex = galleries.length - 1
                    setSelectedImage(galleries[newIndex])
                  }}
                  style={{
                    position: 'absolute',
                    left: '-60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    zIndex: 10001
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const currentIndex = galleries.findIndex(g => g._id === selectedImage._id)
                    const newIndex = (currentIndex + 1) % galleries.length
                    setSelectedImage(galleries[newIndex])
                  }}
                  style={{
                    position: 'absolute',
                    right: '-60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    zIndex: 10001
                  }}
                >
                  ›
                </button>
              </>
            )}

            {/* Image */}
            {selectedImage.image?.base64 && (
              <img
                src={`data:${selectedImage.image.mimetype || 'image/jpeg'};base64,${selectedImage.image.base64}`}
                alt={selectedImage.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                }}
              />
            )}

            {/* Image Info */}
            <div style={{
              position: 'absolute',
              bottom: '-80px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '1rem 2rem',
              borderRadius: '8px',
              color: 'white',
              textAlign: 'center',
              minWidth: '300px'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>
                {selectedImage.title}
              </h3>
              {selectedImage.description && (
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>
                  {selectedImage.description}
                </p>
              )}
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                <Icon name="ruler" size={14} style={{ marginRight: '0.25rem' }} />
                {selectedImage.size === 'custom' && selectedImage.customSize
                  ? `${selectedImage.customSize.width}x${selectedImage.customSize.height} cm`
                  : selectedImage.size}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Gallery
