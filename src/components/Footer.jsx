import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Hızlı Linkler</h3>
            <ul className="footer-links">
              <li><Link to="/">Ana Sayfa</Link></li>
              <li><Link to="/order">Sipariş Ver</Link></li>
              <li><Link to="/about">Hakkımızda</Link></li>
              <li><Link to="/contact">İletişim</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Yasal</h3>
            <ul className="footer-links">
              <li><Link to="/privacy">Gizlilik Politikası</Link></li>
              <li><Link to="/distance-selling">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link to="/delivery-returns">Teslimat ve İade</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Güvenli Ödeme</h3>
            <div className="payment-logos">
              <img 
                src="/logos/visa.png" 
                alt="Visa" 
                className="payment-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <img 
                src="/logos/mastercard.png" 
                alt="MasterCard" 
                className="payment-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <img 
                src="/logos/iyzico-ile-ode-horizontal.png" 
                alt="iyzico ile Öde" 
                className="payment-logo"
                style={{ height: '30px' }}
              />
            </div>
            <div className="ssl-badge">
              <span className="ssl-icon">🔒</span>
              <span>SSL Sertifikası ile Güvenli Alışveriş</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Fotoğraf Baskı Hizmeti. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

