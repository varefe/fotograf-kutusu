import { useState } from 'react'
import Icon from './Icon'

function PaymentForm({ onSubmit, loading, error }) {
  const [formData, setFormData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: '',
    installments: 1,
    saveCard: false
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Hata temizle
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const formatCardNumber = (value) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '')
    // 4'lü gruplara ayır
    const groups = numbers.match(/.{1,4}/g) || []
    return groups.join(' ').substring(0, 19) // Maksimum 16 rakam + 3 boşluk
  }

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value)
    setFormData(prev => ({ ...prev, cardNumber: formatted }))
    
    if (errors.cardNumber) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.cardNumber
        return newErrors
      })
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Kart üzerindeki ad soyad gereklidir'
    }

    if (!formData.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Kart numarası gereklidir'
    } else if (formData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Kart numarası geçersiz'
    }

    if (!formData.expireMonth) {
      newErrors.expireMonth = 'Son kullanma ayı gereklidir'
    }

    if (!formData.expireYear) {
      newErrors.expireYear = 'Son kullanma yılı gereklidir'
    }

    if (!formData.cvc) {
      newErrors.cvc = 'CVC gereklidir'
    } else if (formData.cvc.length < 3) {
      newErrors.cvc = 'CVC en az 3 haneli olmalıdır'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    // Kart numarasından boşlukları temizle
    const cardNumber = formData.cardNumber.replace(/\s/g, '')
    
    onSubmit({
      ...formData,
      cardNumber
    })
  }

  // Yıl seçenekleri (şu an + 10 yıl)
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 0; i < 10; i++) {
    years.push(currentYear + i)
  }

  // Ay seçenekleri
  const months = []
  for (let i = 1; i <= 12; i++) {
    months.push(i.toString().padStart(2, '0'))
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="on" style={{ maxWidth: '100%', margin: '0 auto' }}>
      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '0.75rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          textAlign: 'center',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      {/* Kart Üzerindeki Ad Soyad */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.875rem' }}>
          Kart Üzerindeki Ad Soyad *
        </label>
        <input
          type="text"
          name="cardHolderName"
          value={formData.cardHolderName}
          onChange={handleChange}
          placeholder="AD SOYAD"
          autoComplete="cc-name"
          required
          style={{
            width: '100%',
            padding: '0.6rem',
            border: errors.cardHolderName ? '2px solid #c33' : '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '0.9rem',
            textTransform: 'uppercase'
          }}
        />
        {errors.cardHolderName && (
          <div style={{ color: '#c33', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {errors.cardHolderName}
          </div>
        )}
      </div>

      {/* Kart Numarası */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.875rem' }}>
          Kart Numarası *
        </label>
        <input
          type="text"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleCardNumberChange}
          placeholder="0000 0000 0000 0000"
          maxLength="19"
          autoComplete="cc-number"
          required
          style={{
            width: '100%',
            padding: '0.6rem',
            border: errors.cardNumber ? '2px solid #c33' : '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '0.9rem',
            letterSpacing: '0.1em'
          }}
        />
        {errors.cardNumber && (
          <div style={{ color: '#c33', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {errors.cardNumber}
          </div>
        )}
      </div>

      {/* Son Kullanma Tarihi ve CVC */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.875rem' }}>
            Ay *
          </label>
          <select
            name="expireMonth"
            value={formData.expireMonth}
            onChange={handleChange}
            autoComplete="cc-exp-month"
            required
            style={{
              width: '100%',
              padding: '0.6rem',
              border: errors.expireMonth ? '2px solid #c33' : '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
          >
            <option value="">Ay</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          {errors.expireMonth && (
            <div style={{ color: '#c33', fontSize: '0.7rem', marginTop: '0.2rem' }}>
              {errors.expireMonth}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.875rem' }}>
            Yıl *
          </label>
          <select
            name="expireYear"
            value={formData.expireYear}
            onChange={handleChange}
            autoComplete="cc-exp-year"
            required
            style={{
              width: '100%',
              padding: '0.6rem',
              border: errors.expireYear ? '2px solid #c33' : '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
          >
            <option value="">Yıl</option>
            {years.map(year => (
              <option key={year} value={year.toString().substring(2)}>
                {year}
              </option>
            ))}
          </select>
          {errors.expireYear && (
            <div style={{ color: '#c33', fontSize: '0.7rem', marginTop: '0.2rem' }}>
              {errors.expireYear}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.875rem' }}>
            CVC *
          </label>
          <input
            type="text"
            name="cvc"
            value={formData.cvc}
            onChange={handleChange}
            placeholder="123"
            maxLength="4"
            autoComplete="cc-csc"
            required
            style={{
              width: '100%',
              padding: '0.6rem',
              border: errors.cvc ? '2px solid #c33' : '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
          />
          {errors.cvc && (
            <div style={{ color: '#c33', fontSize: '0.7rem', marginTop: '0.2rem' }}>
              {errors.cvc}
            </div>
          )}
        </div>
      </div>

      {/* Taksit Seçeneği */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.875rem' }}>
          Taksit Seçeneği
        </label>
        <select
          name="installments"
          value={formData.installments}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.6rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}
        >
          <option value="1">Tek Çekim</option>
          <option value="2">2 Taksit</option>
          <option value="3">3 Taksit</option>
          <option value="6">6 Taksit</option>
          <option value="9">9 Taksit</option>
        </select>
      </div>

      {/* Kart Kaydetme (Opsiyonel) */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          name="saveCard"
          id="saveCard"
          checked={formData.saveCard}
          onChange={handleChange}
          style={{
            width: '16px',
            height: '16px',
            marginRight: '0.5rem',
            cursor: 'pointer'
          }}
        />
        <label htmlFor="saveCard" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
          Kartımı güvenli şekilde kaydet (iyzico güvencesiyle)
        </label>
      </div>

      {/* Güvenlik Logoları */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
          <Icon name="lock" size={11} /> PCI-DSS Güvenlik Sertifikalı
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
          <Icon name="lock" size={11} /> SSL Şifreli
        </div>
      </div>

      {/* Ödeme Butonu */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: loading ? '#e2e8f0' : 'var(--primary-color)',
          color: loading ? '#64748b' : '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : 'var(--shadow)',
          transition: 'color 0.2s, background-color 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.background = 'var(--primary-dark)'
            e.target.style.boxShadow = 'var(--shadow-lg)'
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.target.style.background = 'var(--primary-color)'
            e.target.style.boxShadow = 'var(--shadow)'
          }
        }}
      >
        {loading ? 'Ödeme İşleniyor...' : 'Ödeme Yap'}
      </button>

      {/* KVKK Onayı */}
      <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center', lineHeight: '1.5' }}>
        Ödeme işlemine devam ederek{' '}
        <a href="/privacy" target="_blank" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
          KVKK Aydınlatma Metni
        </a>
        {' '}ni okuduğumu ve anladığımı kabul ediyorum.
      </div>
    </form>
  )
}

export default PaymentForm
