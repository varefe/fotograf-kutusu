import { Link } from 'react-router-dom'
import { memo } from 'react'
import Icon from './Icon'

const Footer = memo(function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Hakkımızda */}
          <div className="footer-section">
            <h3>Hakkımızda</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.8', marginBottom: '1rem' }}>
              Yüksek kaliteli fotoğraf baskı ve çerçeveleme hizmeti sunuyoruz. Müşteri memnuniyeti bizim önceliğimizdir.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Instagram"
              >
                <Icon name="instagram" size={20} />
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div className="footer-section">
            <h3>Hızlı Linkler</h3>
            <ul className="footer-links">
              <li><Link to="/">Ana Sayfa</Link></li>
              <li><Link to="/product">Ürünler</Link></li>
              <li><Link to="/about">Hakkımızda</Link></li>
              <li><Link to="/contact">İletişim</Link></li>
              <li><Link to="/cart">Sepetim</Link></li>
            </ul>
          </div>

          {/* Müşteri Hizmetleri */}
          <div className="footer-section">
            <h3>Müşteri Hizmetleri</h3>
            <ul className="footer-links">
              <li><Link to="/delivery-returns">Teslimat ve İade</Link></li>
              <li><Link to="/privacy">Gizlilik Politikası</Link></li>
              <li><Link to="/distance-selling">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link to="/faq">Sık Sorulan Sorular</Link></li>
              <li><Link to="/contact">İletişim</Link></li>
            </ul>
          </div>

          {/* Güvenli Ödeme */}
          <div className="footer-section">
            <h3>Güvenli Ödeme</h3>
            <div className="payment-logos" style={{ marginBottom: '1.5rem' }}>
              <img 
                src="/logos/visa.png" 
                alt="Visa" 
                className="payment-logo"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <img 
                src="/logos/mastercard.png" 
                alt="MasterCard" 
                className="payment-logo"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <img 
                src="/logos/iyzico-ile-ode-horizontal.png" 
                alt="iyzico ile Öde" 
                className="payment-logo"
                style={{ height: '30px' }}
                loading="lazy"
              />
            </div>
            <div className="ssl-badge">
              <Icon name="lock" size={16} className="ssl-icon" />
              <span>SSL Sertifikası ile Güvenli Alışveriş</span>
            </div>
          </div>

          {/* İletişim */}
          <div className="footer-section">
            <h3>İletişim</h3>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="phone" size={16} />
                <span>0 (506) 708 76 84</span>
              </li>
              <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="mail" size={16} />
                <span>admin@fotografkutusu.com</span>
              </li>
              <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Icon name="pin" size={16} />
                <span>Ozan Sokak No 11<br />Altın Oran Fotoğrafçılık<br />Manisa Turgutlu</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p style={{ marginBottom: '1rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            &copy; 2026 Fotoğraf Kutusu. Tüm hakları saklıdır.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            <span>KVKK</span>
            <span>Çerez Politikası</span>
            <span>Kullanım Koşulları</span>
          </div>
        </div>
      </div>
    </footer>
  )
})

export default Footer
