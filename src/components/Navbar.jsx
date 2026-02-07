import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Icon from './Icon'

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
            <Link to="/gallery">Galeri</Link>
            <Link to="/contact">İletişim</Link>
            <Link to="/reviews">Yorumlar</Link>
            <Link to="/faq">SSS</Link>
            <Link to="/delivery-returns">Teslimat ve İade</Link>
          </div>
          <div style={{ fontSize: '0.875rem' }}>
            <Icon name="phone" size={14} /> Destek: <strong>0 (506) 708 76 84</strong>
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
                alt="Fotoğraf Kutusu" 
                className="logo"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </Link>
          </div>

          <div className="nav-links">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin-panel" 
                    className="btn btn-primary btn-small"
                    style={{ marginRight: '1rem' }}
                  >
                    <Icon name="shield" size={14} /> Admin Panel
                  </Link>
                )}
                <Link to="/profile" className="nav-user">
                  <Icon name="user" size={16} />
                  <span>{user?.firstName || 'Profil'}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">Giriş Yap</Link>
                <Link to="/register" className="btn btn-primary btn-small">
                  Kayıt Ol
                </Link>
              </>
            )}
            
            <Link to="/cart" className="nav-cart">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="cart" size={16} /> Sepet
              </span>
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
