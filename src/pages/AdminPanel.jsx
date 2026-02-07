import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import StarRating from '../components/StarRating'
import GalleryForm from '../components/GalleryForm'
import AnnouncementForm from '../components/AnnouncementForm'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../config/api'

function AdminPanel() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, getAuthHeaders, token } = useAuth()
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [galleries, setGalleries] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedReview, setSelectedReview] = useState(null)
  const [selectedGallery, setSelectedGallery] = useState(null)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [showGalleryForm, setShowGalleryForm] = useState(false)
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [reviewFilter, setReviewFilter] = useState('all')
  const [galleryFilter, setGalleryFilter] = useState('all')
  const [announcementTypeFilter, setAnnouncementTypeFilter] = useState('all')
  const [announcementStatusFilter, setAnnouncementStatusFilter] = useState('all')
  
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
  
  // Rol güncelleme (Admin yap / Admin kaldır)
  const [roleUpdateLoading, setRoleUpdateLoading] = useState(null) // userId veya null
  
  // Veritabanı temizleme
  const [clearDatabaseLoading, setClearDatabaseLoading] = useState(false)
  const [clearDatabaseConfirm, setClearDatabaseConfirm] = useState(false)
  
  // Sipariş durumu güncelleme için state
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    status: '',
    trackingNumber: '',
    shippingCompany: ''
  })
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)

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
      
      // API request log kaldırıldı (gereksiz)

      if (activeTab === 'orders') {
        const response = await fetch(`${apiUrl}/admin/orders`, { headers })
        const data = await response.json()
        
        // Kısa log - base64 içermiyor
        if (data.success) {
          console.log('✅ Siparişler:', data.orders?.length || 0, 'adet')
        } else {
          console.warn('⚠️ Siparişler alınamadı:', data.message || data.error)
        }
        
        // Eğer rawCount undefined ise, backend'de bir sorun var
        if (data.rawCount === undefined) {
          console.error('❌ Backend rawCount eksik')
        }
        
        if (response.ok) {
          if (data.success) {
            setOrders(data.orders || [])
            
            // Eğer sipariş yoksa logla
            if (!data.orders || data.orders.length === 0) {
              console.warn('⚠️ Sipariş bulunamadı')
            }
          } else {
            console.error('❌ Hata:', data.message || data.error)
            throw new Error(data.message || 'Siparişler yüklenemedi')
          }
        } else {
          console.error('❌ Hata:', response.status, data.message || data.error)
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
          console.error('❌ Users hatası:', response.status, data.message || data.error)
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
          console.error('❌ Stats hatası:', response.status, data.message || data.error)
          throw new Error(data.message || data.error || 'İstatistikler yüklenemedi')
        }
      } else if (activeTab === 'reviews') {
        const response = await fetch(`${apiUrl}/reviews/admin/all`, { headers })
        const data = await response.json()
        
        if (response.ok && data.success) {
          setReviews(data.reviews || [])
        } else {
          throw new Error(data.message || 'Yorumlar yüklenemedi')
        }
      } else if (activeTab === 'gallery') {
        const filter = galleryFilter !== 'all' ? `?category=${galleryFilter}` : ''
        const response = await fetch(`${apiUrl}/gallery/admin/all${filter}`, { headers })
        const data = await response.json()
        
        if (response.ok && data.success) {
          setGalleries(data.galleries || [])
        } else {
          throw new Error(data.message || 'Galeri yüklenemedi')
        }
      } else if (activeTab === 'announcements') {
        const typeFilter = announcementTypeFilter !== 'all' ? `?type=${announcementTypeFilter}` : ''
        const statusFilter = announcementStatusFilter !== 'all' ? `${typeFilter ? '&' : '?'}isActive=${announcementStatusFilter === 'active'}` : ''
        const response = await fetch(`${apiUrl}/announcements/admin/all${typeFilter}${statusFilter}`, { headers })
        const data = await response.json()
        
        if (response.ok && data.success) {
          setAnnouncements(data.announcements || [])
        } else {
          throw new Error(data.message || 'Popup\'lar yüklenemedi')
        }
      }
    } catch (err) {
      console.error('❌ Veri yükleme hatası:', err.message)
      
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
                    console.error('❌ Silme hatası:', err.message)
      setError('Silme işlemi sırasında bir hata oluştu')
      setDeleteConfirm(null)
    }
  }

  // Kullanıcı rolü güncelle (Admin yap / Admin kaldır)
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      setRoleUpdateLoading(userId)
      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      const headers = getAuthHeaders()
      const response = await fetch(`${apiUrl}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setUsers(prev => prev.map(u => (u._id === userId || u.id === userId) ? { ...u, role: newRole } : u))
        setError(null)
      } else {
        setError(data.message || data.error || 'Rol güncellenemedi')
      }
    } catch (err) {
      console.error('❌ Rol güncelleme hatası:', err.message)
      setError('Rol güncellenirken bir hata oluştu')
    } finally {
      setRoleUpdateLoading(null)
    }
  }

  // Veritabanını temizle
  const handleClearDatabase = async () => {
    if (!clearDatabaseConfirm) {
      setClearDatabaseConfirm(true)
      return
    }
    
    try {
      setClearDatabaseLoading(true)
      setError(null)
      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      const headers = getAuthHeaders()
      const response = await fetch(`${apiUrl}/admin/database/clear`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'TEMIZLE' })
      })
      const data = await response.json()
      if (response.ok && data.success) {
        alert(`✅ Veritabanı temizlendi!\n\nSilinen:\n- ${data.deleted.orders} sipariş\n- ${data.deleted.users} kullanıcı\n- ${data.deleted.galleries} galeri\n- ${data.deleted.categories} kategori\n- ${data.deleted.reviews} yorum\n- ${data.deleted.announcements} duyuru`)
        setClearDatabaseConfirm(false)
        await fetchData()
      } else {
        setError(data.message || data.error || 'Veritabanı temizlenemedi')
        setClearDatabaseConfirm(false)
      }
    } catch (err) {
      console.error('❌ Veritabanı temizleme hatası:', err.message)
      setError('Veritabanı temizlenirken bir hata oluştu')
      setClearDatabaseConfirm(false)
    } finally {
      setClearDatabaseLoading(false)
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
              <Icon name="shield" size={18} /> Admin Paneli
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
              Yenile
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
            <Icon name="cart" size={16} /> Siparişler ({orders.length})
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
            <Icon name="user" size={16} /> Kullanıcılar ({users.length})
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
            <Icon name="chart" size={16} /> İstatistikler
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
            Sipariş Takibi
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'reviews' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'reviews' ? '#000000' : '#666',
              border: 'none',
              borderBottom: activeTab === 'reviews' ? '3px solid #000000' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}
          >
            <Icon name="check-circle" size={16} /> Yorumlar ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'gallery' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'gallery' ? '#000000' : '#666',
              border: 'none',
              borderBottom: activeTab === 'gallery' ? '3px solid #000000' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}
          >
            <Icon name="image" size={16} /> Ürünler ({galleries.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'announcements' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'announcements' ? '#000000' : '#666',
              border: 'none',
              borderBottom: activeTab === 'announcements' ? '3px solid #000000' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}
          >
            <Icon name="megaphone" size={16} /> Popup'lar ({announcements.length})
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
                placeholder="Sipariş ID, E-posta veya Telefon ile ara..."
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
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                  <Icon name="clock" size={32} />
                </div>
                <h2>Siparişler yükleniyor...</h2>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem',
                background: 'var(--bg-light)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                  <Icon name="mail" size={32} />
                </div>
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
                      Tekrar Dene
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
                                <Icon name="link" size={14} /> Sipariş Grubu: {order.orderGroupId} 
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
                                  <Icon name="link" size={12} /> {order.orderGroupId?.substring(0, 12)}...
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Icon name="mail" size={14} /> {order.customerInfo?.email || '-'}
                          </div>
                          {order.customerInfo?.phone && (
                            <div style={{ color: '#666', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Icon name="phone" size={14} /> {order.customerInfo.phone}
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
                              {order.paymentStatus === 'paid' ? 'Ödendi' : 
                               order.paymentStatus === 'failed' ? 'Başarısız' :
                               order.paymentStatus === 'cancelled' ? 'İptal Edildi' :
                               'Bekliyor'}
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
                              Detay
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
                              <Icon name="trash" size={14} /> Sil
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
                placeholder="E-posta, Ad, Soyad veya Telefon ile ara..."
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
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                  <Icon name="clock" size={32} />
                </div>
                <h2>Kullanıcılar yükleniyor...</h2>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem',
                background: '#f5f5f5',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                  <Icon name="user" size={32} />
                </div>
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
                            {userItem.role === 'admin' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Icon name="shield" size={14} /> Admin
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Icon name="user" size={14} /> Kullanıcı
                              </span>
                            )}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {userItem.role === 'admin' ? (
                            <button
                              onClick={() => handleRoleUpdate(userItem._id || userItem.id, 'user')}
                              disabled={roleUpdateLoading === (userItem._id || userItem.id)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: roleUpdateLoading === (userItem._id || userItem.id) ? '#ccc' : '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: roleUpdateLoading ? 'not-allowed' : 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {roleUpdateLoading === (userItem._id || userItem.id) ? '...' : <><Icon name="user" size={14} /> Admin kaldır</>}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleUpdate(userItem._id || userItem.id, 'admin')}
                              disabled={roleUpdateLoading === (userItem._id || userItem.id)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: roleUpdateLoading === (userItem._id || userItem.id) ? '#ccc' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: roleUpdateLoading ? 'not-allowed' : 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {roleUpdateLoading === (userItem._id || userItem.id) ? '...' : <><Icon name="shield" size={14} /> Admin yap</>}
                            </button>
                          )}
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
                              <Icon name="trash" size={14} /> Sil
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
                <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon name="search" size={18} /> Iyzico Ödeme Ara
                </h2>
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
                    console.error('❌ Arama hatası:', err.message)
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
                    {trackingLoading ? 'Aranıyor...' : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Icon name="search" size={14} /> Ara
                      </span>
                    )}
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
                <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Sipariş Senkronize Et</h2>
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
                    console.error('❌ Senkronizasyon hatası:', err.message)
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
                    {trackingLoading ? 'Senkronize ediliyor...' : 'Senkronize Et'}
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
                                Payment: {order.paymentId} - {order.action === 'created' ? 'Oluşturuldu' : 'Güncellendi'}
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
              <h3 style={{ marginTop: 0, color: '#856404' }}>Nasıl Kullanılır?</h3>
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
        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <>
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <select
                value={reviewFilter}
                onChange={(e) => {
                  setReviewFilter(e.target.value)
                  fetchData()
                }}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="all">Tümü</option>
                <option value="pending">Onay Bekleyenler</option>
                <option value="approved">Onaylananlar</option>
                <option value="rejected">Reddedilenler</option>
              </select>
            </div>

            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Yorum bulunmamaktadır.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: review.isApproved ? '2px solid #10b981' : '2px solid #f59e0b'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                          {review.userName}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                          {review.userEmail}
                        </div>
                        <div style={{ fontSize: '1.5rem', color: '#fbbf24' }}>
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          background: review.isApproved ? '#d1fae5' : '#fef3c7',
                          color: review.isApproved ? '#065f46' : '#92400e',
                          marginBottom: '0.5rem',
                          display: 'inline-block'
                        }}>
                          {review.isApproved ? 'Onaylandı' : 'Onay Bekliyor'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>
                    <p style={{ color: '#333', lineHeight: '1.8', marginBottom: '1rem' }}>
                      {review.comment}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!review.isApproved && (
                        <button
                          onClick={async () => {
                            try {
                              const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
                              const headers = getAuthHeaders()
                              const response = await fetch(`${apiUrl}/reviews/admin/${review._id}/approve`, {
                                method: 'PATCH',
                                headers: {
                                  ...headers,
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ isApproved: true, isVisible: true })
                              })
                              const data = await response.json()
                              if (data.success) {
                                alert('Yorum onaylandı')
                                fetchData()
                              }
                            } catch (error) {
                              console.error('Yorum onaylama hatası:', error)
                            }
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          Onayla
                        </button>
                      )}
                      {review.isApproved && (
                        <button
                          onClick={async () => {
                            try {
                              const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
                              const headers = getAuthHeaders()
                              const response = await fetch(`${apiUrl}/reviews/admin/${review._id}/approve`, {
                                method: 'PATCH',
                                headers: {
                                  ...headers,
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ isApproved: false, isVisible: false })
                              })
                              const data = await response.json()
                              if (data.success) {
                                alert('Yorum reddedildi')
                                fetchData()
                              }
                            } catch (error) {
                              console.error('Yorum reddetme hatası:', error)
                            }
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          Reddet
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          if (confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
                            try {
                              const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
                              const headers = getAuthHeaders()
                              const response = await fetch(`${apiUrl}/reviews/admin/${review._id}`, {
                                method: 'DELETE',
                                headers
                              })
                              const data = await response.json()
                              if (data.success) {
                                alert('Yorum silindi')
                                fetchData()
                              }
                            } catch (error) {
                              console.error('Yorum silme hatası:', error)
                            }
                          }
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <>
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <select
                value={galleryFilter}
                onChange={(e) => {
                  setGalleryFilter(e.target.value)
                  fetchData()
                }}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="10x15">10x15 cm</option>
                <option value="15x20">15x20 cm</option>
                <option value="20x30">20x30 cm</option>
                <option value="30x40">30x40 cm</option>
                <option value="30x45">30x45 cm</option>
                <option value="40x50">40x50 cm</option>
                <option value="50x70">50x70 cm</option>
                <option value="70x100">70x100 cm</option>
                <option value="custom">Özel Boyut</option>
              </select>
              <button
                onClick={() => {
                  setSelectedGallery(null)
                  setShowGalleryForm(true)
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
                Yeni Ürün Ekle
              </button>
            </div>

            {/* Galeri Form Modal */}
            {showGalleryForm && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '2rem'
              }}
              onClick={() => {
                setShowGalleryForm(false)
                setSelectedGallery(null)
              }}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '2rem',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 style={{ marginTop: 0 }}>
                    {selectedGallery ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                  </h2>
                  <GalleryForm
                    gallery={selectedGallery}
                    onSuccess={() => {
                      setShowGalleryForm(false)
                      setSelectedGallery(null)
                      fetchData()
                    }}
                    onCancel={() => {
                      setShowGalleryForm(false)
                      setSelectedGallery(null)
                    }}
                  />
                </div>
              </div>
            )}

            {galleries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Henüz ürün yok.</p>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>Yukarıdaki &quot;Yeni Ürün Ekle&quot; butonu ile ürün ekleyebilirsiniz.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                {galleries.map((gallery) => (
                  <div
                    key={gallery._id}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: gallery.isVisible ? '2px solid #10b981' : '2px solid #f59e0b'
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '200px',
                      overflow: 'hidden',
                      background: '#f3f4f6'
                    }}>
                      {gallery.image?.base64 && (
                        <img
                          src={`data:${gallery.image.mimetype || 'image/jpeg'};base64,${gallery.image.base64}`}
                          alt={gallery.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      )}
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                        {gallery.title}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                        <div>Kategori: {gallery.category}</div>
                        <div>Boyut: {gallery.size}</div>
                        <div>Görünür: {gallery.isVisible ? 'Evet' : 'Hayır'}</div>
                        <div>Öne Çıkan: {gallery.isFeatured ? 'Evet' : 'Hayır'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setSelectedGallery(gallery)
                            setShowGalleryForm(true)
                          }}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Bu galeri öğesini silmek istediğinizden emin misiniz?')) {
                              try {
                                const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
                                const headers = getAuthHeaders()
                                const response = await fetch(`${apiUrl}/gallery/admin/${gallery._id}`, {
                                  method: 'DELETE',
                                  headers
                                })
                                const data = await response.json()
                                if (data.success) {
                                  alert('Galeri öğesi silindi')
                                  fetchData()
                                }
                              } catch (error) {
                                console.error('Galeri silme hatası:', error)
                              }
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'stats' && stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'var(--bg-color)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow)'
            }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-light)' }}>
                <Icon name="user" size={24} />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Toplam Kullanıcı</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalUsers || 0}</div>
            </div>
            
            <div style={{
              background: 'var(--bg-color)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow)'
            }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-light)' }}>
                <Icon name="cart" size={24} />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Toplam Sipariş</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalOrders || 0}</div>
            </div>
            
            <div style={{
              background: 'var(--bg-color)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow)'
            }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-light)' }}>
                <Icon name="card" size={24} />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Toplam Gelir</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{formatPrice(stats.totalRevenue || 0)}</div>
            </div>
            
            <div style={{
              background: 'var(--bg-color)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow)'
            }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-light)' }}>
                <Icon name="check" size={24} />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Ödenen Sipariş</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.paidOrders || 0}</div>
            </div>
            
            <div style={{
              background: 'var(--bg-color)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow)'
            }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-light)' }}>
                <Icon name="clock" size={24} />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Bekleyen Sipariş</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.pendingOrders || 0}</div>
            </div>
            
            <div style={{
              background: 'var(--bg-color)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow)'
            }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-light)' }}>
                <Icon name="clock" size={24} />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Son 30 Gün Sipariş</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.recentOrders || 0}</div>
            </div>
            
            <div style={{
              background: 'var(--bg-color)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow)'
            }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-light)' }}>
                <Icon name="user" size={24} />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Son 30 Gün Yeni Kullanıcı</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.recentUsers || 0}</div>
            </div>
          </div>
        )}

        {/* Veritabanı Temizleme - İstatistikler sekmesinde */}
        {activeTab === 'stats' && (
          <div style={{
            background: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '12px',
            padding: '2rem',
            marginTop: '2rem'
          }}>
            <h3 style={{ marginTop: 0, color: '#856404', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="alert-triangle" size={20} /> Veritabanı Yönetimi
            </h3>
            <p style={{ color: '#856404', marginBottom: '1rem' }}>
              ⚠️ <strong>DİKKAT:</strong> Bu işlem tüm verileri siler (siparişler, kullanıcılar, galeri, kategoriler, yorumlar, duyurular). Bu işlem geri alınamaz!
            </p>
            {clearDatabaseConfirm ? (
              <div>
                <p style={{ color: '#dc3545', fontWeight: 'bold', marginBottom: '1rem' }}>
                  Son onay: Veritabanını temizlemek istediğinizden emin misiniz?
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={handleClearDatabase}
                    disabled={clearDatabaseLoading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: clearDatabaseLoading ? '#ccc' : '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: clearDatabaseLoading ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {clearDatabaseLoading ? 'Temizleniyor...' : '✅ Evet, Temizle'}
                  </button>
                  <button
                    onClick={() => setClearDatabaseConfirm(false)}
                    disabled={clearDatabaseLoading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: clearDatabaseLoading ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setClearDatabaseConfirm(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Icon name="trash" size={16} /> Veritabanını Temizle
              </button>
            )}
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
                        <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Icon name="link" size={14} /> Sipariş Grubu:
                        </strong> {selectedOrder.orderGroupId}
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
                    <div><strong>Durum:</strong> {selectedOrder.status || 'Bekliyor'}</div>
                    {selectedOrder.trackingNumber && (
                      <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: '6px' }}>
                        <strong>Kargo Takip:</strong> {selectedOrder.trackingNumber}
                        {selectedOrder.shippingCompany && ` (${selectedOrder.shippingCompany})`}
                      </div>
                    )}
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

                {/* Sipariş Durumu Güncelleme Formu */}
                <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '2px solid #667eea' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon name="refresh-cw" size={18} /> Sipariş Durumu Güncelle
                  </h3>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    setStatusUpdateLoading(true)
                    try {
                      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
                      const headers = getAuthHeaders()
                      
                      // Form değerlerini kullan, yoksa mevcut değerleri kullan
                      const updateData = {
                        status: statusUpdateForm.status || selectedOrder.status || 'Bekliyor'
                      }
                      
                      // Kargo takip numarası varsa ekle
                      if (statusUpdateForm.trackingNumber) {
                        updateData.trackingNumber = statusUpdateForm.trackingNumber
                      } else if (selectedOrder.trackingNumber) {
                        updateData.trackingNumber = selectedOrder.trackingNumber
                      }
                      
                      // Kargo firması varsa ekle
                      if (statusUpdateForm.shippingCompany) {
                        updateData.shippingCompany = statusUpdateForm.shippingCompany
                      } else if (selectedOrder.shippingCompany) {
                        updateData.shippingCompany = selectedOrder.shippingCompany
                      }
                      
                      const response = await fetch(`${apiUrl}/orders/${selectedOrder._id || selectedOrder.id}/status`, {
                        method: 'PATCH',
                        headers: {
                          ...headers,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updateData)
                      })

                      const data = await response.json()

                      if (response.ok && data.success) {
                        alert('Sipariş durumu başarıyla güncellendi!')
                        setSelectedOrder(null)
                        fetchData()
                      } else {
                        alert(data.message || 'Sipariş durumu güncellenemedi')
                      }
                    } catch (error) {
                      console.error('Sipariş durumu güncelleme hatası:', error)
                      alert('Sipariş durumu güncellenirken bir hata oluştu')
                    } finally {
                      setStatusUpdateLoading(false)
                    }
                  }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Sipariş Durumu
                      </label>
                      <select
                        value={statusUpdateForm.status || selectedOrder.status || 'Bekliyor'}
                        onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, status: e.target.value })}
                        onFocus={() => {
                          if (!statusUpdateForm.status) {
                            setStatusUpdateForm({
                              ...statusUpdateForm,
                              status: selectedOrder.status || 'Bekliyor',
                              trackingNumber: selectedOrder.trackingNumber || '',
                              shippingCompany: selectedOrder.shippingCompany || ''
                            })
                          }
                        }}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      >
                        <option value="Bekliyor">Bekliyor</option>
                        <option value="Alındı">Alındı</option>
                        <option value="Basıldı">Basıldı</option>
                        <option value="Kargoya Verildi">Kargoya Verildi</option>
                        <option value="Teslim Edildi">Teslim Edildi</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Kargo Takip Numarası (Opsiyonel)
                      </label>
                      <input
                        type="text"
                        value={statusUpdateForm.trackingNumber || selectedOrder.trackingNumber || ''}
                        onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, trackingNumber: e.target.value })}
                        placeholder="Örn: TR1234567890"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Kargo Firması (Opsiyonel)
                      </label>
                      <select
                        value={statusUpdateForm.shippingCompany || selectedOrder.shippingCompany || ''}
                        onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, shippingCompany: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      >
                        <option value="">Seçiniz</option>
                        <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                        <option value="Aras Kargo">Aras Kargo</option>
                        <option value="MNG Kargo">MNG Kargo</option>
                        <option value="PTT Kargo">PTT Kargo</option>
                        <option value="Sürat Kargo">Sürat Kargo</option>
                        <option value="UPS Kargo">UPS Kargo</option>
                        <option value="DHL">DHL</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={statusUpdateLoading}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: statusUpdateLoading ? '#ccc' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: statusUpdateLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {statusUpdateLoading ? 'Güncelleniyor...' : 'Durumu Güncelle'}
                    </button>
                  </form>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setSelectedOrder(null)
                      setStatusUpdateForm({ status: '', trackingNumber: '', shippingCompany: '' })
                    }}
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

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <>
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <select
                  value={announcementTypeFilter}
                  onChange={(e) => {
                    setAnnouncementTypeFilter(e.target.value)
                    fetchData()
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="all">Tüm Tipler</option>
                  <option value="campaign">Kampanya</option>
                  <option value="new_product">Yeni Ürün</option>
                  <option value="special_offer">Özel Teklif</option>
                  <option value="info">Bilgi</option>
                </select>
                <select
                  value={announcementStatusFilter}
                  onChange={(e) => {
                    setAnnouncementStatusFilter(e.target.value)
                    fetchData()
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setSelectedAnnouncement(null)
                  setShowAnnouncementForm(true)
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Icon name="plus" size={16} />
                Yeni Popup Ekle
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Yükleniyor...</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                {announcements.map(announcement => {
                    const style = {
                      campaign: { bg: '#667eea', icon: 'megaphone' },
                      new_product: { bg: '#10b981', icon: 'plus' },
                      special_offer: { bg: '#f59e0b', icon: 'alert-circle' },
                      info: { bg: '#3b82f6', icon: 'info' }
                    }[announcement.type] || { bg: '#667eea', icon: 'info' }

                    return (
                      <div
                        key={announcement._id || announcement.id}
                        style={{
                          background: 'white',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          border: `2px solid ${announcement.isActive ? style.bg : '#d1d5db'}`,
                          opacity: announcement.isActive ? 1 : 0.7
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '1rem'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.5rem'
                            }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: style.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                              }}>
                                <Icon name={style.icon} size={16} />
                              </div>
                              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1f2937' }}>
                                {announcement.title}
                              </h3>
                            </div>
                            <p style={{
                              margin: '0.5rem 0',
                              fontSize: '0.9rem',
                              color: '#6b7280',
                              lineHeight: '1.5'
                            }}>
                              {announcement.message}
                            </p>
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.5rem',
                              marginTop: '1rem',
                              fontSize: '0.85rem',
                              color: '#9ca3af'
                            }}>
                              <span>Tip: {announcement.type}</span>
                              <span>•</span>
                              <span>Görüntülenme: {announcement.viewCount || 0}</span>
                              <span>•</span>
                              <span>Tıklama: {announcement.clickCount || 0}</span>
                            </div>
                            {announcement.startDate && (
                              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#9ca3af' }}>
                                {new Date(announcement.startDate).toLocaleDateString('tr-TR')}
                                {announcement.endDate && ` - ${new Date(announcement.endDate).toLocaleDateString('tr-TR')}`}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginTop: '1rem'
                        }}>
                          <button
                            onClick={() => {
                              setSelectedAnnouncement(announcement)
                              setShowAnnouncementForm(true)
                            }}
                            style={{
                              flex: 1,
                              padding: '0.5rem 1rem',
                              background: '#f3f4f6',
                              color: '#374151',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <Icon name="edit" size={14} /> Düzenle
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Bu popup\'ı silmek istediğinizden emin misiniz?')) {
                                try {
                                  const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
                                  const headers = getAuthHeaders()
                                  const response = await fetch(`${apiUrl}/announcements/admin/${announcement._id || announcement.id}`, {
                                    method: 'DELETE',
                                    headers
                                  })
                                  const data = await response.json()
                                  if (data.success) {
                                    await fetchData()
                                  } else {
                                    setError(data.message || 'Silme başarısız')
                                  }
                                } catch (error) {
                                  setError('Silme hatası: ' + error.message)
                                }
                              }
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}

            {/* Announcement Form Modal */}
            {showAnnouncementForm && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '1rem',
                overflow: 'auto'
              }}
              onClick={() => {
                setShowAnnouncementForm(false)
                setSelectedAnnouncement(null)
              }}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    maxWidth: '800px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <h2 style={{ margin: 0 }}>
                      {selectedAnnouncement ? 'Popup Düzenle' : 'Yeni Popup Oluştur'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowAnnouncementForm(false)
                        setSelectedAnnouncement(null)
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '8px'
                      }}
                    >
                      <Icon name="close" size={24} />
                    </button>
                  </div>

                  <AnnouncementForm
                    announcement={selectedAnnouncement}
                    onSave={async (formData) => {
                      try {
                        const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
                        const headers = getAuthHeaders()
                        
                        let response
                        if (selectedAnnouncement) {
                          // Update
                          response = await fetch(`${apiUrl}/announcements/admin/${selectedAnnouncement._id || selectedAnnouncement.id}`, {
                            method: 'PUT',
                            headers: {
                              ...headers,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(formData)
                          })
                        } else {
                          // Create
                          response = await fetch(`${apiUrl}/announcements/admin`, {
                            method: 'POST',
                            headers: {
                              ...headers,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(formData)
                          })
                        }

                        const data = await response.json()
                        if (data.success) {
                          setShowAnnouncementForm(false)
                          setSelectedAnnouncement(null)
                          await fetchData()
                        } else {
                          setError(data.message || 'Kayıt başarısız')
                        }
                      } catch (error) {
                        setError('Kayıt hatası: ' + error.message)
                      }
                    }}
                    onCancel={() => {
                      setShowAnnouncementForm(false)
                      setSelectedAnnouncement(null)
                    }}
                  />
                </div>
              </div>
            )}
          </>
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
                !
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
                  <Icon name="trash" size={14} /> Sil
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

