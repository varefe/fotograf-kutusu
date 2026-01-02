import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Home() {
  return (
    <>
      <Navbar />
      <main>
        <div className="hero">
          <div className="container">
            <h1>Fotoğrafınızı Baskıya Dönüştürün</h1>
            <p className="hero-subtitle">Yüksek kaliteli baskı ve profesyonel çerçeveleme hizmeti</p>
            <Link to="/order" className="btn btn-primary">Sipariş Ver</Link>
          </div>
        </div>

        <section className="how-it-works">
          <div className="container">
            <h2>Nasıl Çalışır?</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Fotoğrafınızı Yükleyin</h3>
                <p>İstediğiniz boyutta fotoğrafınızı yükleyin</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Boyut ve Adet Seçin</h3>
                <p>Standart veya özel boyut seçin, adet belirleyin</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Bilgilerinizi Girin</h3>
                <p>İletişim ve adres bilgilerinizi tamamlayın</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <h3>Baskı ve Teslimat</h3>
                <p>Otomatik baskı, çerçeveleme ve kargo</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pricing">
          <div className="container">
            <h2>Boyut ve Fiyat Listesi</h2>
            <div className="pricing-grid">
              <div className="pricing-card">
                <h3>10x15 cm</h3>
                <div className="price">₺15</div>
                <p>Küçük boyut</p>
                <ul>
                  <li>Yüksek kalite baskı</li>
                  <li>Çerçeve dahil</li>
                </ul>
              </div>
              <div className="pricing-card">
                <h3>15x20 cm</h3>
                <div className="price">₺18</div>
                <p>Orta boyut</p>
                <ul>
                  <li>Yüksek kalite baskı</li>
                  <li>Çerçeve dahil</li>
                </ul>
              </div>
              <div className="pricing-card featured">
                <h3>20x30 cm</h3>
                <div className="price">₺25</div>
                <p>Popüler boyut</p>
                <ul>
                  <li>Yüksek kalite baskı</li>
                  <li>Çerçeve dahil</li>
                </ul>
              </div>
              <div className="pricing-card">
                <h3>30x40 cm</h3>
                <div className="price">₺35</div>
                <p>Büyük boyut</p>
                <ul>
                  <li>Yüksek kalite baskı</li>
                  <li>Çerçeve dahil</li>
                </ul>
              </div>
              <div className="pricing-card">
                <h3>Özel Boyut</h3>
                <div className="price">Özel</div>
                <p>İstediğiniz boyut</p>
                <ul>
                  <li>Yüksek kalite baskı</li>
                  <li>Çerçeve dahil</li>
                </ul>
              </div>
            </div>
            <p className="pricing-note">* Fiyatlar çerçeve dahildir. Adet arttıkça fiyat çarpılır.</p>
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

