import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import SEO from '../components/SEO'
import { API_URL } from '../config/api'

function CategoryPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const apiBase = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
  const baseUrl = API_URL.replace(/\/api\/?$/, '')

  const [category, setCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setNotFound(false)
    Promise.all([
      fetch(`${apiBase}/categories`).then(r => r.json()),
      fetch(`${apiBase}/products`).then(r => r.json())
    ])
      .then(([catData, prodData]) => {
        const list = catData.success && catData.categories ? catData.categories : []
        setCategories(list)
        const slugLower = slug.toLowerCase()
        const found = list.find(
          c => (c.slug && c.slug.toLowerCase() === slugLower) ||
            (c.name && c.name.toLowerCase().replace(/\s+/g, '-') === slugLower)
        )
        if (!found) {
          setCategory(null)
          setNotFound(true)
          setProducts([])
          setLoading(false)
          return
        }
        setCategory(found)
        const allProducts = prodData.success && prodData.products ? prodData.products : []
        const categoryName = found.name || ''
        const filtered = categoryName
          ? allProducts.filter(p => (p.category || '').trim() === categoryName.trim())
          : []
        setProducts(filtered)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        setNotFound(true)
      })
  }, [slug, apiBase])

  const productImageUrl = (img) => {
    if (!img) return ''
    if (img.startsWith('http') || img.startsWith('data:')) return img
    const path = img.startsWith('/') ? img : `/${img}`
    if (path.startsWith('/assets') || path.startsWith('/src/')) return `${window.location.origin}${path}`
    return `${baseUrl}${path}`
  }

  const handleProductClick = (product) => {
    navigate('/product', { state: { product } })
  }

  if (loading) {
    return (
      <>
        <SEO title="Kategori - Fotoğraf Kutusu" description="Ürün kategorisi" />
        <Navbar />
        <main className="main-content" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="container">
            <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Yükleniyor...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (notFound || !category) {
    return (
      <>
        <SEO title="Kategori bulunamadı - Fotoğraf Kutusu" description="Kategori bulunamadı" />
        <Navbar />
        <main className="main-content" style={{ padding: '3rem 0' }}>
          <div className="container">
            <h1 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Kategori bulunamadı</h1>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>
              Aradığınız kategori mevcut değil veya kaldırılmış olabilir.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--text-color)' }}>Tüm kategoriler</h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {categories.map(c => {
                  const s = (c.slug || (c.name || '').toLowerCase().replace(/\s+/g, '-'))
                  return s ? (
                    <li key={c._id || c.name} style={{ marginRight: '1rem' }}>
                      <Link to={`/kategori/${s}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                        {c.name}
                      </Link>
                    </li>
                  ) : null
                })}
              </ul>
            </div>
            <Link to="/" className="btn btn-primary">Ana sayfaya dön</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const categoryName = category.name || 'Ürünler'

  return (
    <>
      <SEO
        title={`${categoryName} - Fotoğraf Kutusu`}
        description={`${categoryName} kategorisindeki fotoğraf baskı ve çerçeve ürünleri.`}
      />
      <Navbar />
      <main className="main-content" style={{ padding: '2rem 0 4rem' }}>
        <div className="container">
          <nav style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
            <Link to="/" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Ana sayfa</Link>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <span>{categoryName}</span>
          </nav>
          <h1 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>{categoryName}</h1>
          <p style={{ marginBottom: '2rem', color: 'var(--text-light)' }}>
            Bu kategorideki ürünler. Ürün kartına tıklayarak fotoğraf yükleyebilirsiniz.
          </p>

          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-light)', borderRadius: '12px', color: 'var(--text-light)' }}>
              <Icon name="image" size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ marginBottom: '1rem' }}>Bu kategoride henüz ürün bulunmuyor.</p>
              <Link to="/" className="btn btn-primary">Tüm ürünlere git</Link>
            </div>
          ) : (
            <div className="pricing-grid">
              {products.map((product) => (
                <div
                  key={product.id || product.size}
                  className={`pricing-card ${product.featured ? 'featured' : ''}`}
                  onClick={() => handleProductClick(product)}
                  style={{ cursor: 'pointer' }}
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
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: product.image ? 'rgba(2, 6, 23, 0.15)' : 'transparent',
                      pointerEvents: 'none'
                    }} />
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
                      {(product.features || []).map((feature, i) => (
                        <li key={i} style={{ padding: '0.25rem 0', fontSize: '0.875rem', color: '#555' }}>✓ {feature}</li>
                      ))}
                    </ul>
                    <button type="button" className="btn btn-primary btn-block">Fotoğraf Yükle</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--text-color)' }}>Diğer kategoriler</h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {categories.filter(c => (c.slug || (c.name || '').toLowerCase().replace(/\s+/g, '-')) !== slug).map(c => {
                const s = c.slug || (c.name || '').toLowerCase().replace(/\s+/g, '-')
                return s ? (
                  <li key={c._id || c.name}>
                    <Link to={`/kategori/${s}`} style={{ color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                      {c.name}
                    </Link>
                  </li>
                ) : null
              })}
              {categories.length === 0 && (
                <li><Link to="/" style={{ color: 'var(--primary-color)' }}>Ana sayfa ürünleri</Link></li>
              )}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default CategoryPage
