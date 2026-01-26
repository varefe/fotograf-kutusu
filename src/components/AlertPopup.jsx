import { useEffect } from 'react'
import Icon from './Icon'

function AlertPopup({ message, type = 'info', onClose, show = false }) {
  // ESC tuşu ile kapatma
  useEffect(() => {
    if (!show) return
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [show, onClose])

  // Backdrop'a tıklayınca kapatma
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!show) return null

  const iconMap = {
    error: 'alert-circle',
    warning: 'alert-triangle',
    success: 'check-circle',
    info: 'info'
  }

  const colorMap = {
    error: {
      bg: '#fee2e2',
      border: '#fecaca',
      icon: '#ef4444',
      text: '#991b1b'
    },
    warning: {
      bg: '#fef3c7',
      border: '#fde68a',
      icon: '#f59e0b',
      text: '#92400e'
    },
    success: {
      bg: '#d1fae5',
      border: '#a7f3d0',
      icon: '#10b981',
      text: '#065f46'
    },
    info: {
      bg: '#dbeafe',
      border: '#bfdbfe',
      icon: '#3b82f6',
      text: '#1e40af'
    }
  }

  const colors = colorMap[type] || colorMap.info

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={handleBackdropClick}
    >
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.3s ease-out',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon ve Mesaj */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: colors.bg,
            border: `2px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon name={iconMap[type] || 'info'} size={24} color={colors.icon} />
          </div>
          <div style={{ flex: 1, paddingTop: '0.25rem' }}>
            <p style={{
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: 600,
              color: colors.text,
              lineHeight: 1.5
            }}>
              {message}
            </p>
          </div>
        </div>

        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.875rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            background: colors.icon,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: `0 4px 12px ${colors.icon}40`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = `0 6px 16px ${colors.icon}60`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.icon}40`
          }}
        >
          Tamam
        </button>
      </div>
    </div>
  )
}

export default AlertPopup
