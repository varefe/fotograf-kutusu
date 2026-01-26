import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../config/api'

function OrderTracking() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading, getAuthHeaders } = useAuth()
  const [paymentIds, setPaymentIds] = useState('')
  const [conversationId, setConversationId] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [syncResult, setSyncResult] = useState(null)

  // Kullanıcı giriş kontrolü
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

  if (!isAuthenticated) {
    navigate('/login', { 
      state: { 
        from: '/order-tracking',
        message: 'Sipariş takibi için lütfen giriş yapın.'
      } 
    })
    return null
  }

  // Iyzico'dan ödeme arama
  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSearchResult(null)
    setLoading(true)

    try {
      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      const headers = getAuthHeaders()
      
      const response = await fetch(`${apiUrl}/order-tracking/search`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          conversationId: conversationId || undefined,
          paymentId: paymentId || undefined
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSearchResult(data.payment)
        setSuccess('Ödeme bilgisi başarıyla bulundu')
      } else {
        setError(data.message || 'Ödeme bulunamadı')
      }
    } catch (err) {
      console.error('Arama hatası:', err)
      setError('Arama yapılırken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // Iyzico'dan sipariş senkronizasyonu
  const handleSync = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSyncResult(null)
    setLoading(true)

    try {
      // Payment ID'leri parse et
      const paymentIdsArray = paymentIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0)

      if (paymentIdsArray.length === 0) {
        setError('Lütfen en az bir Payment ID girin')
        setLoading(false)
        return
      }

      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      const headers = getAuthHeaders()
      
      const response = await fetch(`${apiUrl}/order-tracking/sync-user-orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          paymentIds: paymentIdsArray
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSyncResult(data)
        setSuccess(`Başarıyla ${data.summary.synced} sipariş senkronize edildi`)
        // Siparişleri yeniden yükle
        setTimeout(() => {
          navigate('/profile?tab=orders')
        }, 2000)
      } else {
        setError(data.message || 'Senkronizasyon başarısız')
      }
    } catch (err) {
      console.error('Senkronizasyon hatası:', err)
      setError('Senkronizasyon yapılırken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem 0', minHeight: '70vh' }}>
        <div className="container">
          <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
            <Icon name="cart" size={16} /> Sipariş Takibi
          </h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Iyzico'dan siparişlerinizi takip edin ve veritabanına senkronize edin.
          </p>

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
              <h2 style={{ marginBottom: '1.5rem' }}>🔍 Ödeme Ara</h2>
              <form onSubmit={handleSearch}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Payment ID
                  </label>
                  <input
                    type="text"
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
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
                    value={conversationId}
                    onChange={(e) => setConversationId(e.target.value)}
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
                  disabled={loading || (!paymentId && !conversationId)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: loading || (!paymentId && !conversationId) ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: loading || (!paymentId && !conversationId) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Aranıyor...' : '🔍 Ara'}
                </button>
              </form>

              {searchResult && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Ödeme Bilgileri</h3>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
                    <div><strong>Payment ID:</strong> {searchResult.paymentId}</div>
                    <div><strong>Conversation ID:</strong> {searchResult.conversationId}</div>
                    <div><strong>Durum:</strong> {searchResult.paymentStatus}</div>
                    <div><strong>Fiyat:</strong> {searchResult.paidPrice || searchResult.price} ₺</div>
                    <div><strong>Tarih:</strong> {searchResult.createdDate ? new Date(searchResult.createdDate).toLocaleString('tr-TR') : '-'}</div>
                    {searchResult.buyer && (
                      <>
                        <div><strong>Müşteri:</strong> {searchResult.buyer.name} {searchResult.buyer.surname}</div>
                        <div><strong>E-posta:</strong> {searchResult.buyer.email}</div>
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
              <h2 style={{ marginBottom: '1.5rem' }}>Sipariş Senkronize Et</h2>
              <form onSubmit={handleSync}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Payment ID'ler (virgülle ayırın)
                  </label>
                  <textarea
                    value={paymentIds}
                    onChange={(e) => setPaymentIds(e.target.value)}
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
                  disabled={loading || !paymentIds.trim()}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: loading || !paymentIds.trim() ? '#ccc' : '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: loading || !paymentIds.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Senkronize ediliyor...' : 'Senkronize Et'}
                </button>
              </form>

              {syncResult && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Senkronizasyon Sonucu</h3>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
                    <div><strong>Toplam:</strong> {syncResult.summary.total}</div>
                    <div><strong>Senkronize Edilen:</strong> {syncResult.summary.synced}</div>
                    <div><strong>Hatalar:</strong> {syncResult.summary.errors}</div>
                    {syncResult.syncedOrders && syncResult.syncedOrders.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <strong>Senkronize Edilen Siparişler:</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                          {syncResult.syncedOrders.map((order, index) => (
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
            <h3 style={{ marginTop: 0, color: '#856404' }}>ℹ️ Nasıl Kullanılır?</h3>
            <ol style={{ color: '#856404', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
              <li><strong>Payment ID Bulma:</strong> Iyzico panelinden veya e-posta bildirimlerinden Payment ID'lerinizi alın</li>
              <li><strong>Ödeme Arama:</strong> Payment ID veya Conversation ID ile Iyzico'dan ödeme bilgilerini arayın</li>
              <li><strong>Senkronizasyon:</strong> Payment ID'leri girerek siparişlerinizi veritabanına senkronize edin</li>
              <li><strong>Siparişlerinizi Görüntüleme:</strong> Senkronizasyon sonrası profil sayfasından siparişlerinizi görebilirsiniz</li>
            </ol>
            <p style={{ color: '#856404', marginTop: '1rem', marginBottom: 0 }}>
              <strong>Not:</strong> Iyzico API'si tüm ödemeleri otomatik listelemeyi desteklemediği için, 
              Payment ID'leri manuel olarak Iyzico panelinden almanız gerekmektedir.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default OrderTracking
