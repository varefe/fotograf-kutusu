import Icon from './Icon'

function WhatsAppButton() {
  const phoneNumber = '905067087684' // Telefon numarası (90 ile başlayan format)
  const message = 'Merhaba, Fotoğraf Kutusu hakkında bilgi almak istiyorum.'
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: '#25D366',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
        zIndex: 1000,
        transition: 'all 0.3s ease',
        textDecoration: 'none',
        color: 'white'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 211, 102, 0.6)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)'
      }}
      aria-label="WhatsApp ile iletişime geç"
      title="WhatsApp Destek"
    >
      <Icon name="whatsapp" size={32} />
    </a>
  )
}

export default WhatsAppButton
