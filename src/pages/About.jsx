import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { usePageContent } from '../hooks/usePageContent'

function About() {
  const { pageTitle, content, loading, error } = usePageContent('about')

  return (
    <>
      <SEO
        title={pageTitle || 'Hakkımızda'}
        description="Fotoğraf Kutusu hakkında bilgi edinin. Profesyonel fotoğraf baskı ve çerçeveleme hizmetlerimiz."
        keywords="fotoğraf kutusu hakkında, fotoğraf baskı firması, çerçeveleme hizmeti"
        url="/about"
      />
      <Navbar />
      <main>
        <div className="page-header">
          <div className="container">
            <h1>{loading ? 'Yükleniyor…' : (pageTitle || 'Hakkımızda')}</h1>
          </div>
        </div>
        <section className="content-section">
          <div className="container">
            <div className="content-wrapper">
              {error && <p style={{ color: '#c33' }}>{error}</p>}
              {!loading && !error && content && (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default About
