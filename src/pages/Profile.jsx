import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../config/api'

function Profile() {
  const navigate = useNavigate()
  const { user, loading: authLoading, logout, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Mobil responsive kontrolü
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    } else if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || ''
      })
      loadOrders()
    }
  }, [user, authLoading, navigate])

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const apiEndpoint = API_URL.includes('/api') ? `${API_URL}/orders/user` : `${API_URL}/api/orders/user`
      const response = await fetch(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrders(data.orders || [])
        }
      }
    } catch (error) {
      console.error('Sipariş yükleme hatası:', error)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const result = await updateProfile(
      formData.firstName,
      formData.lastName,
      formData.phone,
      formData.address
    )

    if (result.success) {
      setSuccess('Profil başarıyla güncellendi')
    } else {
      setError(result.error || 'Profil güncellenemedi')
    }

    setLoading(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    // Güçlü şifre kontrolü
    if (passwordData.newPassword.length < 8) {
      setError('Yeni şifre en az 8 karakter olmalıdır')
      setLoading(false)
      return
    }

    // Şifre güçlülük kontrolü (büyük harf, küçük harf, rakam, özel karakter)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    if (!passwordRegex.test(passwordData.newPassword)) {
      setError('Yeni şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter (@$!%*?&) içermelidir')
      setLoading(false)
      return
    }

    const result = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    )

    if (result.success) {
      setSuccess('Şifre başarıyla değiştirildi')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } else {
      setError(result.error || 'Şifre değiştirilemedi')
    }

    setLoading(false)
  }

  if (authLoading) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '4rem 0', textAlign: 'center' }}>
          <div className="container">
            <p>Yükleniyor...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem 0', minHeight: '70vh' }}>
        <div className="container">
          <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Profilim</h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '200px 1fr',
            gap: '2rem'
          }}>
            {/* Tab Menü */}
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '12px',
              height: 'fit-content',
              display: isMobile ? 'flex' : 'block',
              flexDirection: isMobile ? 'row' : 'column',
              gap: isMobile ? '0.5rem' : '0',
              overflowX: isMobile ? 'auto' : 'visible'
            }}>
              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  width: window.innerWidth < 768 ? 'auto' : '100%',
                  minWidth: window.innerWidth < 768 ? '120px' : 'auto',
                  padding: '0.75rem',
                  marginBottom: window.innerWidth < 768 ? '0' : '0.5rem',
                  marginRight: window.innerWidth < 768 ? '0.5rem' : '0',
                  background: activeTab === 'profile' ? '#667eea' : '#f3f4f6',
                  color: activeTab === 'profile' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontWeight: activeTab === 'profile' ? 'bold' : 'normal',
                  whiteSpace: 'nowrap'
                }}
              >
                📝 Profil
              </button>
              <button
                onClick={() => setActiveTab('password')}
                style={{
                  width: window.innerWidth < 768 ? 'auto' : '100%',
                  minWidth: window.innerWidth < 768 ? '120px' : 'auto',
                  padding: '0.75rem',
                  marginBottom: window.innerWidth < 768 ? '0' : '0.5rem',
                  marginRight: window.innerWidth < 768 ? '0.5rem' : '0',
                  background: activeTab === 'password' ? '#667eea' : '#f3f4f6',
                  color: activeTab === 'password' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontWeight: activeTab === 'password' ? 'bold' : 'normal',
                  whiteSpace: 'nowrap'
                }}
              >
                🔒 Şifre
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                style={{
                  width: window.innerWidth < 768 ? 'auto' : '100%',
                  minWidth: window.innerWidth < 768 ? '120px' : 'auto',
                  padding: '0.75rem',
                  marginBottom: window.innerWidth < 768 ? '0' : '0.5rem',
                  marginRight: window.innerWidth < 768 ? '0.5rem' : '0',
                  background: activeTab === 'orders' ? '#667eea' : '#f3f4f6',
                  color: activeTab === 'orders' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontWeight: activeTab === 'orders' ? 'bold' : 'normal',
                  whiteSpace: 'nowrap'
                }}
              >
                📦 Siparişler
              </button>
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                style={{
                  width: isMobile ? 'auto' : '100%',
                  minWidth: isMobile ? '100px' : 'auto',
                  padding: '0.75rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}
              >
                🚪 Çıkış
              </button>
            </div>

            {/* İçerik */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px'
            }}>
              {error && (
                <div style={{
                  background: '#fee',
                  color: '#c33',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  background: '#efe',
                  color: '#3c3',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  {success}
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem' }}>Profil Bilgileri</h2>
                  <form onSubmit={handleProfileUpdate}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                          Ad
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '8px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                          Soyad
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '8px'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        E-posta
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          background: '#f3f4f6',
                          color: '#666'
                        }}
                      />
                      <small style={{ color: '#666' }}>E-posta değiştirilemez</small>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '8px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Adres
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '0.75rem 2rem',
                        background: loading ? '#ccc' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {loading ? 'Güncelleniyor...' : 'Güncelle'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'password' && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem' }}>Şifre Değiştir</h2>
                  <form onSubmit={handlePasswordChange}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Mevcut Şifre
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '8px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Yeni Şifre
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        minLength="6"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '8px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Yeni Şifre Tekrar
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '8px'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '0.75rem 2rem',
                        background: loading ? '#ccc' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {loading ? 'Değiştiriliyor...' : 'Şifre Değiştir'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem' }}>Siparişlerim</h2>
                  {orders.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                      Henüz siparişiniz bulunmamaktadır.
                    </p>
                  ) : (
                    <div>
                      {orders.map((order) => (
                        <div
                          key={order._id || order.id}
                          style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            marginBottom: '1rem',
                            background: 'white'
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'space-between', 
                            marginBottom: '1rem',
                            gap: isMobile ? '0.5rem' : '0'
                          }}>
                            <div>
                              <strong>Sipariş No:</strong> #{String(order._id || order.id).substring(0, 8)}...
                            </div>
                            <div>
                              <strong>Durum:</strong> <span style={{ 
                                color: order.status === 'Ödeme Alındı' ? '#22c55e' : 
                                       order.status === 'Hazırlanıyor' ? '#f59e0b' : 
                                       order.status === 'Kargoda' ? '#3b82f6' : '#666'
                              }}>{order.status || 'Yeni'}</span>
                            </div>
                            <div>
                              <strong>Fiyat:</strong> ₺{order.price?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                          <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                          }}>
                            <div>
                              <strong>Boyut:</strong> {order.size}
                              {order.customSize && ` (${order.customSize.width}x${order.customSize.height} cm)`}
                            </div>
                            <div>
                              <strong>Adet:</strong> {order.quantity}
                            </div>
                          </div>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                            📅 {new Date(order.createdAt).toLocaleString('tr-TR')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Profile

