import { useState, useEffect } from 'react'
import Icon from './Icon'

const TYPE_OPTIONS = [
  { value: 'campaign', label: 'Kampanya', icon: 'megaphone' },
  { value: 'new_product', label: 'Yeni Ürün', icon: 'plus' },
  { value: 'special_offer', label: 'Özel Teklif', icon: 'alert-circle' },
  { value: 'info', label: 'Bilgi', icon: 'info' }
]

const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'Bir Kez' },
  { value: 'daily', label: 'Günlük' },
  { value: 'always', label: 'Her Zaman' }
]

const PAGE_OPTIONS = [
  { value: 'all', label: 'Tüm Sayfalar' },
  { value: 'home', label: 'Ana Sayfa' },
  { value: 'product', label: 'Ürün Sayfası' },
  { value: 'cart', label: 'Sepet' }
]

function AnnouncementForm({ announcement, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    image: '',
    link: { url: '', text: '' },
    buttonText: 'Tamam',
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    showOnPages: ['all'],
    targetAudience: 'all',
    displayFrequency: 'once',
    priority: 0
  })

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        message: announcement.message || '',
        type: announcement.type || 'info',
        image: announcement.image || '',
        link: announcement.link || { url: '', text: '' },
        buttonText: announcement.buttonText || 'Tamam',
        isActive: announcement.isActive !== undefined ? announcement.isActive : true,
        startDate: announcement.startDate ? new Date(announcement.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().split('T')[0] : '',
        showOnPages: announcement.showOnPages || ['all'],
        targetAudience: announcement.targetAudience || 'all',
        displayFrequency: announcement.displayFrequency || 'once',
        priority: announcement.priority || 0
      })
    }
  }, [announcement])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const data = {
      ...formData,
      showOnPages: Array.isArray(formData.showOnPages) ? formData.showOnPages : [formData.showOnPages]
    }
    
    onSave(data)
  }

  const handlePageToggle = (page) => {
    const current = formData.showOnPages || []
    if (current.includes(page)) {
      setFormData({
        ...formData,
        showOnPages: current.filter(p => p !== page)
      })
    } else {
      setFormData({
        ...formData,
        showOnPages: [...current, page]
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Başlık *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Message */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Mesaj *
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          rows={4}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Type */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Tip
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
          {TYPE_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, type: option.value })}
              style={{
                padding: '0.75rem',
                border: `2px solid ${formData.type === option.value ? '#667eea' : '#d1d5db'}`,
                borderRadius: '8px',
                background: formData.type === option.value ? '#eff6ff' : 'white',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <Icon name={option.icon} size={20} />
              <span style={{ fontSize: '0.9rem' }}>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Görsel URL (opsiyonel)
        </label>
        <input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://example.com/image.jpg"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Link */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Link URL
          </label>
          <input
            type="url"
            value={formData.link.url || ''}
            onChange={(e) => setFormData({ ...formData, link: { ...formData.link, url: e.target.value } })}
            placeholder="/product-upload"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Link Metni
          </label>
          <input
            type="text"
            value={formData.link.text || ''}
            onChange={(e) => setFormData({ ...formData, link: { ...formData.link, text: e.target.value } })}
            placeholder="Detaylar"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      {/* Button Text */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Buton Metni
        </label>
        <input
          type="text"
          value={formData.buttonText}
          onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Dates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Başlangıç Tarihi
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Bitiş Tarihi (opsiyonel)
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      {/* Show On Pages */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Gösterilecek Sayfalar
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {PAGE_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => handlePageToggle(option.value)}
              style={{
                padding: '0.5rem 1rem',
                border: `2px solid ${(formData.showOnPages || []).includes(option.value) ? '#667eea' : '#d1d5db'}`,
                borderRadius: '8px',
                background: (formData.showOnPages || []).includes(option.value) ? '#eff6ff' : 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Display Frequency */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Görüntüleme Sıklığı
        </label>
        <select
          value={formData.displayFrequency}
          onChange={(e) => setFormData({ ...formData, displayFrequency: e.target.value })}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        >
          {FREQUENCY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Priority */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Öncelik (yüksek öncelik önce gösterilir)
        </label>
        <input
          type="number"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
          min="0"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Active */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
        />
        <label htmlFor="isActive" style={{ cursor: 'pointer', fontWeight: '600' }}>
          Aktif
        </label>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          İptal
        </button>
        <button
          type="submit"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Kaydet
        </button>
      </div>
    </form>
  )
}

export default AnnouncementForm
