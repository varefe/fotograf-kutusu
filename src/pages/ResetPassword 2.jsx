import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import { API_URL } from '../config/api'

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('Geçersiz şifre sıfırlama bağlantısı')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!token) {
      setError('Geçersiz şifre sıfırlama bağlantısı')
      setLoading(false)
      return
    }

    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Lütfen tüm alanları doldurunuz')
      setLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    if (formData.newPassword.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır')
      setLoading(false)
      return
    }

    // Şifre güçlülük kontrolü
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(formData.newPassword)) {
      setError('Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter (@$!%*?&) içermelidir')
      setLoading(false)
      return
    }

    try {
      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      const response = await fetch(`${apiUrl}/user/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError(data.message || 'Şifre sıfırlanamadı')
      }
    } catch (err) {
      console.error('Şifre sıfırlama hatası:', err)
      setError('Bir hata oluştu. Lütfen tekrar deneyiniz.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (success) {
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
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                <Icon name="check" size={32} />
              </div>
              <h1 style={{ marginBottom: '1rem', fontSize: '2rem', color: '#27ae60' }}>
                Şifre Başarıyla Sıfırlandı!
              </h1>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                Yeni şifrenizle giriş yapabilirsiniz. 3 saniye sonra giriş sayfasına yönlendirileceksiniz...
              </p>
              <Link 
                to="/login" 
                style={{ 
                  color: 'var(--primary-color)', 
                  fontWeight: '600',
                  textDecoration: 'underline'
                }}
              >
                Hemen Giriş Yap
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
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
            <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Icon name="lock" size={20} /> Yeni Şifre Belirle
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

            <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
              Yeni şifrenizi belirleyiniz. Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter içermelidir.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Yeni Şifre
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      paddingRight: '3rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    placeholder="Yeni şifrenizi giriniz"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666',
                      fontSize: '1.2rem'
                    }}
                    title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                  >
                    {showPassword ? 'Gizle' : 'Göster'}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Şifre Tekrar
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      paddingRight: '3rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    placeholder="Şifrenizi tekrar giriniz"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666',
                      fontSize: '1.2rem'
                    }}
                    title={showConfirmPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                  >
                    {showConfirmPassword ? 'Gizle' : 'Göster'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: loading || !token ? '#e2e8f0' : 'var(--primary-color)',
                  color: loading || !token ? '#64748b' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: loading || !token ? 'not-allowed' : 'pointer',
                  marginBottom: '1rem',
                  boxShadow: loading || !token ? 'none' : 'var(--shadow)',
                  transition: 'color 0.2s, background-color 0.2s, box-shadow 0.2s'
                }}
              >
                {loading ? 'Şifre Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
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

export default ResetPassword
