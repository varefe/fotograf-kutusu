import { useState, useEffect } from 'react'
import Icon from './Icon'
import { API_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'

const FALLBACK_CATEGORIES = [
  { value: 'all', label: 'Tümü' },
  { value: '10x15', label: '10x15 cm' },
  { value: '15x20', label: '15x20 cm' },
  { value: '20x30', label: '20x30 cm' },
  { value: '30x40', label: '30x40 cm' },
  { value: '30x45', label: '30x45 cm' },
  { value: '40x50', label: '40x50 cm' },
  { value: '50x70', label: '50x70 cm' },
  { value: '70x100', label: '70x100 cm' },
  { value: 'custom', label: 'Özel Boyut' }
]

function GalleryForm({ gallery, onSuccess, onCancel }) {
  const { getAuthHeaders } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'all',
    size: '20x30',
    customSize: { width: '', height: '' },
    tags: '',
    isFeatured: false,
    isVisible: true,
    order: 0
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)

  useEffect(() => {
    const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
    fetch(`${apiUrl}/categories`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories?.length) {
          setCategories(data.categories.map(c => ({ value: c.name, label: c.name })))
        } else {
          setCategories(FALLBACK_CATEGORIES)
        }
      })
      .catch(() => setCategories(FALLBACK_CATEGORIES))
  }, [])

  const handleAddCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) return
    setAddingCategory(true)
    setError('')
    try {
      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      const headers = getAuthHeaders()
      const res = await fetch(`${apiUrl}/categories/admin`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setCategories(prev => [...prev, { value: data.category.name, label: data.category.name }])
        setFormData(prev => ({ ...prev, category: data.category.name }))
        setNewCategoryName('')
      } else {
        setError(data.error || data.message || 'Kategori eklenemedi')
      }
    } catch (err) {
      setError('Kategori eklenirken hata oluştu')
    } finally {
      setAddingCategory(false)
    }
  }

  useEffect(() => {
    if (gallery) {
      setFormData({
        title: gallery.title || '',
        description: gallery.description || '',
        category: gallery.category || 'all',
        size: gallery.size || '20x30',
        customSize: gallery.customSize || { width: '', height: '' },
        tags: gallery.tags ? gallery.tags.join(', ') : '',
        isFeatured: gallery.isFeatured || false,
        isVisible: gallery.isVisible !== false,
        order: gallery.order || 0
      })
      if (gallery.image?.base64) {
        setImagePreview(`data:${gallery.image.mimetype || 'image/jpeg'};base64,${gallery.image.base64}`)
      }
    }
  }, [gallery])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Görsel boyutu 10MB\'dan küçük olmalıdır')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.title.trim()) {
        setError('Başlık zorunludur')
        setLoading(false)
        return
      }

      if (!imageFile && !gallery?.image?.base64) {
        setError('Görsel seçmelisiniz')
        setLoading(false)
        return
      }

      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      const headers = getAuthHeaders()

      let imageBase64 = null
      let imageMimetype = null
      let imageSize = 0
      let imageName = ''

      if (imageFile) {
        // Yeni görsel yüklendi
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const base64 = reader.result.split(',')[1]
            resolve(base64)
          }
          reader.onerror = reject
          reader.readAsDataURL(imageFile)
        })
        imageMimetype = imageFile.type
        imageSize = imageFile.size
        imageName = imageFile.name
      } else if (gallery?.image?.base64) {
        // Mevcut görsel kullanılıyor
        imageBase64 = gallery.image.base64
        imageMimetype = gallery.image.mimetype
        imageSize = gallery.image.size
        imageName = gallery.image.originalName
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        size: formData.size,
        customSize: formData.size === 'custom' ? {
          width: parseFloat(formData.customSize.width),
          height: parseFloat(formData.customSize.height)
        } : undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        isFeatured: formData.isFeatured,
        isVisible: formData.isVisible,
        order: parseInt(formData.order) || 0,
        base64: imageBase64,
        mimetype: imageMimetype,
        imageSize: imageSize,
        filename: imageName,
        originalName: imageName
      }

      const url = gallery
        ? `${apiUrl}/gallery/admin/${gallery._id}`
        : `${apiUrl}/gallery/admin`
      
      const method = gallery ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert(gallery ? 'Ürün güncellendi' : 'Ürün eklendi')
        onSuccess()
      } else {
        setError(data.error || 'İşlem başarısız')
      }
    } catch (error) {
      console.error('Galeri form hatası:', error)
      setError('İşlem sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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

      <div style={{ marginBottom: '1rem' }}>
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
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Açıklama
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows="3"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Kategori *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Yeni kategori adı"
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '0.5rem 0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={addingCategory || !newCategoryName.trim()}
              style={{
                padding: '0.5rem 1rem',
                background: addingCategory ? '#ccc' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: addingCategory ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              {addingCategory ? '...' : <><Icon name="plus" size={14} /> Kategori Ekle</>}
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Boyut *
          </label>
          <select
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
          >
            <option value="10x15">10x15 cm</option>
            <option value="15x20">15x20 cm</option>
            <option value="20x30">20x30 cm</option>
            <option value="30x40">30x40 cm</option>
            <option value="30x45">30x45 cm</option>
            <option value="40x50">40x50 cm</option>
            <option value="50x70">50x70 cm</option>
            <option value="70x100">70x100 cm</option>
            <option value="custom">Özel Boyut</option>
          </select>
        </div>
      </div>

      {formData.size === 'custom' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Genişlik (cm)
            </label>
            <input
              type="number"
              value={formData.customSize.width}
              onChange={(e) => setFormData({
                ...formData,
                customSize: { ...formData.customSize, width: e.target.value }
              })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Yükseklik (cm)
            </label>
            <input
              type="number"
              value={formData.customSize.height}
              onChange={(e) => setFormData({
                ...formData,
                customSize: { ...formData.customSize, height: e.target.value }
              })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
          </div>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          {gallery ? 'Fotoğrafı değiştir (isteğe bağlı)' : 'Görsel *'}
        </label>
        {gallery && (
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
            Yeni dosya seçmezseniz mevcut fotoğraf kalır.
          </p>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}
        />
        {imagePreview && (
          <div style={{ marginTop: '1rem' }}>
            <img
              src={imagePreview}
              alt="Önizleme"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            />
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            />
            <span>Öne Çıkan</span>
          </label>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.isVisible}
              onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
            />
            <span>Görünür</span>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Etiketler (virgülle ayırın)
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="Örn: portre, aile, düğün"
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
          Sıralama (Sayı - düşük sayı önce gösterilir)
        </label>
        <input
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: e.target.value })}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: loading ? '#ccc' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Kaydediliyor...' : (gallery ? 'Güncelle' : 'Ekle')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          İptal
        </button>
      </div>
    </form>
  )
}

export default GalleryForm
