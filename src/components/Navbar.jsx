import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { getCartCount } = useCart()
  const { user, isAuthenticated, isAdmin } = useAuth()
  const cartCount = getCartCount()

  return (
    <nav className="navbar">
      {/* Üst Bar */}
      <div className="navbar-top">
        <div className="container">
          <div className="navbar-top-links">
            <Link to="/about">Hakkımızda</Link>
            <Link to="/contact">İletişim</Link>
            <Link to="/delivery-returns">Teslimat ve İade</Link>
          </div>
          <div style={{ fontSize: '0.875rem' }}>
            📞 Destek: <strong>0506 708 76 48</strong>
          </div>
        </div>
      </div>

      {/* Ana Navbar */}
      <div className="navbar-main">
        <div className="container">
          <div className="nav-brand">
            <Link to="/">
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                className="logo"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <span>Fotoğraf Baskı</span>
            </Link>
          </div>

          <div className="nav-links">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin-panel" 
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--primary-color)',
                      color: '#000000',
                      borderRadius: '8px',
                      fontWeight: '700',
                      textDecoration: 'none',
                      marginRight: '1rem',
                      boxShadow: '0 2px 8px var(--primary-shadow)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--primary-gold)'
                      e.target.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'var(--primary-color)'
                      e.target.style.transform = 'translateY(0)'
                    }}
                  >
                    🛡️ Admin Panel
                  </Link>
                )}
                <Link to="/profile" className="nav-user">
                  <span>👤</span>
                  <span>{user?.firstName || 'Profil'}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">Giriş Yap</Link>
                <Link to="/register" style={{ 
                  background: 'var(--primary-color)', 
                  color: '#000000', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '8px',
                  fontWeight: '700',
                  boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
                }}>
                  Kayıt Ol
                </Link>
              </>
            )}
            
            <Link to="/cart" className="nav-cart">
              <span>🛒 Sepet</span>
              {cartCount > 0 && (
                <span className="nav-cart-badge">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
