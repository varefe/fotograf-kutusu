import React, { useState, useEffect } from 'react'
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
  
  // Order Tracking state
  const [trackingPaymentIds, setTrackingPaymentIds] = useState('')
  const [trackingPaymentId, setTrackingPaymentId] = useState('')
  const [trackingConversationId, setTrackingConversationId] = useState('')
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackingError, setTrackingError] = useState('')
  const [trackingSuccess, setTrackingSuccess] = useState('')
  const [trackingSearchResult, setTrackingSearchResult] = useState(null)
  const [trackingSyncResult, setTrackingSyncResult] = useState(null)
  
  // Silme işlemleri için state
  const [deleteConfirm, setDeleteConfirm] = useState(null) // { type: 'order' | 'user', id: string, name: string }

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
        console.log('📥 Siparişler isteniyor:', `${apiUrl}/admin/orders`)
        console.log('🔑 Headers:', headers)
        
        const response = await fetch(`${apiUrl}/admin/orders`, { headers })
        console.log('📥 Response status:', response.status, response.statusText)
        
        const data = await response.json()
        console.log('📥 Response data (detaylı):', JSON.stringify(data, null, 2))
        console.log('📥 Response data (kısa):', {
          success: data.success,
          ordersCount: data.orders?.length || 0,
          total: data.total,
          rawCount: data.rawCount,
          error: data.error,
          message: data.message,
          hasOrders: Array.isArray(data.orders),
          ordersType: typeof data.orders
        })
        
        // Eğer rawCount undefined ise, backend'de bir sorun var
        if (data.rawCount === undefined) {
          console.error('❌ KRİTİK: Backend\'den rawCount gelmedi!');
          console.error('❌ Bu, backend route\'unun düzgün çalışmadığını gösterir');
          console.error('❌ Backend terminal loglarını kontrol edin');
        }
        
        if (response.ok) {
          if (data.success) {
            console.log('✅ Siparişler başarıyla alındı:', data.orders?.length || 0, 'sipariş')
            setOrders(data.orders || [])
            
            // Eğer sipariş yoksa logla
            if (!data.orders || data.orders.length === 0) {
              console.warn('⚠️ Backend\'den sipariş gelmedi:', {
                total: data.total,
                rawCount: data.rawCount,
                orders: data.orders
              })
            }
          } else {
            console.error('❌ Backend success=false:', data)
            throw new Error(data.message || 'Siparişler yüklenemedi')
          }
        } else {
          console.error('❌ Admin orders hatası:', {
            status: response.status,
            statusText: response.statusText,
            error: data.error,
            message: data.message,
            fullData: data
          })
          throw new Error(data.message || data.error || 'Siparişler yüklenemedi')
        }
      } else if (activeTab === 'users') {
        const response = await fetch(`${apiUrl}/admin/users`, { headers })
        const data = await response.json()
        
        if (response.ok) {
          if (data.success) {
            setUsers(data.users || [])
          } else {
            throw new Error(data.message || 'Kullanıcılar yüklenemedi')
          }
        } else {
          console.error('❌ Admin users hatası:', {
            status: response.status,
            error: data.error,
            message: data.message
          })
          throw new Error(data.message || data.error || 'Kullanıcılar yüklenemedi')
        }
      } else if (activeTab === 'stats') {
        const response = await fetch(`${apiUrl}/admin/stats`, { headers })
        const data = await response.json()
        
        if (response.ok) {
          if (data.success) {
            setStats(data.stats)
          } else {
            throw new Error(data.message || 'İstatistikler yüklenemedi')
          }
        } else {
          console.error('❌ Admin stats hatası:', {
            status: response.status,
            error: data.error,
            message: data.message
          })
          throw new Error(data.message || data.error || 'İstatistikler yüklenemedi')
        }
      }
    } catch (err) {
      console.error('❌ Veri yükleme hatası:', err)
      console.error('❌ Hata detayı:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      })
      
      // Network hatası kontrolü
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError('Backend sunucusuna bağlanılamadı. Lütfen backend\'in çalıştığından emin olun.')
      } else if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setError('Yetkilendirme hatası. Lütfen tekrar giriş yapın.')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setError(err.message || 'Veri yüklenirken bir hata oluştu')
      }
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

  // Silme fonksiyonları
  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      const headers = getAuthHeaders()
      
      let endpoint;
      if (deleteConfirm.type === 'order') {
        endpoint = `${apiUrl}/admin/orders/${deleteConfirm.id}`
      } else if (deleteConfirm.type === 'user') {
        endpoint = `${apiUrl}/admin/users/${deleteConfirm.id}`
      } else {
        return;
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Başarılı - listeyi yenile
        await fetchData()
        setDeleteConfirm(null)
        setError(null)
      } else {
        setError(data.message || data.error || 'Silme işlemi başarısız oldu')
        setDeleteConfirm(null)
      }
    } catch (err) {
      console.error('Silme hatası:', err)
      setError('Silme işlemi sırasında bir hata oluştu')
      setDeleteConfirm(null)
    }
  }

  // Siparişleri orderGroupId'ye göre grupla
  const groupedOrders = orders.reduce((acc, order) => {
    const groupId = order.orderGroupId || 'ungrouped';
    if (!acc[groupId]) {
      acc[groupId] = [];
    }
    acc[groupId].push(order);
    return acc;
  }, {});

  // Grupları düzleştir ve sırala (en yeni grup önce)
  const flattenedOrders = Object.values(groupedOrders)
    .flat()
    .sort((a, b) => {
      // Önce orderGroupId'ye göre grupla, sonra tarihe göre sırala
      if (a.orderGroupId && b.orderGroupId && a.orderGroupId === b.orderGroupId) {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const filteredOrders = flattenedOrders.filter(order => {
    const matchesSearch = searchTerm === '' ||
      (order._id || order.id || '').toString().includes(searchTerm) ||
      (order.orderGroupId || '').toString().includes(searchTerm) ||
      (order.customerInfo?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerInfo?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <button
            onClick={() => setActiveTab('tracking')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'tracking' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'tracking' ? '#000000' : '#666',
              border: 'none',
              borderBottom: activeTab === 'tracking' ? '3px solid #000000' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}
          >
            🔄 Sipariş Takibi
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
                <option value="failed">Başarısız</option>
                <option value="cancelled">İptal Edilen</option>
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
                {orders.length === 0 && !loading && (
                  <div style={{ marginTop: '1rem', color: '#999', fontSize: '0.9rem' }}>
                    <p>Henüz hiç sipariş alınmamış veya siparişler yüklenemedi.</p>
                    <p style={{ marginTop: '0.5rem' }}>
                      Backend loglarını kontrol edin veya tarayıcı konsolunu açın (F12).
                    </p>
                    <button
                      onClick={fetchData}
                      style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        background: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      🔄 Tekrar Dene
                    </button>
                  </div>
                )}
                {orders.length > 0 && filteredOrders.length === 0 && (
                  <p style={{ marginTop: '1rem', color: '#999', fontSize: '0.9rem' }}>
                    Arama kriterlerinize uygun sipariş bulunamadı. Filtreleri temizleyip tekrar deneyin.
                  </p>
                )}
              </div>
            ) : (
              <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                  <thead>
                    <tr style={{ background: '#2c3e50', color: 'white' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Sipariş No</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Fotoğraf</th>
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
                    {filteredOrders.map((order, index) => {
                      // Aynı orderGroupId'ye sahip önceki sipariş var mı kontrol et
                      const prevOrder = index > 0 ? filteredOrders[index - 1] : null;
                      const isGroupStart = !prevOrder || prevOrder.orderGroupId !== order.orderGroupId;
                      const isGrouped = order.orderGroupId && order.orderGroupId !== 'ungrouped';
                      
                      return (
                        <React.Fragment key={order._id || order.id}>
                          {isGroupStart && isGrouped && (
                            <tr style={{ background: '#e8f4f8', borderTop: '2px solid #3498db' }}>
                              <td colSpan="9" style={{ padding: '0.75rem 1rem', fontWeight: 'bold', color: '#2c3e50' }}>
                                🔗 Sipariş Grubu: {order.orderGroupId} 
                                {(() => {
                                  const groupOrders = filteredOrders.filter(o => o.orderGroupId === order.orderGroupId);
                                  return ` (${groupOrders.length} sipariş)`;
                                })()}
                              </td>
                            </tr>
                          )}
                          <tr 
                            style={{ 
                              borderBottom: '1px solid #eee',
                              background: isGrouped && !isGroupStart ? '#f8f9fa' : 'white'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f0f7ff'}
                            onMouseLeave={(e) => e.currentTarget.style.background = (isGrouped && !isGroupStart ? '#f8f9fa' : 'white')}
                          >
                            <td style={{ padding: '1rem', fontWeight: 'bold', color: '#3498db' }}>
                              #{order._id || order.id}
                              {isGrouped && (
                                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                                  🔗 {order.orderGroupId?.substring(0, 12)}...
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              {/* Birden fazla fotoğraf varsa göster */}
                              {order.photos && order.photos.length > 0 ? (
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  {order.photos.slice(0, 3).map((photo, idx) => (
                                    photo?.base64 ? (
                                      <img 
                                        key={idx}
                                        src={`data:${photo.mimetype || 'image/jpeg'};base64,${photo.base64}`}
                                        alt={`Fotoğraf ${idx + 1}`}
                                        style={{
                                          width: '60px',
                                          height: '60px',
                                          objectFit: 'cover',
                                          borderRadius: '6px',
                                          border: '2px solid #ddd',
                                          cursor: 'pointer',
                                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                        onClick={() => setSelectedOrder(order)}
                                        title={`${order.photos.length} fotoğraf - Tıklayarak detayları görüntüleyin`}
                                      />
                                    ) : null
                                  ))}
                                  {order.photos.length > 3 && (
                                    <div style={{
                                      width: '60px',
                                      height: '60px',
                                      background: '#667eea',
                                      color: 'white',
                                      borderRadius: '6px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 'bold',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => setSelectedOrder(order)}
                                    title={`+${order.photos.length - 3} daha fazla fotoğraf`}
                                    >
                                      +{order.photos.length - 3}
                                    </div>
                                  )}
                                </div>
                              ) : order.photo?.base64 ? (
                                <img 
                                  src={`data:${order.photo.mimetype || 'image/jpeg'};base64,${order.photo.base64}`}
                                  alt="Sipariş fotoğrafı"
                                  style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: '2px solid #ddd',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                  }}
                                  onClick={() => setSelectedOrder(order)}
                                  title="Fotoğrafa tıklayarak detayları görüntüleyin"
                                />
                              ) : (
                                <div style={{
                                  width: '80px',
                                  height: '80px',
                                  background: '#f5f5f5',
                                  borderRadius: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#999',
                                  fontSize: '0.75rem',
                                  border: '2px dashed #ddd'
                                }}>
                                  Fotoğraf Yok
                                </div>
                              )}
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
                              background: 
                                order.paymentStatus === 'paid' ? '#d4edda' :
                                order.paymentStatus === 'failed' ? '#f8d7da' :
                                order.paymentStatus === 'cancelled' ? '#f8d7da' :
                                '#fff3cd',
                              color: 
                                order.paymentStatus === 'paid' ? '#155724' :
                                order.paymentStatus === 'failed' ? '#721c24' :
                                order.paymentStatus === 'cancelled' ? '#721c24' :
                                '#856404',
                              display: 'inline-block'
                            }}>
                              {order.paymentStatus === 'paid' ? '✅ Ödendi' : 
                               order.paymentStatus === 'failed' ? '❌ Başarısız' :
                               order.paymentStatus === 'cancelled' ? '🚫 İptal Edildi' :
                               '⏳ Bekliyor'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#666' }}>
                          {formatDate(order.createdAt)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                            <button
                              onClick={() => setDeleteConfirm({
                                type: 'order',
                                id: order._id || order.id,
                                name: `Sipariş #${order._id || order.id}`
                              })}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 'bold'
                              }}
                            >
                              🗑️ Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                        </React.Fragment>
                      );
                    })}
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
                      <th style={{ padding: '1rem', textAlign: 'left' }}>İşlem</th>
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
                        <td style={{ padding: '1rem' }}>
                          {userItem.role !== 'admin' && (
                            <button
                              onClick={() => setDeleteConfirm({
                                type: 'user',
                                id: userItem._id || userItem.id,
                                name: `${userItem.firstName} ${userItem.lastName} (${userItem.email})`
                              })}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 'bold'
                              }}
                            >
                              🗑️ Sil
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Order Tracking Tab */}
        {activeTab === 'tracking' && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              {/* Ödeme Arama */}
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>🔍 Iyzico Ödeme Ara</h2>
                {trackingError && (
                  <div style={{
                    background: '#fee',
                    color: '#c33',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    {trackingError}
                  </div>
                )}
                {trackingSuccess && (
                  <div style={{
                    background: '#efe',
                    color: '#3c3',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    {trackingSuccess}
                  </div>
                )}
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  setTrackingError('')
                  setTrackingSuccess('')
                  setTrackingSearchResult(null)
                  setTrackingLoading(true)

                  try {
                    const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
                    const headers = getAuthHeaders()
                    
                    const response = await fetch(`${apiUrl}/order-tracking/search`, {
                      method: 'POST',
                      headers,
                      body: JSON.stringify({
                        conversationId: trackingConversationId || undefined,
                        paymentId: trackingPaymentId || undefined
                      })
                    })

                    const data = await response.json()

                    if (response.ok && data.success) {
                      setTrackingSearchResult(data.payment)
                      setTrackingSuccess('Ödeme bilgisi başarıyla bulundu')
                    } else {
                      setTrackingError(data.message || 'Ödeme bulunamadı')
                    }
                  } catch (err) {
                    console.error('Arama hatası:', err)
                    setTrackingError('Arama yapılırken bir hata oluştu')
                  } finally {
                    setTrackingLoading(false)
                  }
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Payment ID
                    </label>
                    <input
                      type="text"
                      value={trackingPaymentId}
                      onChange={(e) => setTrackingPaymentId(e.target.value)}
                      placeholder="Örn: 12345678"
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
                      Conversation ID
                    </label>
                    <input
                      type="text"
                      value={trackingConversationId}
                      onChange={(e) => setTrackingConversationId(e.target.value)}
                      placeholder="Örn: ORDER-1234567890"
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
                    disabled={trackingLoading || (!trackingPaymentId && !trackingConversationId)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: trackingLoading || (!trackingPaymentId && !trackingConversationId) ? '#ccc' : '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: trackingLoading || (!trackingPaymentId && !trackingConversationId) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {trackingLoading ? 'Aranıyor...' : '🔍 Ara'}
                  </button>
                </form>

                {trackingSearchResult && (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Ödeme Bilgileri</h3>
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
                      <div><strong>Payment ID:</strong> {trackingSearchResult.paymentId}</div>
                      <div><strong>Conversation ID:</strong> {trackingSearchResult.conversationId}</div>
                      <div><strong>Durum:</strong> {trackingSearchResult.paymentStatus}</div>
                      <div><strong>Fiyat:</strong> {trackingSearchResult.paidPrice || trackingSearchResult.price} ₺</div>
                      <div><strong>Tarih:</strong> {trackingSearchResult.createdDate ? new Date(trackingSearchResult.createdDate).toLocaleString('tr-TR') : '-'}</div>
                      {trackingSearchResult.buyer && (
                        <>
                          <div><strong>Müşteri:</strong> {trackingSearchResult.buyer.name} {trackingSearchResult.buyer.surname}</div>
                          <div><strong>E-posta:</strong> {trackingSearchResult.buyer.email}</div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sipariş Senkronizasyonu */}
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>🔄 Sipariş Senkronize Et</h2>
                {trackingError && (
                  <div style={{
                    background: '#fee',
                    color: '#c33',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    {trackingError}
                  </div>
                )}
                {trackingSuccess && (
                  <div style={{
                    background: '#efe',
                    color: '#3c3',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    {trackingSuccess}
                  </div>
                )}
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  setTrackingError('')
                  setTrackingSuccess('')
                  setTrackingSyncResult(null)
                  setTrackingLoading(true)

                  try {
                    const paymentIdsArray = trackingPaymentIds
                      .split(',')
                      .map(id => id.trim())
                      .filter(id => id.length > 0)

                    if (paymentIdsArray.length === 0) {
                      setTrackingError('Lütfen en az bir Payment ID girin')
                      setTrackingLoading(false)
                      return
                    }

                    const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
                    const headers = getAuthHeaders()
                    
                    const response = await fetch(`${apiUrl}/order-tracking/sync`, {
                      method: 'POST',
                      headers,
                      body: JSON.stringify({
                        paymentIds: paymentIdsArray
                      })
                    })

                    const data = await response.json()

                    if (response.ok && data.success) {
                      setTrackingSyncResult(data)
                      setTrackingSuccess(`Başarıyla ${data.summary.synced} sipariş senkronize edildi`)
                      // Siparişleri yeniden yükle
                      setTimeout(() => {
                        if (activeTab === 'orders') {
                          fetchData()
                        }
                      }, 1000)
                    } else {
                      setTrackingError(data.message || 'Senkronizasyon başarısız')
                    }
                  } catch (err) {
                    console.error('Senkronizasyon hatası:', err)
                    setTrackingError('Senkronizasyon yapılırken bir hata oluştu')
                  } finally {
                    setTrackingLoading(false)
                  }
                }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Payment ID'ler (virgülle ayırın)
                    </label>
                    <textarea
                      value={trackingPaymentIds}
                      onChange={(e) => setTrackingPaymentIds(e.target.value)}
                      placeholder="Örn: 12345678, 87654321, 11223344"
                      rows="6"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        resize: 'vertical',
                        fontFamily: 'monospace'
                      }}
                    />
                    <small style={{ color: '#666', fontSize: '0.85rem' }}>
                      Iyzico panelinden aldığınız Payment ID'leri buraya girin (virgülle ayırın)
                    </small>
                  </div>
                  <button
                    type="submit"
                    disabled={trackingLoading || !trackingPaymentIds.trim()}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: trackingLoading || !trackingPaymentIds.trim() ? '#ccc' : '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: trackingLoading || !trackingPaymentIds.trim() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {trackingLoading ? 'Senkronize ediliyor...' : '🔄 Senkronize Et'}
                  </button>
                </form>

                {trackingSyncResult && (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Senkronizasyon Sonucu</h3>
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
                      <div><strong>Toplam:</strong> {trackingSyncResult.summary.total}</div>
                      <div><strong>Senkronize Edilen:</strong> {trackingSyncResult.summary.synced}</div>
                      <div><strong>Atlanan:</strong> {trackingSyncResult.summary.skipped || 0}</div>
                      <div><strong>Hatalar:</strong> {trackingSyncResult.summary.errors}</div>
                      {trackingSyncResult.syncedOrders && trackingSyncResult.syncedOrders.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                          <strong>Senkronize Edilen Siparişler:</strong>
                          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                            {trackingSyncResult.syncedOrders.map((order, index) => (
                              <li key={index} style={{ marginBottom: '0.25rem' }}>
                                Payment: {order.paymentId} - {order.action === 'created' ? '✅ Oluşturuldu' : '🔄 Güncellendi'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bilgilendirme */}
            <div style={{
              background: '#fff3cd',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #ffc107',
              marginTop: '2rem'
            }}>
              <h3 style={{ marginTop: 0, color: '#856404' }}>ℹ️ Nasıl Kullanılır?</h3>
              <ol style={{ color: '#856404', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                <li><strong>Payment ID Bulma:</strong> Iyzico panelinden veya e-posta bildirimlerinden Payment ID'lerinizi alın</li>
                <li><strong>Ödeme Arama:</strong> Payment ID veya Conversation ID ile Iyzico'dan ödeme bilgilerini arayın</li>
                <li><strong>Senkronizasyon:</strong> Payment ID'leri girerek siparişlerinizi veritabanına senkronize edin</li>
                <li><strong>Siparişlerinizi Görüntüleme:</strong> Senkronizasyon sonrası "Siparişler" tab'ından siparişlerinizi görebilirsiniz</li>
              </ol>
              <p style={{ color: '#856404', marginTop: '1rem', marginBottom: 0 }}>
                <strong>Not:</strong> Iyzico API'si tüm ödemeleri otomatik listelemeyi desteklemediği için, 
                Payment ID'leri manuel olarak Iyzico panelinden almanız gerekmektedir.
              </p>
            </div>
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
                    {selectedOrder.orderGroupId && (
                      <div style={{ marginTop: '0.5rem', color: '#667eea', fontSize: '0.9rem' }}>
                        <strong>🔗 Sipariş Grubu:</strong> {selectedOrder.orderGroupId}
                      </div>
                    )}
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

                {/* Birden fazla fotoğraf varsa göster */}
                {selectedOrder.photos && selectedOrder.photos.length > 0 ? (
                  <div>
                    <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
                      Fotoğraflar ({selectedOrder.photos.length} adet)
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      {selectedOrder.photos.map((photo, idx) => (
                        photo?.base64 ? (
                          <div key={idx} style={{ position: 'relative' }}>
                            <img 
                              src={`data:${photo.mimetype || 'image/jpeg'};base64,${photo.base64}`}
                              alt={`Fotoğraf ${idx + 1}`}
                              style={{
                                width: '100%',
                                height: '150px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '2px solid #ddd',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                              onClick={() => {
                                const newWindow = window.open();
                                if (newWindow) {
                                  newWindow.document.write(`
                                    <html>
                                      <head><title>Fotoğraf ${idx + 1} - Sipariş #${selectedOrder._id || selectedOrder.id}</title></head>
                                      <body style="margin:0;padding:20px;background:#f5f5f5;text-align:center;">
                                        <h2>Sipariş #${selectedOrder._id || selectedOrder.id} - Fotoğraf ${idx + 1}</h2>
                                        <img src="data:${photo.mimetype || 'image/jpeg'};base64,${photo.base64}" 
                                             alt="Sipariş fotoğrafı" 
                                             style="max-width:90%;max-height:80vh;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);" />
                                        ${photo.originalName ? `<p><strong>Dosya Adı:</strong> ${photo.originalName}</p>` : ''}
                                      </body>
                                    </html>
                                  `);
                                }
                              }}
                              title="Fotoğrafa tıklayarak büyük görüntüleyin"
                            />
                            {photo.originalName && (
                              <div style={{
                                marginTop: '0.25rem',
                                fontSize: '0.75rem',
                                color: '#666',
                                textAlign: 'center',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {photo.originalName}
                              </div>
                            )}
                          </div>
                        ) : null
                      ))}
                    </div>
                  </div>
                ) : selectedOrder.photo?.base64 && (
                  <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#2c3e50' }}>📸 Sipariş Fotoğrafı</h3>
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
                          // Fotoğrafa tıklanınca büyük görüntüle
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
                      {selectedOrder.photo.size && (
                        <div style={{ marginTop: '0.25rem', color: '#666', fontSize: '0.9rem' }}>
                          <strong>Boyut:</strong> {(selectedOrder.photo.size / 1024).toFixed(2)} KB
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

        {/* Silme Onay Dialogu */}
        {deleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000
          }}
          onClick={() => setDeleteConfirm(null)}
          >
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                fontSize: '3rem',
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                ⚠️
              </div>
              <h2 style={{
                textAlign: 'center',
                marginBottom: '1rem',
                color: '#2c3e50'
              }}>
                Silme İşlemini Onayla
              </h2>
              <p style={{
                textAlign: 'center',
                marginBottom: '2rem',
                color: '#666',
                lineHeight: '1.6'
              }}>
                {deleteConfirm.type === 'order' 
                  ? `Bu siparişi silmek istediğinizden emin misiniz?`
                  : `Bu kullanıcıyı silmek istediğinizden emin misiniz?`}
                <br />
                <strong style={{ color: '#e74c3c' }}>{deleteConfirm.name}</strong>
                <br />
                <span style={{ fontSize: '0.9rem', color: '#999' }}>
                  Bu işlem geri alınamaz!
                </span>
              </p>
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    padding: '0.75rem 2rem',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  İptal
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '0.75rem 2rem',
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  🗑️ Sil
                </button>
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

