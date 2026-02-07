import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import Icon from '../components/Icon'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../config/api'
import { initializePushNotifications, unsubscribeFromPush } from '../utils/pushNotification'

function NotificationSettings() {
  const { user, isAuthenticated, getAuthHeaders } = useAuth()
  const [preferences, setPreferences] = useState({
    email: {
      orderStatus: true,
      orderShipped: true,
      orderDelivered: true,
      promotions: true,
      newsletter: false
    },
    sms: {
      orderStatus: false,
      orderShipped: false,
      orderDelivered: false
    },
    push: {
      enabled: true,
      orderStatus: true,
      promotions: true
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pushSupported, setPushSupported] = useState(false)
  const [pushSubscribed, setPushSubscribed] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadPreferences()
      checkPushSupport()
    }
  }, [isAuthenticated])

  const checkPushSupport = () => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
    setPushSupported(supported)
  }

  const loadPreferences = async () => {
    try {
      setLoading(true)
      let apiUrl = API_URL
      if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
        apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      } else {
        apiUrl = API_URL.startsWith('/api') ? API_URL : `${API_URL}/api`
      }
      const headers = getAuthHeaders()
      const response = await fetch(`${apiUrl}/notifications/preferences`, { headers })
      const data = await response.json()

      if (data.success) {
        setPreferences(data.preferences)
        // Push subscription durumunu kontrol et
        if (data.preferences.push?.enabled) {
          setPushSubscribed(true)
        }
      }
    } catch (error) {
      console.error('Bildirim tercihleri yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      let apiUrl = API_URL
      if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
        apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      } else {
        apiUrl = API_URL.startsWith('/api') ? API_URL : `${API_URL}/api`
      }
      const headers = getAuthHeaders()
      const response = await fetch(`${apiUrl}/notifications/preferences`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Bildirim tercihleri güncellendi')
        setPreferences(data.preferences)
      } else {
        setError(data.error || 'Tercihler güncellenemedi')
      }
    } catch (error) {
      console.error('Tercih güncelleme hatası:', error)
      setError('Tercihler güncellenirken bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handlePushSubscribe = async () => {
    try {
      let apiUrl = API_URL
      if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
        apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      } else {
        apiUrl = API_URL.startsWith('/api') ? API_URL : `${API_URL}/api`
      }
      const result = await initializePushNotifications(apiUrl, getAuthHeaders)
      
      if (result.success) {
        setPushSubscribed(true)
        setPreferences(prev => ({
          ...prev,
          push: { ...prev.push, enabled: true }
        }))
        setSuccess('Push bildirimleri aktif edildi')
      } else {
        setError(result.error || 'Push bildirimleri aktif edilemedi')
      }
    } catch (error) {
      console.error('Push subscription hatası:', error)
      setError('Push bildirimleri aktif edilirken bir hata oluştu')
    }
  }

  const handlePushUnsubscribe = async () => {
    try {
      let apiUrl = API_URL
      if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
        apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      } else {
        apiUrl = API_URL.startsWith('/api') ? API_URL : `${API_URL}/api`
      }
      const result = await unsubscribeFromPush(apiUrl, getAuthHeaders)
      
      if (result.success) {
        setPushSubscribed(false)
        setPreferences(prev => ({
          ...prev,
          push: { ...prev.push, enabled: false }
        }))
        setSuccess('Push bildirimleri kapatıldı')
      } else {
        setError(result.error || 'Push bildirimleri kapatılamadı')
      }
    } catch (error) {
      console.error('Push unsubscribe hatası:', error)
      setError('Push bildirimleri kapatılırken bir hata oluştu')
    }
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '4rem 0', textAlign: 'center' }}>
          <div className="container">
            <p>Bildirim ayarlarına erişmek için lütfen giriş yapın.</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <SEO 
        title="Bildirim Ayarları"
        description="Fotoğraf Kutusu bildirim tercihlerinizi yönetin. E-posta, SMS ve push bildirimleri için ayarlarınızı düzenleyin."
        keywords="bildirim ayarları, e-posta bildirimleri, push bildirimleri"
        url="/notification-settings"
      />
      <Navbar />
      <main>
        <div className="page-header">
          <div className="container">
            <h1>Bildirim Ayarları</h1>
            <p style={{ fontSize: '1.2rem', marginTop: '1rem', opacity: 0.95 }}>
              Bildirim tercihlerinizi yönetin
            </p>
          </div>
        </div>

        <section className="content-section" style={{ padding: '3rem 0' }}>
          <div className="container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Yükleniyor...</p>
              </div>
            ) : (
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {error && (
                  <div style={{
                    background: '#fee',
                    color: '#c33',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem'
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
                    marginBottom: '1.5rem'
                  }}>
                    {success}
                  </div>
                )}

                {/* E-posta Bildirimleri */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon name="mail" size={24} />
                    E-posta Bildirimleri
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <span>Sipariş durumu değişiklikleri</span>
                      <input
                        type="checkbox"
                        checked={preferences.email.orderStatus}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          email: { ...preferences.email, orderStatus: e.target.checked }
                        })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <span>Kargo gönderildi</span>
                      <input
                        type="checkbox"
                        checked={preferences.email.orderShipped}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          email: { ...preferences.email, orderShipped: e.target.checked }
                        })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <span>Sipariş teslim edildi</span>
                      <input
                        type="checkbox"
                        checked={preferences.email.orderDelivered}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          email: { ...preferences.email, orderDelivered: e.target.checked }
                        })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <span>Kampanyalar ve özel teklifler</span>
                      <input
                        type="checkbox"
                        checked={preferences.email.promotions}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          email: { ...preferences.email, promotions: e.target.checked }
                        })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <span>Haber bülteni</span>
                      <input
                        type="checkbox"
                        checked={preferences.email.newsletter}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          email: { ...preferences.email, newsletter: e.target.checked }
                        })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </label>
                  </div>
                </div>

                {/* SMS Bildirimleri */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon name="phone" size={24} />
                    SMS Bildirimleri
                  </h2>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    SMS bildirimleri şu anda aktif değildir. Yakında eklenecektir.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', opacity: 0.5 }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Sipariş durumu değişiklikleri</span>
                      <input
                        type="checkbox"
                        checked={preferences.sms.orderStatus}
                        disabled
                        style={{ width: '20px', height: '20px' }}
                      />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Kargo gönderildi</span>
                      <input
                        type="checkbox"
                        checked={preferences.sms.orderShipped}
                        disabled
                        style={{ width: '20px', height: '20px' }}
                      />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Sipariş teslim edildi</span>
                      <input
                        type="checkbox"
                        checked={preferences.sms.orderDelivered}
                        disabled
                        style={{ width: '20px', height: '20px' }}
                      />
                    </label>
                  </div>
                </div>

                {/* Push Bildirimleri */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon name="bell" size={24} />
                    Push Bildirimleri
                  </h2>
                  {!pushSupported ? (
                    <p style={{ color: '#f59e0b', marginTop: '1rem' }}>
                      ⚠️ Bu tarayıcı push bildirimlerini desteklemiyor.
                    </p>
                  ) : (
                    <>
                      {pushSubscribed ? (
                        <div style={{
                          background: '#d1fae5',
                          border: '1px solid #10b981',
                          borderRadius: '8px',
                          padding: '1rem',
                          marginTop: '1rem',
                          marginBottom: '1.5rem'
                        }}>
                          <p style={{ margin: 0, color: '#065f46', fontWeight: '600' }}>
                            ✅ Push bildirimleri aktif
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={handlePushSubscribe}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '1rem',
                            marginBottom: '1.5rem'
                          }}
                        >
                          Push Bildirimlerini Aktif Et
                        </button>
                      )}
                      {pushSubscribed && (
                        <button
                          onClick={handlePushUnsubscribe}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            marginLeft: '1rem'
                          }}
                        >
                          Push Bildirimlerini Kapat
                        </button>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                          <span>Sipariş durumu bildirimleri</span>
                          <input
                            type="checkbox"
                            checked={preferences.push.orderStatus}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              push: { ...preferences.push, orderStatus: e.target.checked }
                            })}
                            disabled={!pushSubscribed}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                          <span>Kampanya bildirimleri</span>
                          <input
                            type="checkbox"
                            checked={preferences.push.promotions}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              push: { ...preferences.push, promotions: e.target.checked }
                            })}
                            disabled={!pushSubscribed}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                        </label>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: saving ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? 'Kaydediliyor...' : 'Tercihleri Kaydet'}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default NotificationSettings
