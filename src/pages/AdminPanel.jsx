import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../config/api'

function AdminPanel() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, getAuthHeaders, token } = useAuth()
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    // Admin kontrolü
    if (!isAuthenticated || !isAdmin || !token) {
      navigate('/')
      return
    }
    
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, activeTab, isAuthenticated, isAdmin, token])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Token kontrolü
      if (!token) {
        setError('Giriş yapmanız gerekiyor')
        setLoading(false)
        navigate('/login')
        return
      }

      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      const headers = getAuthHeaders()
      
      console.log('🔍 AdminPanel - API Request:', {
        url: `${apiUrl}/admin/${activeTab === 'orders' ? 'orders' : activeTab === 'users' ? 'users' : 'stats'}`,
        hasToken: !!token,
        tokenLength: token?.length
      })

      if (activeTab === 'orders') {
        const response = await fetch(`${apiUrl}/admin/orders`, { headers })
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setOrders(data.orders || [])
          }
        } else {
          throw new Error('Siparişler yüklenemedi')
        }
      } else if (activeTab === 'users') {
        const response = await fetch(`${apiUrl}/admin/users`, { headers })
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUsers(data.users || [])
          }
        } else {
          throw new Error('Kullanıcılar yüklenemedi')
        }
      } else if (activeTab === 'stats') {
        const response = await fetch(`${apiUrl}/admin/stats`, { headers })
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setStats(data.stats)
          }
        } else {
          throw new Error('İstatistikler yüklenemedi')
        }
      }
    } catch (err) {
      console.error('Veri yükleme hatası:', err)
      setError(err.message || 'Veri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order._id || order.id || '').toString().includes(searchTerm) ||
      (order.customerInfo?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerInfo?.phone || '').includes(searchTerm) ||
      (order.size || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (order.status || 'Yeni').toLowerCase() === statusFilter.toLowerCase() ||
      (order.paymentStatus || 'pending').toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const filteredUsers = users.filter(user => {
    return (
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || '').includes(searchTerm)
    )
  })

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '2rem 0', maxWidth: '1400px' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#2c3e50' }}>
              🛡️ Admin Paneli
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.95rem' }}>
              Hoş geldiniz, {user?.firstName} {user?.lastName}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={fetchData}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              🔄 Yenile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #eee'
        }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'orders' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'orders' ? '#000000' : '#666',
              border: 'none',
              borderBottom: activeTab === 'orders' ? '3px solid #000000' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}
          >
            📦 Siparişler ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'users' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'users' ? '#000000' : '#666',
              border: 'none',
              borderBottom: activeTab === 'users' ? '3px solid #000000' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}
          >
            👥 Kullanıcılar ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'stats' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'stats' ? '#000000' : '#666',
              border: 'none',
              borderBottom: activeTab === 'stats' ? '3px solid #000000' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}
          >
            📊 İstatistikler
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fee',
            padding: '1rem',
            borderRadius: '8px',
            color: '#c33',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Orders Tab - Admin.jsx'teki gibi aynı içerik */}
        {activeTab === 'orders' && (
          <>
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <input
                type="text"
                placeholder="🔍 Sipariş ID, E-posta veya Telefon ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: '1',
                  minWidth: '250px',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tüm Durumlar</option>
                <option value="paid">Ödenen</option>
                <option value="pending">Bekleyen</option>
                <option value="Yeni">Yeni</option>
                <option value="Baskıda">Baskıda</option>
                <option value="Tamamlandı">Tamamlandı</option>
              </select>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <h2>Siparişler yükleniyor...</h2>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem',
                background: '#f5f5f5',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                <h2 style={{ color: '#666' }}>Sipariş bulunamadı</h2>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                  <thead>
                    <tr style={{ background: '#2c3e50', color: 'white' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Sipariş No</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Müşteri</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>İletişim</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Detaylar</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Fiyat</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Durum</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Tarih</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr 
                        key={order._id || order.id} 
                        style={{ borderBottom: '1px solid #eee' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: '#3498db' }}>
                          #{order._id || order.id}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {order.customerInfo?.firstName || 'Müşteri'} {order.customerInfo?.lastName || ''}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                          <div>📧 {order.customerInfo?.email || '-'}</div>
                          {order.customerInfo?.phone && (
                            <div style={{ color: '#666', marginTop: '0.25rem' }}>
                              📞 {order.customerInfo.phone}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                          <div><strong>Boyut:</strong> {
                            order.size === 'custom' && order.customSize
                              ? `${order.customSize.width}x${order.customSize.height} cm`
                              : order.size || '-'
                          }</div>
                          <div style={{ marginTop: '0.25rem' }}><strong>Adet:</strong> {order.quantity || 1}</div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: '#27ae60' }}>
                          {formatPrice(order.price || 0)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <span style={{
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              fontWeight: 'bold',
                              background: order.status === 'Yeni' ? '#e3f2fd' : 
                                         order.status === 'Baskıda' ? '#fff3e0' :
                                         order.status === 'Tamamlandı' ? '#e8f5e9' : '#f5f5f5',
                              color: order.status === 'Yeni' ? '#1976d2' :
                                    order.status === 'Baskıda' ? '#f57c00' :
                                    order.status === 'Tamamlandı' ? '#388e3c' : '#666',
                              display: 'inline-block'
                            }}>
                              {order.status || 'Yeni'}
                            </span>
                          </div>
                          <div>
                            <span style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              background: order.paymentStatus === 'paid' ? '#d4edda' : '#fff3cd',
                              color: order.paymentStatus === 'paid' ? '#155724' : '#856404',
                              display: 'inline-block'
                            }}>
                              {order.paymentStatus === 'paid' ? '✅ Ödendi' : '⏳ Bekliyor'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#666' }}>
                          {formatDate(order.createdAt)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#3498db',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 'bold'
                            }}
                          >
                            👁️ Detay
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Users Tab - Admin.jsx'teki gibi aynı içerik */}
        {activeTab === 'users' && (
          <>
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <input
                type="text"
                placeholder="🔍 E-posta, Ad, Soyad veya Telefon ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: '1',
                  minWidth: '250px',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <h2>Kullanıcılar yükleniyor...</h2>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem',
                background: '#f5f5f5',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👤</div>
                <h2 style={{ color: '#666' }}>Kullanıcı bulunamadı</h2>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#2c3e50', color: 'white' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Ad Soyad</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>E-posta</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Telefon</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Sipariş Sayısı</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Kayıt Tarihi</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((userItem) => (
                      <tr 
                        key={userItem._id || userItem.id}
                        style={{ borderBottom: '1px solid #eee' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                          {userItem.firstName} {userItem.lastName}
                        </td>
                        <td style={{ padding: '1rem' }}>{userItem.email}</td>
                        <td style={{ padding: '1rem' }}>{userItem.phone || '-'}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            background: '#e3f2fd',
                            color: '#1976d2',
                            display: 'inline-block'
                          }}>
                            {userItem.orderCount || 0}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#666' }}>
                          {formatDate(userItem.createdAt)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            background: userItem.role === 'admin' ? '#d4edda' : '#f5f5f5',
                            color: userItem.role === 'admin' ? '#155724' : '#666',
                            display: 'inline-block'
                          }}>
                            {userItem.role === 'admin' ? '🛡️ Admin' : '👤 Kullanıcı'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Stats Tab - Admin.jsx'teki gibi aynı içerik */}
        {activeTab === 'stats' && stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Toplam Kullanıcı</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalUsers || 0}</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Toplam Sipariş</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalOrders || 0}</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💰</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Toplam Gelir</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{formatPrice(stats.totalRevenue || 0)}</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Ödenen Sipariş</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.paidOrders || 0}</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏳</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Bekleyen Sipariş</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.pendingOrders || 0}</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📅</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Son 30 Gün Sipariş</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.recentOrders || 0}</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              padding: '2rem',
              borderRadius: '12px',
              color: '#333',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🆕</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>Son 30 Gün Yeni Kullanıcı</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.recentUsers || 0}</div>
            </div>
          </div>
        )}

        {/* Order Detail Modal - Admin.jsx'teki gibi */}
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
                    <div><strong>Tarih:</strong> {formatDate(selectedOrder.createdAt)}</div>
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
                  </div>
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#e8f5e9', borderRadius: '6px' }}>
                    <strong style={{ fontSize: '1.2rem' }}>Toplam: {formatPrice(selectedOrder.price || 0)}</strong>
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
                  <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Fotoğraf</h3>
                    <img 
                      src={`data:${selectedOrder.photo.mimetype || 'image/jpeg'};base64,${selectedOrder.photo.base64}`}
                      alt="Sipariş fotoğrafı"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                      }}
                    />
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
      <Footer />
    </>
  )
}

export default AdminPanel

