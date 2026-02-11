import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { usePageContent } from '../hooks/usePageContent'

function FAQ() {
  const { pageTitle, content, loading, error } = usePageContent('faq')

  return (
    <>
      <SEO
        title={pageTitle || 'Sık Sorulan Sorular'}
        description="Fotoğraf Kutusu sipariş, ödeme ve teslimat hakkında sık sorulan sorular."
        keywords="SSS, sipariş, teslimat, iade, fotoğraf baskı"
        url="/faq"
      />
      <Navbar />
      <main>
        <div className="page-header">
          <div className="container">
            <h1>{loading ? 'Yükleniyor…' : (pageTitle || 'Sık Sorulan Sorular')}</h1>
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

export default FAQ
