import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getDecryptedOrders, clearAllOrders } from '../utils/encryption'

function Admin() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Authentication kontrolü
    const checkAuth = () => {
      const authenticated = sessionStorage.getItem('adminAuthenticated')
      const loginTime = sessionStorage.getItem('adminLoginTime')
      
      // 8 saat (28800000 ms) sonra otomatik çıkış
      const EIGHT_HOURS = 8 * 60 * 60 * 1000
      if (authenticated === 'true' && loginTime) {
        const timeSinceLogin = new Date().getTime() - parseInt(loginTime)
        if (timeSinceLogin < EIGHT_HOURS) {
          setIsAuthenticated(true)
          fetchOrders()
          return
        } else {
          // Süre dolmuş, çıkış yap
          sessionStorage.removeItem('adminAuthenticated')
          sessionStorage.removeItem('adminLoginTime')
        }
      }
      
      // Giriş yapılmamışsa login sayfasına yönlendir
      navigate('/admin/login')
    }
    
    checkAuth()
  }, [navigate])

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated')
    sessionStorage.removeItem('adminLoginTime')
    navigate('/admin/login')
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      // Önce localStorage'dan şifreli siparişleri çöz (sadece admin giriş yapmışsa)
      const localOrders = getDecryptedOrders()
      
      // API'den de siparişleri çekmeyi dene (opsiyonel, sessizce)
      let apiOrders = []
      try {
        const API_URL = import.meta.env.VITE_API_URL || 
          (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
            ? '/api' 
            : 'http://localhost:5000')
        
        // Admin authentication bilgileri
        const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || 'efe'
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '193123'
        const authString = btoa(`${adminUsername}:${adminPassword}`)
        
        const response = await fetch(`${API_URL}/api/orders`, {
          headers: {
            'Authorization': `Basic ${authString}`
          },
          signal: AbortSignal.timeout(3000) // 3 saniye timeout
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            apiOrders = data.orders || []
          }
        }
      } catch (apiErr) {
        // API hatası önemli değil, localStorage'dan devam et (sessizce)
        // Hata mesajı gösterme
      }
      
      // Her iki kaynaktan gelen siparişleri birleştir
      const allOrders = [...localOrders, ...apiOrders]
      
      // ID'ye göre tekilleştir (aynı sipariş iki kere görünmesin)
      const uniqueOrders = []
      const seenIds = new Set()
      
      for (const order of allOrders) {
        const orderId = order._id || order.id
        if (!seenIds.has(orderId)) {
          seenIds.add(orderId)
          uniqueOrders.push(order)
        }
      }
      
      // Tarihe göre sırala (en yeni önce)
      const sortedOrders = uniqueOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0)
        const dateB = new Date(b.createdAt || 0)
        return dateB - dateA
      })
      
      setOrders(sortedOrders)
      
      if (sortedOrders.length === 0) {
        setError(null) // Hata değil, sadece sipariş yok
      }
    } catch (err) {
      console.error('Siparişler yüklenirken hata:', err)
      setError('Siparişler yüklenirken bir hata oluştu: ' + err.message)
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

  // Filtreleme
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

  // İstatistikler
  const totalRevenue = orders.reduce((sum, order) => sum + (order.price || 0), 0)
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length
  const pendingOrders = orders.filter(o => o.paymentStatus === 'pending').length

  // Authentication kontrolü - eğer giriş yapılmamışsa hiçbir şey gösterme
  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2>Siparişler yükleniyor...</h2>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ padding: '2rem' }}>
          <div style={{ 
            background: '#fee', 
            padding: '2rem', 
            borderRadius: '12px',
            color: '#c33',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ marginBottom: '1rem' }}>Hata</h2>
            <p style={{ marginBottom: '2rem' }}>{error}</p>
            <button 
              onClick={fetchOrders} 
              style={{
                padding: '0.75rem 2rem',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              🔄 Tekrar Dene
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '2rem 0', maxWidth: '1400px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#2c3e50' }}>
            📋 Admin Paneli - Siparişler
          </h1>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={fetchOrders}
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
            <button
              onClick={() => {
                if (confirm('Tüm şifreli siparişleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
                  clearAllOrders()
                  fetchOrders()
                  alert('Tüm siparişler temizlendi')
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#f39c12',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              🗑️ localStorage Temizle
            </button>
            <button
              onClick={async () => {
                if (confirm('⚠️ VERİTABANINDAKİ TÜM SİPARİŞLERİ SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ?\n\nBu işlem geri alınamaz ve tüm sipariş kayıtları kalıcı olarak silinecektir!')) {
                  try {
                    const API_URL = import.meta.env.VITE_API_URL || 
                      (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
                        ? '/api' 
                        : 'http://localhost:5000')
                    
                    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || 'efe'
                    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '193123'
                    const authString = btoa(`${adminUsername}:${adminPassword}`)
                    
                    const response = await fetch(`${API_URL}/api/orders/all`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Basic ${authString}`,
                        'Content-Type': 'application/json'
                      }
                    })
                    
                    const data = await response.json()
                    
                    if (data.success) {
                      alert(`✅ ${data.deletedCount} sipariş başarıyla silindi`)
                      fetchOrders()
                    } else {
                      alert(`❌ Hata: ${data.error || data.message || 'Siparişler silinemedi'}`)
                    }
                  } catch (error) {
                    console.error('Sipariş silme hatası:', error)
                    alert(`❌ Hata: ${error.message || 'Siparişler silinirken bir hata oluştu'}`)
                  }
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              🗑️ Veritabanındaki Tüm Siparişleri Sil
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              🚪 Çıkış Yap
            </button>
          </div>
        </div>

        {/* İstatistikler */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Toplam Sipariş</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{orders.length}</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Toplam Gelir</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{formatPrice(totalRevenue)}</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Ödenen</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{paidOrders}</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Bekleyen</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{pendingOrders}</div>
          </div>
        </div>

        {/* Filtreler */}
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

        {filteredOrders.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem',
            background: '#f5f5f5',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
            <h2 style={{ color: '#666' }}>Sipariş bulunamadı</h2>
            <p style={{ color: '#999' }}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Arama kriterlerinize uygun sipariş bulunamadı.' 
                : 'Henüz sipariş bulunmuyor.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              minWidth: '1000px'
            }}>
              <thead>
                <tr style={{ background: '#2c3e50', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Sipariş No</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Müşteri</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>İletişim</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Sipariş Detayları</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Fiyat</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Durum</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Tarih</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Fotoğraf</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr 
                    key={order._id || order.id} 
                    style={{ 
                      borderBottom: '1px solid #eee',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#3498db' }}>
                      #{order._id || order.id}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <strong>{order.customerInfo?.firstName || 'Müşteri'} {order.customerInfo?.lastName || ''}</strong>
                      </div>
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
                      <div style={{ marginTop: '0.25rem', color: '#666' }}>
                        {order.frameType && order.frameType !== 'none' && (
                          <span>🖼️ {order.frameType === 'standard' ? 'Standart' : 'Premium'} Çerçeve</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#27ae60', fontSize: '1.1rem' }}>
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
                      {order.photo?.base64 ? (
                        <img 
                          src={`data:${order.photo.mimetype || 'image/jpeg'};base64,${order.photo.base64}`}
                          alt="Sipariş fotoğrafı"
                          style={{
                            width: '70px',
                            height: '70px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                          onClick={() => setSelectedOrder(order)}
                        />
                      ) : (
                        <span style={{ color: '#999' }}>-</span>
                      )}
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
                    <div><strong>Tarih:</strong> {formatDate(selectedOrder.createdAt)}</div>
                    <div><strong>Boyut:</strong> {
                      selectedOrder.size === 'custom' && selectedOrder.customSize
                        ? `${selectedOrder.customSize.width}x${selectedOrder.customSize.height} cm`
                        : selectedOrder.size || '-'
                    }</div>
                    <div><strong>Adet:</strong> {selectedOrder.quantity || 1}</div>
                    <div><strong>Çerçeve:</strong> {
                      selectedOrder.frameType === 'none' ? 'Çerçevesiz' :
                      selectedOrder.frameType === 'standard' ? 'Standart Çerçeve' :
                      selectedOrder.frameType === 'premium' ? 'Premium Çerçeve' : '-'
                    }</div>
                    <div><strong>Kağıt:</strong> {
                      selectedOrder.paperType === 'glossy' ? 'Parlak' :
                      selectedOrder.paperType === 'matte' ? 'Mat' :
                      selectedOrder.paperType === 'satin' ? 'Saten' : '-'
                    }</div>
                    <div><strong>Renk:</strong> {
                      selectedOrder.colorMode === 'color' ? 'Renkli' :
                      selectedOrder.colorMode === 'blackwhite' ? 'Siyah-Beyaz' :
                      selectedOrder.colorMode === 'sepia' ? 'Sepya' : '-'
                    }</div>
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

export default Admin
