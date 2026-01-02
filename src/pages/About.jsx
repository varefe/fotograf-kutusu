import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function About() {
  return (
    <>
      <Navbar />
      <main>
        <div className="page-header">
          <div className="container">
            <h1>Hakkımızda</h1>
          </div>
        </div>

        <section className="content-section">
          <div className="container">
            <div className="content-wrapper">
              <h2>Biz Kimiz?</h2>
              <p>
                Fotoğraf baskı ve çerçeveleme hizmeti sunan firmamız, yıllardır müşterilerimize 
                yüksek kaliteli baskı hizmeti sağlamaktadır. Anılarınızı ölümsüzleştirmek ve 
                evinize, ofisinize değer katmak için buradayız.
              </p>

              <h2>Misyonumuz</h2>
              <p>
                Müşterilerimizin en değerli anılarını en yüksek kalitede baskıya dönüştürmek 
                ve profesyonel çerçeveleme hizmetiyle sunmak. Her siparişte müşteri memnuniyetini 
                ön planda tutarak, güvenilir ve hızlı teslimat sağlamak.
              </p>

              <h2>Vizyonumuz</h2>
              <p>
                Türkiye'nin en güvenilir ve kaliteli fotoğraf baskı hizmeti sağlayıcısı olmak. 
                Teknolojik yenilikleri takip ederek, müşterilerimize en iyi deneyimi sunmak.
              </p>

              <h2>Neden Bizi Seçmelisiniz?</h2>
              <ul className="feature-list">
                <li>Yüksek kaliteli baskı teknolojisi</li>
                <li>Profesyonel çerçeveleme hizmeti</li>
                <li>Hızlı ve güvenli teslimat</li>
                <li>Uygun fiyat garantisi</li>
                <li>Müşteri odaklı hizmet anlayışı</li>
                <li>Güvenli ödeme sistemi (iyzico)</li>
              </ul>

              <h2>İletişim</h2>
              <p>
                Sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçebilirsiniz.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default About







