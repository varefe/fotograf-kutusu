import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Contact() {
  return (
    <>
      <Navbar />
      <main>
        <div className="page-header">
          <div className="container">
            <h1>İletişim</h1>
            <p style={{ fontSize: '1.2rem', marginTop: '1rem', opacity: 0.95 }}>
              Sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçebilirsiniz
            </p>
          </div>
        </div>

        <section className="content-section">
          <div className="container">
            <div className="content-wrapper">
              <h2>Bize Ulaşın</h2>
              <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--text-light)' }}>
                Müşteri memnuniyeti bizim için önceliktir. Size en iyi hizmeti sunmak için buradayız.
              </p>

              <div className="contact-info">
                <div className="contact-item" style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                  border: '2px solid var(--primary-color)',
                  borderRadius: '12px'
                }}>
                  <h3 style={{ color: 'var(--primary-color)', fontSize: '1.5rem', marginBottom: '1rem' }}>
                    📧 E-posta
                  </h3>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-color)' }}>
                    <a href="mailto:admin@fotografkutusu.com" style={{
                      color: 'var(--primary-color)',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = 'var(--primary-gold)'
                      e.target.style.textDecoration = 'underline'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'var(--primary-color)'
                      e.target.style.textDecoration = 'none'
                    }}
                    >
                      admin@fotografkutusu.com
                    </a>
                  </p>
                  <p style={{ marginTop: '0.5rem', color: 'var(--text-light)', fontSize: '0.95rem' }}>
                    En kısa sürede size dönüş yapacağız
                  </p>
                </div>

                <div className="contact-item" style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                  border: '2px solid var(--primary-color)',
                  borderRadius: '12px'
                }}>
                  <h3 style={{ color: 'var(--primary-color)', fontSize: '1.5rem', marginBottom: '1rem' }}>
                    📞 Telefon
                  </h3>
                  <p style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                    <a href="tel:05067087684" style={{
                      color: 'var(--primary-color)',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = 'var(--primary-gold)'
                      e.target.style.textDecoration = 'underline'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'var(--primary-color)'
                      e.target.style.textDecoration = 'none'
                    }}
                    >
                      0 (506) 708 76 84
                    </a>
                  </p>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
                    Çalışma Saatleri: Pazartesi - Cuma, 09:00 - 18:00
                  </p>
                </div>

                <div className="contact-item" style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                  border: '2px solid var(--primary-color)',
                  borderRadius: '12px'
                }}>
                  <h3 style={{ color: 'var(--primary-color)', fontSize: '1.5rem', marginBottom: '1rem' }}>
                    📍 Adres
                  </h3>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-color)', lineHeight: '1.8' }}>
                    Altın Oran Fotoğrafçılık<br />
                    Ozan Sokak No 11<br />
                    Manisa Turgutlu
                  </p>
                </div>

                <div className="contact-item" style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                  border: '2px solid var(--primary-color)',
                  borderRadius: '12px'
                }}>
                  <h3 style={{ color: 'var(--primary-color)', fontSize: '1.5rem', marginBottom: '1rem' }}>
                    ⏰ Çalışma Saatleri
                  </h3>
                  <p style={{ fontSize: '1rem', color: 'var(--text-color)', lineHeight: '2', fontWeight: '500' }}>
                    <strong>Pazartesi - Cuma:</strong> 09:00 - 18:00<br />
                    <strong>Cumartesi:</strong> 10:00 - 16:00<br />
                    <strong>Pazar:</strong> Kapalı
                  </p>
                </div>
              </div>

              <div style={{ 
                marginTop: '3rem', 
                padding: '2rem', 
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                borderRadius: '12px',
                border: '2px solid var(--primary-color)'
              }}>
                <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Sosyal Medya</h2>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>
                  Bizi sosyal medyada takip edin, kampanyalarımızdan ve yeniliklerimizden haberdar olun.
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--primary-color)',
                    color: '#000000',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--primary-gold)'
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'var(--primary-color)'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 2px 8px rgba(212, 175, 55, 0.3)'
                  }}
                  >
                    <span>📷</span> Instagram
                  </a>
                </div>
              </div>

              <h2 style={{ marginTop: '3rem' }}>Sık Sorulan Sorular</h2>
              
              <div className="faq-item" style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1rem',
                background: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
                  Siparişim ne zaman hazır olur?
                </h3>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8' }}>
                  Siparişleriniz onaylandıktan sonra 3-5 iş günü içinde hazırlanır ve kargoya verilir.
                </p>
              </div>

              <div className="faq-item" style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1rem',
                background: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
                  Hangi ödeme yöntemlerini kabul ediyorsunuz?
                </h3>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8' }}>
                  Visa ve MasterCard kredi kartları ile güvenli ödeme yapabilirsiniz. Ödemelerimiz 
                  iyzico güvenli ödeme sistemi üzerinden işlenmektedir.
                </p>
              </div>

              <div className="faq-item" style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1rem',
                background: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
                  Kargo ücreti ne kadar?
                </h3>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8' }}>
                  Standart kargo 15 TL, Express kargo 35 TL'dir. 99 TL üzeri siparişlerde kargo ücretsizdir.
                </p>
              </div>

              <div className="faq-item" style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1rem',
                background: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
                  İade yapabilir miyim?
                </h3>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8' }}>
                  Evet, 14 gün içinde cayma hakkınızı kullanabilirsiniz. Detaylı bilgi için{' '}
                  <a href="/delivery-returns" style={{
                    color: 'var(--primary-color)', 
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.textDecoration = 'underline'
                    e.target.style.color = 'var(--primary-gold)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.textDecoration = 'none'
                    e.target.style.color = 'var(--primary-color)'
                  }}
                  >
                    Teslimat ve İade Şartları
                  </a> sayfasını inceleyebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Contact
