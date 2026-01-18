import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../config/api'

function Profile() {
  const navigate = useNavigate()
  const { user, loading: authLoading, logout, updateProfile, changePassword, getAuthHeaders } = useAuth()
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
      setLoading(true)
      const headers = getAuthHeaders()
      
      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      const apiEndpoint = `${apiUrl}/orders/user`
      
      const response = await fetch(apiEndpoint, { headers })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrders(data.orders || [])
        } else {
          setError('Siparişler yüklenemedi')
        }
      } else {
        setError('Siparişler yüklenemedi')
      }
    } catch (error) {
      console.error('Sipariş yükleme hatası:', error)
      setError('Siparişler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Siparişlerim</h2>
                    <button
                      onClick={loadOrders}
                      disabled={loading}
                      style={{
                        padding: '0.5rem 1rem',
                        background: loading ? '#ccc' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {loading ? 'Yükleniyor...' : '🔄 Yenile'}
                    </button>
                  </div>
                  
                  {loading && orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                      <p>Siparişler yükleniyor...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '12px' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                      <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '1rem' }}>
                        Henüz siparişiniz bulunmamaktadır.
                      </p>
                      <button
                        onClick={() => navigate('/order')}
                        style={{
                          padding: '0.75rem 2rem',
                          background: 'var(--primary-color)',
                          color: '#000000',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        }}
                      >
                        Yeni Sipariş Oluştur
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {orders.map((order) => (
                        <div
                          key={order._id || order.id}
                          style={{
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            background: 'white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#667eea'
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.2)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                            e.currentTarget.style.transform = 'translateY(0)'
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'space-between', 
                            alignItems: isMobile ? 'flex-start' : 'center',
                            marginBottom: '1rem',
                            gap: isMobile ? '0.75rem' : '0',
                            paddingBottom: '1rem',
                            borderBottom: '1px solid #e5e7eb'
                          }}>
                            <div>
                              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                                Sipariş No
                              </div>
                              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2c3e50', fontFamily: 'monospace' }}>
                                #{String(order._id || order.id).substring(0, 12)}
                              </div>
                            </div>
                            <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                                Durum
                              </div>
                              <span style={{ 
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                display: 'inline-block',
                                background: order.status === 'Tamamlandı' || order.paymentStatus === 'paid' ? '#d1fae5' : 
                                           order.status === 'Baskıda' ? '#fef3c7' : 
                                           order.status === 'Yeni' ? '#dbeafe' : '#f3f4f6',
                                color: order.status === 'Tamamlandı' || order.paymentStatus === 'paid' ? '#065f46' : 
                                       order.status === 'Baskıda' ? '#92400e' : 
                                       order.status === 'Yeni' ? '#1e40af' : '#374151'
                              }}>
                                {order.status || 'Yeni'}
                              </span>
                            </div>
                            <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                                Toplam
                              </div>
                              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.price || 0)}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
                            gap: '1rem',
                            marginBottom: '1rem'
                          }}>
                            <div>
                              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                                📐 Boyut
                              </div>
                              <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                                {order.size === 'custom' && order.customSize
                                  ? `${order.customSize.width}x${order.customSize.height} cm`
                                  : order.size || '-'}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                                🔢 Adet
                              </div>
                              <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                                {order.quantity || 1} adet
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                                📦 Kargo
                              </div>
                              <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                                {order.shippingType === 'express' ? 'Express' : 'Standart'}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: '1rem',
                            borderTop: '1px solid #e5e7eb',
                            fontSize: '0.9rem',
                            color: '#666'
                          }}>
                            <div>
                              📅 {new Date(order.createdAt).toLocaleDateString('tr-TR', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div style={{ 
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              background: order.paymentStatus === 'paid' ? '#d1fae5' : '#fef3c7',
                              color: order.paymentStatus === 'paid' ? '#065f46' : '#92400e',
                              fontWeight: 'bold'
                            }}>
                              {order.paymentStatus === 'paid' ? '✅ Ödendi' : '⏳ Bekliyor'}
                            </div>
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

