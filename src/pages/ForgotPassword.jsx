import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { API_URL } from '../config/api'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetToken, setResetToken] = useState(null)
  const [resetUrl, setResetUrl] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!email) {
      setError('Lütfen e-posta adresinizi giriniz')
      setLoading(false)
      return
    }

    try {
      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      const response = await fetch(`${apiUrl}/user/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Şifre sıfırlama bağlantısı oluşturuldu!')
        
        // Geliştirme ortamında token'ı göster
        if (data.resetToken) {
          setResetToken(data.resetToken)
          setResetUrl(data.resetUrl)
        } else {
          // Production'da e-posta gönderilmiş olacak
          setSuccess('E-posta adresinize şifre sıfırlama bağlantısı gönderildi. Lütfen e-postanızı kontrol ediniz.')
        }
      } else {
        setError(data.message || 'Bir hata oluştu')
      }
    } catch (err) {
      console.error('Şifre sıfırlama hatası:', err)
      setError('Bir hata oluştu. Lütfen tekrar deneyiniz.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ padding: '4rem 0', minHeight: '70vh' }}>
        <div className="container">
          <div style={{
            maxWidth: '500px',
            margin: '0 auto',
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>
              🔑 Şifremi Unuttum
            </h1>

            {error && (
              <div style={{
                background: '#fee',
                color: '#c33',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {success && !resetToken && (
              <div style={{
                background: '#efe',
                color: '#3c3',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {success}
              </div>
            )}

            {resetToken && (
              <div style={{
                background: '#e3f2fd',
                color: '#1976d2',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '2px solid #1976d2'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>
                  ⚠️ Geliştirme Modu
                </h3>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Şifre sıfırlama bağlantısı:</strong>
                </p>
                <div style={{
                  background: 'white',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  wordBreak: 'break-all',
                  fontSize: '0.9rem',
                  border: '1px solid #ddd'
                }}>
                  <a 
                    href={resetUrl} 
                    style={{ color: '#1976d2', textDecoration: 'underline' }}
                  >
                    {resetUrl}
                  </a>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                  Production ortamında bu bağlantı e-posta ile gönderilecektir.
                </p>
              </div>
            )}

            {!success && (
              <>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
                  E-posta adresinizi giriniz, size şifre sıfırlama bağlantısı göndereceğiz.
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                      placeholder="ornek@email.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: loading ? '#ccc' : 'var(--primary-color)',
                      color: loading ? '#666' : '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      marginBottom: '1rem',
                      boxShadow: loading ? 'none' : '0 2px 8px rgba(212, 175, 55, 0.3)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.background = 'var(--primary-gold)'
                        e.target.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.4)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.background = 'var(--primary-color)'
                        e.target.style.boxShadow = '0 2px 8px rgba(212, 175, 55, 0.3)'
                      }
                    }}
                  >
                    {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
                  </button>
                </form>
              </>
            )}

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/login" style={{ color: '#667eea', fontWeight: '600' }}>
                ← Giriş sayfasına dön
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default ForgotPassword
