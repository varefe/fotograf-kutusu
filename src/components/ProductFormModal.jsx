import React, { useState, useEffect } from 'react'
import Icon from './Icon'
import { useToast } from '../context/ToastContext'

export default function ProductFormModal({ product, onClose, onSave, apiUrl, getAuthHeaders }) {
  const toast = useToast()
  const isEdit = !!product
  const [form, setForm] = useState({
    size: '',
    name: '',
    description: '',
    unitPrice: '',
    totalPrice: '',
    features: '',
    image: '',
    featured: false,
    isActive: true,
    order: 0
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (product) {
      setForm({
        size: product.size || '',
        name: product.name || '',
        description: product.description || '',
        unitPrice: product.unitPrice ?? '',
        totalPrice: product.totalPrice ?? '',
        features: Array.isArray(product.features) ? product.features.join('\n') : '',
        image: product.image || '',
        featured: !!product.featured,
        isActive: product.isActive !== false,
        order: product.order ?? 0
      })
    } else {
      setForm({
        size: '',
        name: '',
        description: '',
        unitPrice: '',
        totalPrice: '',
        features: '',
        image: '',
        featured: false,
        isActive: true,
        order: 0
      })
    }
  }, [product])

  const baseUrl = apiUrl.replace(/\/api\/?$/, '')

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const headers = getAuthHeaders()
      const res = await fetch(`${apiUrl}/products/admin/upload`, {
        method: 'POST',
        headers,
        body: formData
      })
      const data = await res.json()
      if (data.success && data.url) {
        setForm(f => ({ ...f, image: data.url }))
      } else {
        setUploadError(data.error || 'Yükleme başarısız')
      }
    } catch (err) {
      console.error(err)
      setUploadError('Yükleme hatası')
    }
    setUploading(false)
    e.target.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const features = form.features ? form.features.split('\n').map(s => s.trim()).filter(Boolean) : []
      const body = {
        size: form.size.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        unitPrice: Number(form.unitPrice),
        totalPrice: Number(form.totalPrice),
        features,
        image: form.image.trim() || null,
        featured: form.featured,
        isActive: form.isActive,
        order: Number(form.order) || 0
      }
      const url = isEdit ? `${apiUrl}/products/admin/${product.id || product._id}` : `${apiUrl}/products/admin`
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.success) onSave()
      else toast.show(data.error || data.message || 'İşlem başarısız', 'error')
    } catch (err) {
      console.error(err)
      toast.show('Kaydetme hatası', 'error')
    }
    setSaving(false)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{isEdit ? 'Ürünü Düzenle' : 'Yeni Ürün'}</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
            <Icon name="close" size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Boyut (örn. 20x30) *</label>
            <input
              value={form.size}
              onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Ad *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Açıklama</label>
            <input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Birim Fiyat (₺) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unitPrice}
                onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Toplam Fiyat 15 adet (₺) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.totalPrice}
                onChange={e => setForm(f => ({ ...f, totalPrice: e.target.value }))}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Özellikler (her satıra bir)</label>
            <textarea
              value={form.features}
              onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
              rows={3}
              placeholder="Yüksek kalite baskı&#10;Çerçeve dahil"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Görsel</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', border: '1px dashed #ccc', borderRadius: '8px', background: uploading ? '#f5f5f5' : '#fafafa' }}>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                <span style={{ fontWeight: 500 }}>{uploading ? 'Yükleniyor...' : 'Bilgisayardan dosya seç'}</span>
              </label>
              {uploadError && <span style={{ color: 'var(--error-color, #b91c1c)', fontSize: '0.875rem' }}>{uploadError}</span>}
              <input
                value={form.image}
                onChange={e => { setForm(f => ({ ...f, image: e.target.value })); setUploadError(''); }}
                placeholder="Veya görsel URL yapıştırın (https://... veya /uploads/...)"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              {form.image && (
                <div style={{ marginTop: '0.25rem' }}>
                  <img
                    src={form.image.startsWith('http') || form.image.startsWith('data:') ? form.image : `${baseUrl}${form.image.startsWith('/') ? '' : '/'}${form.image}`}
                    alt="Önizleme"
                    style={{ maxWidth: '120px', maxHeight: '80px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '6px' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
              Öne çıkan
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
              Aktif
            </label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.2rem', background: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              İptal
            </button>
            <button type="submit" disabled={saving} style={{ padding: '0.6rem 1.2rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              {saving ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Ekle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
