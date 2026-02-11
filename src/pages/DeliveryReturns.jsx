import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { usePageContent } from '../hooks/usePageContent'

function DeliveryReturns() {
  const { pageTitle, content, loading, error } = usePageContent('delivery-returns')

  return (
    <>
      <Navbar />
      <main>
        <div className="page-header">
          <div className="container">
            <h1>{loading ? 'Yükleniyor…' : (pageTitle || 'Teslimat ve İade Şartları')}</h1>
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

export default DeliveryReturns
