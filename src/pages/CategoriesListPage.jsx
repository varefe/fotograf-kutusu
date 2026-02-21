import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import SEO from '../components/SEO'
import { API_URL } from '../config/api'

function CategoriesListPage() {
  const apiBase = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${apiBase}/categories`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.categories) setCategories(data.categories)
        else setCategories([])
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [apiBase])

  return (
    <>
      <SEO
        title="Ürün Kategorileri - Fotoğraf Kutusu"
        description="Fotoğraf baskı ve çerçeve ürün kategorileri. İhtiyacınıza uygun kategoriyi seçin."
      />
      <Navbar />
      <main className="main-content" style={{ padding: '2rem 0 4rem' }}>
        <div className="container">
          <nav style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
            <Link to="/" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Ana sayfa</Link>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <span>Kategoriler</span>
          </nav>
          <h1 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>Ürün kategorileri</h1>
          <p style={{ marginBottom: '2rem', color: 'var(--text-light)' }}>
            Aşağıdaki kategorilerden birini seçerek o kategorideki ürünlere ulaşabilirsiniz.
          </p>

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Yükleniyor...</p>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-light)', borderRadius: '12px', color: 'var(--text-light)' }}>
              <Icon name="image" size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ marginBottom: '1rem' }}>Henüz kategori eklenmemiş.</p>
              <Link to="/" className="btn btn-primary">Ana sayfaya dön</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {categories.map(c => {
                const slug = c.slug || (c.name || '').toLowerCase().replace(/\s+/g, '-')
                if (!slug) return null
                return (
                  <Link
                    key={c._id || c.name}
                    to={`/kategori/${slug}`}
                    style={{
                      display: 'block',
                      padding: '1.5rem',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: 'var(--text-color)',
                      transition: 'box-shadow 0.2s, border-color 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                      e.currentTarget.style.borderColor = 'var(--primary-color)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.borderColor = 'var(--border-color)'
                    }}
                  >
                    <Icon name="image" size={32} style={{ color: 'var(--primary-color)', marginBottom: '0.75rem' }} />
                    <div style={{ fontWeight: '600', fontSize: '1.05rem' }}>{c.name}</div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default CategoriesListPage
