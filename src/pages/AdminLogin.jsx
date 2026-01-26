import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import { API_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'
import { getBrowserId } from '../utils/browserFingerprint'

function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  // Admin kullanıcı adı, şifre ve özel kod (.env dosyasından alınır)
  const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'efe'
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '193123'
  const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE || 'ADMIN2024SECRET'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Backend'e admin login isteği gönder
      // API_URL zaten tam URL (http://localhost:5001) veya /api olabilir
      let apiUrl = API_URL
      if (!API_URL.includes('/api') && !API_URL.startsWith('http')) {
        // Relative path ise /api ekle
        apiUrl = `${API_URL}/api`
      } else if (API_URL.startsWith('http') && !API_URL.includes('/api')) {
        // Tam URL ise /api ekle
        apiUrl = `${API_URL}/api`
      } else {
        apiUrl = API_URL
      }
      
      const response = await fetch(`${apiUrl}/user/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password,
          adminCode
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // JWT token'ı al ve kaydet
        const browserId = getBrowserId()
        sessionStorage.setItem(`authToken_${browserId}`, data.token)
        sessionStorage.setItem(`user_${browserId}`, JSON.stringify({ ...data.user, browserId }))
        
        // Session storage'a da kaydet (eski sistem için)
        sessionStorage.setItem('adminAuthenticated', 'true')
        sessionStorage.setItem('adminLoginTime', new Date().getTime().toString())
        sessionStorage.setItem('adminCodeVerified', 'true')
        
        // Sayfayı yenileyerek AuthContext'in token'ı yüklemesini sağla
        // Bu şekilde AdminPanel sayfası token'ı görebilir
        window.location.href = '/admin'
      } else {
        setError(data.message || 'Kullanıcı adı, şifre veya admin kodu hatalı!')
        setLoading(false)
      }
    } catch (err) {
      console.error('Admin giriş hatası:', err)
      setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.')
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ 
        minHeight: '70vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem 0'
      }}>
        <div className="container">
          <div style={{
            maxWidth: '450px',
            margin: '0 auto',
            background: 'white',
            padding: '3rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                <Icon name="lock" size={32} />
              </div>
              <h1 style={{ 
                color: '#2c3e50', 
                marginBottom: '0.5rem',
                fontSize: '2rem'
              }}>
                Admin Girişi
              </h1>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>
                Admin paneline erişmek için giriş yapın
              </p>
            </div>

            {error && (
              <div style={{
                background: '#fee',
                color: '#c33',
                padding: '1rem',
                borderRadius: '6px',
                marginBottom: '1.5rem',
                border: '1px solid #fcc',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>Uyarı:</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="username" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2c3e50'
                  }}
                >
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3498db'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  placeholder="Kullanıcı adınızı girin"
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="password" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2c3e50'
                  }}
                >
                  Şifre
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3498db'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  placeholder="Şifrenizi girin"
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label 
                  htmlFor="adminCode" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2c3e50'
                  }}
                >
                  <Icon name="lock" size={16} /> Admin Kodu
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: '#e74c3c', 
                    marginLeft: '0.5rem',
                    fontWeight: 'normal'
                  }}>
                    (Zorunlu)
                  </span>
                </label>
                <input
                  type="password"
                  id="adminCode"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box',
                    background: '#fffbf0'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#f39c12'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  placeholder="Sadece adminlerin bildiği özel kodu girin"
                  disabled={loading}
                />
                <small style={{
                  display: 'block',
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#e67e22',
                  fontStyle: 'italic'
                }}>
                  Bu kod sadece yetkili adminler tarafından bilinir
                </small>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: loading ? '#95a5a6' : '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s',
                  boxShadow: loading ? 'none' : '0 2px 4px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.background = '#2980b9'
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.background = '#3498db'
                }}
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>

            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: '#666',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0 }}>
              Uyarı: Bu sayfa sadece yetkili personel içindir.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default AdminLogin
