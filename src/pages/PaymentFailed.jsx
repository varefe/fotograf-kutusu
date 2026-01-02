import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function PaymentFailed() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <>
      <Navbar />
      <main style={{ padding: '4rem 0', minHeight: '60vh' }}>
        <div className="container">
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center',
            background: 'white',
            padding: '3rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem'
            }}>❌</div>
            <h1 style={{
              color: '#e74c3c',
              marginBottom: '1rem'
            }}>Ödeme Başarısız</h1>
            <p style={{
              color: '#666',
              marginBottom: '2rem',
              fontSize: '1.1rem'
            }}>
              Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin veya farklı bir ödeme yöntemi kullanın.
            </p>
            {token && (
              <p style={{
                color: '#999',
                fontSize: '0.9rem',
                marginBottom: '2rem'
              }}>
                İşlem No: {token.substring(0, 20)}...
              </p>
            )}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link
                to="/order"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 2rem',
                  background: '#e74c3c',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  transition: 'background 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#c0392b'}
                onMouseLeave={(e) => e.target.style.background = '#e74c3c'}
              >
                Tekrar Dene
              </Link>
              <Link
                to="/"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 2rem',
                  background: '#95a5a6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  transition: 'background 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#7f8c8d'}
                onMouseLeave={(e) => e.target.style.background = '#95a5a6'}
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default PaymentFailed




















