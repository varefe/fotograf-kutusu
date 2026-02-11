import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { usePageContent } from '../hooks/usePageContent'

function Privacy() {
  const { pageTitle, content, loading, error } = usePageContent('privacy')

  return (
    <>
      <Navbar />
      <main>
        <div className="page-header">
          <div className="container">
            <h1>{loading ? 'Yükleniyor…' : (pageTitle || 'Gizlilik Sözleşmesi')}</h1>
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

export default Privacy
