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
            }}>
              {reason === 'cancelled' ? 'Ödeme İptal Edildi' : 'Ödeme Başarısız'}
            </h1>
            <p style={{
              color: '#666',
              marginBottom: '2rem',
              fontSize: '1.1rem',
              lineHeight: '1.6'
            }}>
              {getMessage()}
            </p>
            <p style={{
              color: '#999',
              fontSize: '0.9rem',
              marginBottom: '2rem',
              fontStyle: 'italic'
            }}>
              Ana sayfaya yönlendiriliyorsunuz...
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
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                  fontSize: '1rem'
                }}
                onMouseEnter={(e) => e.target.style.background = '#2980b9'}
                onMouseLeave={(e) => e.target.style.background = '#3498db'}
              >
                Ana Sayfaya Dön
              </button>
              <button
                onClick={() => navigate('/cart')}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                  fontSize: '1rem'
                }}
                onMouseEnter={(e) => e.target.style.background = '#229954'}
                onMouseLeave={(e) => e.target.style.background = '#27ae60'}
              >
                Sepete Git
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default PaymentFailed




















