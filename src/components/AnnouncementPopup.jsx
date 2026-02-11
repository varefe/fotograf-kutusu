import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { API_URL } from '../config/api'

const TYPE_STYLES = {
  campaign: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: 'megaphone',
    iconColor: '#fff'
  },
  new_product: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    icon: 'plus',
    iconColor: '#fff'
  },
  special_offer: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    icon: 'alert-circle',
    iconColor: '#fff'
  },
  info: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    icon: 'info',
    iconColor: '#fff'
  }
}

function AnnouncementPopup() {
  const location = useLocation()
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    loadAnnouncements()
  }, [location.pathname])

  const loadAnnouncements = async () => {
    try {
      // Sayfa adını belirle
      const page = location.pathname === '/' ? 'home' : 
                   location.pathname.startsWith('/product') ? 'product' :
                   location.pathname.startsWith('/cart') ? 'cart' : 'all'

      let apiUrl = API_URL
      if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
        apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      } else {
        apiUrl = API_URL.startsWith('/api') ? API_URL : `${API_URL}/api`
      }

      const response = await fetch(`${apiUrl}/announcements?page=${page}`)
      const data = await response.json()

      if (data.success && data.announcements.length > 0) {
        // Görüntülenmiş popup'ları filtrele
        const visibleAnnouncements = data.announcements.filter(announcement => {
          const storageKey = `announcement_${announcement.id}`
          
          if (announcement.displayFrequency === 'always') {
            return true
          }
          
          if (announcement.displayFrequency === 'daily') {
            const lastShown = localStorage.getItem(`${storageKey}_date`)
            const today = new Date().toDateString()
            return lastShown !== today
          }
          
          // 'once' - sadece bir kez göster
          return !localStorage.getItem(storageKey)
        })

        if (visibleAnnouncements.length > 0) {
          setAnnouncements(visibleAnnouncements)
          setCurrentIndex(0)
          setIsVisible(true)
        }
      }
    } catch (error) {
      const isNetworkError = error?.message === 'Failed to fetch' || (error?.name === 'TypeError' && error?.message?.includes?.('fetch'))
      if (!isNetworkError) console.error('Popup yükleme hatası:', error)
    }
  }

  const handleClose = (announcementId) => {
    const announcement = announcements[currentIndex]
    const storageKey = `announcement_${announcementId}`

    // Görüntüleme kaydını sakla
    if (announcement.displayFrequency === 'daily') {
      localStorage.setItem(`${storageKey}_date`, new Date().toDateString())
    } else if (announcement.displayFrequency === 'once') {
      localStorage.setItem(storageKey, 'shown')
    }

    // Tıklama takibi
    trackClick(announcementId)

    // Sonraki popup'a geç veya kapat
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setIsVisible(false)
      setAnnouncements([])
      setCurrentIndex(0)
    }
  }

  const handleAction = (link) => {
    if (link && link.url) {
      if (link.url.startsWith('http://') || link.url.startsWith('https://')) {
        window.open(link.url, '_blank', 'noopener,noreferrer')
      } else {
        navigate(link.url)
      }
    }
    handleClose(announcements[currentIndex]?.id)
  }

  const trackClick = async (announcementId) => {
    try {
      let apiUrl = API_URL
      if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
        apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      } else {
        apiUrl = API_URL.startsWith('/api') ? API_URL : `${API_URL}/api`
      }

      await fetch(`${apiUrl}/announcements/${announcementId}/click`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Tıklama takibi hatası:', error)
    }
  }

  if (!isVisible || announcements.length === 0) {
    return null
  }

  const announcement = announcements[currentIndex]
  const style = TYPE_STYLES[announcement.type] || TYPE_STYLES.info

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.3s ease-in-out'
      }}
      onClick={(e) => {
        // Backdrop'a tıklanırsa kapatma (sadece X butonuna tıklanabilir)
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div
          style={{
            background: style.background,
            padding: '1.5rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon name={style.icon} size={24} color={style.iconColor} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
              {announcement.title}
            </h3>
          </div>
          <button
            onClick={() => handleClose(announcement.id)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'background 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {announcement.image && (
            <img
              src={announcement.image}
              alt={announcement.title}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          )}

          <p
            style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1rem',
              lineHeight: '1.6',
              color: '#374151'
            }}
          >
            {announcement.message}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            {announcement.link && announcement.link.url && (
              <button
                onClick={() => handleAction(announcement.link)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: style.background,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {announcement.link.text || 'Detaylar'}
              </button>
            )}
            <button
              onClick={() => handleClose(announcement.id)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e7eb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6'
              }}
            >
              {announcement.buttonText || 'Tamam'}
            </button>
          </div>
        </div>

        {/* Progress indicator (multiple popups) */}
        {announcements.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              padding: '1rem',
              background: '#f9fafb',
              borderTop: '1px solid #e5e7eb'
            }}
          >
            {announcements.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: index === currentIndex ? style.background : '#d1d5db',
                  transition: 'background 0.2s'
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default AnnouncementPopup
