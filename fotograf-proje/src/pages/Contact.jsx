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
          </div>
        </div>

        <section className="content-section">
          <div className="container">
            <div className="content-wrapper">
              <h2>Bize Ulaşın</h2>
              <p>
                Sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçebilirsiniz. 
                Müşteri memnuniyeti bizim için önceliktir.
              </p>

              <div className="contact-info">
                <div className="contact-item">
                  <h3>📧 E-posta</h3>
                  <p>info@fotografbaski.com</p>
                  <p>destek@fotografbaski.com</p>
                </div>

                <div className="contact-item">
                  <h3>📞 Telefon</h3>
                  <p>0850 XXX XX XX</p>
                  <p>Çalışma Saatleri: Pazartesi - Cuma, 09:00 - 18:00</p>
                </div>

                <div className="contact-item">
                  <h3>📍 Adres</h3>
                  <p>
                    Fotoğraf Baskı Hizmeti<br />
                    İstanbul, Türkiye
                  </p>
                </div>

                <div className="contact-item">
                  <h3>⏰ Çalışma Saatleri</h3>
                  <p>
                    Pazartesi - Cuma: 09:00 - 18:00<br />
                    Cumartesi: 10:00 - 16:00<br />
                    Pazar: Kapalı
                  </p>
                </div>
              </div>

              <h2>Sık Sorulan Sorular</h2>
              
              <div className="faq-item">
                <h3>Siparişim ne zaman hazır olur?</h3>
                <p>
                  Siparişleriniz onaylandıktan sonra 3-5 iş günü içinde hazırlanır ve kargoya verilir.
                </p>
              </div>

              <div className="faq-item">
                <h3>Hangi ödeme yöntemlerini kabul ediyorsunuz?</h3>
                <p>
                  Visa ve MasterCard kredi kartları ile güvenli ödeme yapabilirsiniz. Ödemelerimiz 
                  iyzico güvenli ödeme sistemi üzerinden işlenmektedir.
                </p>
              </div>

              <div className="faq-item">
                <h3>Kargo ücreti ne kadar?</h3>
                <p>
                  Kargo ücreti sipariş tutarına göre belirlenmektedir. Belirli tutarın üzerindeki 
                  siparişlerde kargo ücretsizdir.
                </p>
              </div>

              <div className="faq-item">
                <h3>İade yapabilir miyim?</h3>
                <p>
                  Evet, 14 gün içinde cayma hakkınızı kullanabilirsiniz. Detaylı bilgi için 
                  <a href="/delivery-returns" style={{color: 'var(--primary-color)', textDecoration: 'underline'}}> Teslimat ve İade Şartları</a> sayfasını inceleyebilirsiniz.
                </p>
              </div>

              <h2>Mesaj Gönderin</h2>
              <p>
                Aşağıdaki formu kullanarak bize mesaj gönderebilirsiniz. En kısa sürede size dönüş yapacağız.
              </p>
              
              <div className="contact-form-note">
                <p>
                  <strong>Not:</strong> Mesaj formu yakında aktif olacaktır. Şu an için lütfen 
                  e-posta veya telefon yoluyla bizimle iletişime geçiniz.
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






