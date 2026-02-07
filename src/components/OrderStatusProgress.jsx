import Icon from './Icon'

function OrderStatusProgress({ status, paymentStatus }) {
  // Sipariş durum adımları
  const statusSteps = [
    { 
      key: 'Bekliyor', 
      label: 'Bekliyor', 
      icon: 'clock',
      description: 'Siparişiniz alındı, ödeme bekleniyor',
      color: '#3b82f6'
    },
    { 
      key: 'Alındı', 
      label: 'Alındı', 
      icon: 'check-circle',
      description: 'Ödeme alındı, sipariş hazırlanıyor',
      color: '#10b981'
    },
    { 
      key: 'Basıldı', 
      label: 'Basıldı', 
      icon: 'camera',
      description: 'Fotoğraflarınız basılıyor',
      color: '#f59e0b'
    },
    { 
      key: 'Kargoya Verildi', 
      label: 'Kargoya Verildi', 
      icon: 'truck',
      description: 'Siparişiniz kargoya verildi',
      color: '#8b5cf6'
    },
    { 
      key: 'Teslim Edildi', 
      label: 'Teslim Edildi', 
      icon: 'check',
      description: 'Siparişiniz teslim edildi',
      color: '#059669'
    }
  ]

  // Mevcut durumun index'ini bul
  const getCurrentStatusIndex = () => {
    const currentStatus = status || 'Bekliyor'
    const index = statusSteps.findIndex(step => step.key === currentStatus)
    return index >= 0 ? index : 0
  }

  const currentIndex = getCurrentStatusIndex()
  const isPaid = paymentStatus === 'paid' || paymentStatus === 'success'

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        marginBottom: '1rem'
      }}>
        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '0',
          right: '0',
          height: '3px',
          background: '#e5e7eb',
          zIndex: 0
        }}>
          <div style={{
            width: `${(currentIndex / (statusSteps.length - 1)) * 100}%`,
            height: '100%',
            background: statusSteps[currentIndex]?.color || '#3b82f6',
            transition: 'width 0.5s ease',
            borderRadius: '3px'
          }} />
        </div>

        {/* Status Steps */}
        {statusSteps.map((step, index) => {
          const isActive = index <= currentIndex
          const isCurrent = index === currentIndex
          
          return (
            <div 
              key={step.key}
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1
              }}
            >
              {/* Icon Circle */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: isActive 
                  ? (isCurrent ? step.color : '#d1d5db')
                  : '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `3px solid ${isActive ? step.color : '#e5e7eb'}`,
                transition: 'all 0.3s ease',
                boxShadow: isCurrent ? `0 0 0 4px ${step.color}33` : 'none'
              }}>
                <Icon 
                  name={step.icon} 
                  size={20}
                  style={{ color: isActive ? (isCurrent ? 'white' : step.color) : '#9ca3af' }}
                />
              </div>
              
              {/* Label */}
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: isCurrent ? 'bold' : 'normal',
                color: isActive ? (isCurrent ? step.color : '#6b7280') : '#9ca3af',
                textAlign: 'center',
                maxWidth: '80px'
              }}>
                {step.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Current Status Description */}
      {statusSteps[currentIndex] && (
        <div style={{
          background: `${statusSteps[currentIndex].color}15`,
          border: `1px solid ${statusSteps[currentIndex].color}40`,
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Icon 
            name={statusSteps[currentIndex].icon} 
            size={18}
            style={{ color: statusSteps[currentIndex].color }}
          />
          <div>
            <div style={{ 
              fontWeight: '600', 
              color: statusSteps[currentIndex].color,
              fontSize: '0.9rem'
            }}>
              {statusSteps[currentIndex].label}
            </div>
            <div style={{ 
              fontSize: '0.85rem', 
              color: '#6b7280',
              marginTop: '0.25rem'
            }}>
              {statusSteps[currentIndex].description}
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Warning */}
      {!isPaid && currentIndex === 0 && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          color: '#92400e'
        }}>
          <Icon name="alert-triangle" size={18} />
          <span>Ödeme bekleniyor. Ödeme tamamlandıktan sonra siparişiniz işleme alınacaktır.</span>
        </div>
      )}
    </div>
  )
}

export default OrderStatusProgress
