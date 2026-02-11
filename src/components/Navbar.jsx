import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Icon from './Icon'
import logo from '../assets/logo.jpg'

function Navbar() {
  const { getCartCount } = useCart()
  const { user, isAuthenticated, isAdmin } = useAuth()
  const cartCount = getCartCount()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const topLinks = (
    <>
      <Link to="/about" onClick={closeMenu}>Hakkımızda</Link>
      <Link to="/contact" onClick={closeMenu}>İletişim</Link>
      <Link to="/reviews" onClick={closeMenu}>Yorumlar</Link>
      <Link to="/faq" onClick={closeMenu}>SSS</Link>
      <Link to="/delivery-returns" onClick={closeMenu}>Teslimat ve İade</Link>
    </>
  )

  const mainLinks = (
    <>
      {isAuthenticated ? (
        <>
          {isAdmin && (
            <Link to="/admin-panel" className="btn btn-primary btn-small" onClick={closeMenu}>
              <Icon name="shield" size={14} /> Admin Panel
            </Link>
          )}
          <Link to="/profile" className="nav-user" onClick={closeMenu}>
            <Icon name="user" size={16} />
            <span>{user?.firstName || 'Profil'}</span>
          </Link>
        </>
      ) : (
        <>
          <Link to="/login" onClick={closeMenu}>Giriş Yap</Link>
          <Link to="/register" className="btn btn-primary btn-small" onClick={closeMenu}>
            Kayıt Ol
          </Link>
        </>
      )}
      <Link to="/cart" className="nav-cart" onClick={closeMenu}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="cart" size={16} /> Sepet
        </span>
        {cartCount > 0 && (
          <span className="nav-cart-badge">{cartCount}</span>
        )}
      </Link>
    </>
  )

  return (
    <nav className="navbar">
      {/* Üst Bar - masaüstünde görünür */}
      <div className="navbar-top">
        <div className="container">
          <div className="navbar-top-links">
            {topLinks}
          </div>
          <div className="navbar-top-phone">
            <Icon name="phone" size={14} /> Destek: <strong>0 (506) 708 76 84</strong>
          </div>
        </div>
      </div>

      {/* Ana Navbar */}
      <div className="navbar-main">
        <div className="container">
          <div className="nav-brand">
            <Link to="/" onClick={closeMenu}>
              <img 
                src={logo} 
                alt="Fotoğraf Kutusu" 
                className="logo"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </Link>
          </div>

          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <Icon name="close" size={24} /> : <Icon name="menu" size={24} />}
          </button>

          <div className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
            {mainLinks}
          </div>
        </div>
      </div>

      {/* Mobil menü overlay - üst bar linkleri + ana linkler */}
      <div className={`navbar-mobile-menu ${menuOpen ? 'navbar-mobile-menu--open' : ''}`} aria-hidden={!menuOpen}>
        <div className="navbar-mobile-menu-inner">
          <div className="navbar-mobile-top-links">
            {topLinks}
          </div>
          <div className="navbar-mobile-main-links">
            {mainLinks}
          </div>
        </div>
      </div>
      {menuOpen && (
        <button
          type="button"
          className="navbar-mobile-backdrop"
          onClick={closeMenu}
          aria-label="Menüyü kapat"
        />
      )}
    </nav>
  )
}

export default Navbar
