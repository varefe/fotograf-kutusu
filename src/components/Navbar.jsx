import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-brand">
          <Link to="/">
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              className="logo"
            />
            <span>Fotoğraf Baskı</span>
          </Link>
        </div>
        <div className="nav-links">
          <Link to="/">Ana Sayfa</Link>
          <Link to="/order">Sipariş Ver</Link>
          <Link to="/about">Hakkımızda</Link>
          <Link to="/contact">İletişim</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

