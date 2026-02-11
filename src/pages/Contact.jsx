import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { usePageContent } from '../hooks/usePageContent'

function Contact() {
  const { pageTitle, content, loading, error } = usePageContent('contact')

  return (
    <>
      <SEO
        title={pageTitle || 'İletişim'}
        description="Fotoğraf Kutusu ile iletişime geçin. Sorularınız ve destek talepleriniz için bize ulaşın."
        keywords="fotoğraf kutusu iletişim, fotoğraf baskı destek, müşteri hizmetleri"
        url="/contact"
      />
      <Navbar />
      <main>
        <div className="page-header">
          <div className="container">
            <h1>{loading ? 'Yükleniyor…' : (pageTitle || 'İletişim')}</h1>
          </div>
        </div>
        <section className="content-section">
          <div className="container">
            <div className="content-wrapper">
              {error && <p style={{ color: '#c33' }}>{error}</p>}
              {!loading && !error && content && (
                <div className="content-wrapper" dangerouslySetInnerHTML={{ __html: content }} />
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Contact
