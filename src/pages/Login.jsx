import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.email || !formData.password) {
      setError('Lütfen e-posta ve şifre giriniz')
      setLoading(false)
      return
    }

    const result = await login(formData.email, formData.password, formData.rememberMe)

    if (result.success) {
      // Admin ise admin paneline, değilse profile yönlendir
      const { user } = result
      if (user?.role === 'admin') {
        navigate('/admin-panel')
      } else {
        navigate('/profile')
      }
    } else {
      setError(result.error || 'Giriş başarısız')
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <>
      <Navbar />
      <main style={{ padding: '4rem 0', minHeight: '70vh' }}>
        <div className="container">
          <div style={{
            maxWidth: '400px',
            margin: '0 auto',
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>
              Giriş Yap
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

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Şifre
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
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
                    placeholder="Şifrenizi giriniz"
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
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  style={{
                    width: '18px',
                    height: '18px',
                    marginRight: '0.5rem',
                    cursor: 'pointer'
                  }}
                />
                <label htmlFor="rememberMe" style={{ 
                  cursor: 'pointer', 
                  fontSize: '0.95rem',
                  color: 'var(--text-color)',
                  userSelect: 'none'
                }}>
                  Beni Hatırla
                </label>
                <span style={{ 
                  marginLeft: '0.5rem', 
                  fontSize: '0.85rem', 
                  color: 'var(--text-light)',
                  fontStyle: 'italic'
                }}>
                  (Bu tarayıcıda kalıcı oturum)
                </span>
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
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ color: '#666' }}>
                Hesabınız yok mu?{' '}
                <Link to="/register" style={{ color: '#667eea', fontWeight: '600' }}>
                  Kayıt Ol
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Login

