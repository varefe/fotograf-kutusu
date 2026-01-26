import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
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
  const [selectedOrder, setSelectedOrder] = useState(null)

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
    }
  }, [user, authLoading, navigate])

  // Orders tab'ı aktif olduğunda siparişleri yükle
  useEffect(() => {
    if (user && activeTab === 'orders' && orders.length === 0 && !loading) {
      loadOrders()
    }
  }, [activeTab, user])

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
                <Icon name="user" size={16} /> Profil
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
                <Icon name="lock" size={16} /> Şifre
              </button>
              <button
                onClick={() => {
                  setActiveTab('orders')
                  // Orders tab'ına geçildiğinde siparişleri yükle
                  if (orders.length === 0 && !loading) {
                    loadOrders()
                  }
                }}
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
                <Icon name="cart" size={16} /> Siparişler
              </button>
              <button
                onClick={() => navigate('/order-tracking')}
                style={{
                  width: window.innerWidth < 768 ? 'auto' : '100%',
                  minWidth: window.innerWidth < 768 ? '120px' : 'auto',
                  padding: '0.75rem',
                  marginBottom: window.innerWidth < 768 ? '0' : '0.5rem',
                  marginRight: window.innerWidth < 768 ? '0.5rem' : '0',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon name="pin" size={16} /> Sipariş Takibi
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
                <Icon name="logout" size={16} /> Çıkış
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
                      {loading ? 'Yükleniyor...' : 'Yenile'}
                    </button>
                  </div>
                  
                  {loading && orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                        <Icon name="clock" size={32} />
                      </div>
                      <p>Siparişler yükleniyor...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '12px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        <Icon name="mail" size={32} />
                      </div>
                      <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '1rem' }}>
                        Henüz siparişiniz bulunmamaktadır.
                      </p>
                      <button
                        onClick={() => navigate('/order')}
                        style={{
                          padding: '0.75rem 2rem',
                          background: 'var(--primary-color)',
                          color: '#ffffff',
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
                          onClick={() => setSelectedOrder(order)}
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
                                <Icon name="ruler" size={14} /> Boyut
                              </div>
                              <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                                {order.size === 'custom' && order.customSize
                                  ? `${order.customSize.width}x${order.customSize.height} cm`
                                  : order.size || '-'}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                                <Icon name="hash" size={14} /> Adet
                              </div>
                              <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                                {order.quantity || 1} adet
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                                Kargo
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Icon name="clock" size={14} />
                              {new Date(order.createdAt).toLocaleDateString('tr-TR', { 
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
                              {order.paymentStatus === 'paid' ? 'Ödendi' : 'Bekliyor'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sipariş Detay Modal */}
              {selectedOrder && (
                <div 
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                  }}
                  onClick={() => setSelectedOrder(null)}
                >
                  <div 
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '2rem',
                      maxWidth: '800px',
                      width: '100%',
                      maxHeight: '90vh',
                      overflowY: 'auto',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <h2 style={{ margin: 0, color: '#2c3e50' }}>Sipariş Detayları</h2>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        style={{
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          fontSize: '1.5rem',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Sipariş Bilgileri</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div><strong>Sipariş No:</strong> #{selectedOrder._id || selectedOrder.id}</div>
                          <div><strong>Tarih:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString('tr-TR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</div>
                          <div><strong>Boyut:</strong> {
                            selectedOrder.size === 'custom' && selectedOrder.customSize
                              ? `${selectedOrder.customSize.width}x${selectedOrder.customSize.height} cm`
                              : selectedOrder.size || '-'
                          }</div>
                          <div><strong>Adet:</strong> {selectedOrder.quantity || 1}</div>
                          <div><strong>Kargo:</strong> {
                            selectedOrder.shippingType === 'standard' ? 'Standart' :
                            selectedOrder.shippingType === 'express' ? 'Express' : '-'
                          }</div>
                          <div><strong>Durum:</strong> {selectedOrder.status || 'Yeni'}</div>
                        </div>
                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#e8f5e9', borderRadius: '6px' }}>
                          <strong style={{ fontSize: '1.2rem' }}>Toplam: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(selectedOrder.price || 0)}</strong>
                        </div>
                      </div>

                      <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Müşteri Bilgileri</h3>
                        <div><strong>Ad Soyad:</strong> {selectedOrder.customerInfo?.firstName || 'Müşteri'} {selectedOrder.customerInfo?.lastName || ''}</div>
                        <div style={{ marginTop: '0.5rem' }}><strong>E-posta:</strong> {selectedOrder.customerInfo?.email || '-'}</div>
                        {selectedOrder.customerInfo?.phone && (
                          <div style={{ marginTop: '0.5rem' }}><strong>Telefon:</strong> {selectedOrder.customerInfo.phone}</div>
                        )}
                        <div style={{ marginTop: '0.5rem' }}>
                          <strong>Adres:</strong>
                          <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>{selectedOrder.customerInfo?.address || '-'}</p>
                        </div>
                      </div>

                      {selectedOrder.photo?.base64 && (
                        <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
                          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Icon name="camera" size={18} /> Sipariş Fotoğrafı
                          </h3>
                          <div style={{ 
                            textAlign: 'center',
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            <img 
                              src={`data:${selectedOrder.photo.mimetype || 'image/jpeg'};base64,${selectedOrder.photo.base64}`}
                              alt="Sipariş fotoğrafı"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '500px',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                const newWindow = window.open();
                                newWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>Sipariş Fotoğrafı - ${selectedOrder._id || selectedOrder.id}</title>
                                      <style>
                                        body {
                                          margin: 0;
                                          padding: 20px;
                                          background: #f5f5f5;
                                          display: flex;
                                          justify-content: center;
                                          align-items: center;
                                          min-height: 100vh;
                                        }
                                        img {
                                          max-width: 100%;
                                          max-height: 90vh;
                                          border-radius: 8px;
                                          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                                        }
                                      </style>
                                    </head>
                                    <body>
                                      <img src="data:${selectedOrder.photo.mimetype || 'image/jpeg'};base64,${selectedOrder.photo.base64}" alt="Sipariş fotoğrafı" />
                                    </body>
                                  </html>
                                `);
                              }}
                              title="Fotoğrafa tıklayarak tam boyutta görüntüleyin"
                            />
                            {selectedOrder.photo.originalName && (
                              <div style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                                <strong>Dosya Adı:</strong> {selectedOrder.photo.originalName}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setSelectedOrder(null)}
                          style={{
                            padding: '0.75rem 2rem',
                            background: '#95a5a6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          Kapat
                        </button>
                      </div>
                    </div>
                  </div>
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

