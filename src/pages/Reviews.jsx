import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import Icon from '../components/Icon'
import StarRating from '../components/StarRating'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../config/api'

function Reviews() {
  const { user, isAuthenticated, getAuthHeaders } = useAuth()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 })
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [myReview, setMyReview] = useState(null)
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    photos: []
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadReviews()
    if (isAuthenticated) {
      loadMyReview()
    }
  }, [isAuthenticated])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      const response = await fetch(`${apiUrl}/reviews`)
      const data = await response.json()

      if (data.success) {
        setReviews(data.reviews || [])
        setStats(data.stats || { averageRating: 0, totalReviews: 0 })
      }
    } catch (error) {
      console.error('Yorum yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMyReview = async () => {
    try {
      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      const headers = getAuthHeaders()
      const response = await fetch(`${apiUrl}/reviews/my`, { headers })
      const data = await response.json()

      if (data.success && data.review) {
        setMyReview(data.review)
        setFormData({
          rating: data.review.rating,
          comment: data.review.comment,
          photos: data.review.photos || []
        })
      }
    } catch (error) {
      console.error('Yorum yükleme hatası:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      if (!formData.rating || formData.rating < 1) {
        setError('Lütfen bir puan seçin')
        setSubmitting(false)
        return
      }

      if (!formData.comment.trim() || formData.comment.trim().length < 10) {
        setError('Yorum en az 10 karakter olmalıdır')
        setSubmitting(false)
        return
      }

      const apiUrl = API_URL.includes('/api') ? API_URL : `${API_URL}/api`
      const headers = getAuthHeaders()

      const url = myReview 
        ? `${apiUrl}/reviews/${myReview._id}`
        : `${apiUrl}/reviews`
      
      const method = myReview ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(data.message)
        setShowReviewForm(false)
        setFormData({ rating: 0, comment: '', photos: [] })
        loadReviews()
        loadMyReview()
      } else {
        setError(data.error || 'Yorum gönderilemedi')
      }
    } catch (error) {
      console.error('Yorum gönderme hatası:', error)
      setError('Yorum gönderilirken bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <SEO 
        title="Müşteri Yorumları"
        description="Fotoğraf Kutusu müşterilerinin yorumları ve değerlendirmeleri. Gerçek müşteri deneyimlerini okuyun."
        keywords="fotoğraf kutusu yorumlar, müşteri değerlendirmeleri, fotoğraf baskı yorumları"
        url="/reviews"
      />
      <Navbar />
      <main>
        <div className="page-header">
          <div className="container">
            <h1>Müşteri Yorumları</h1>
            <p style={{ fontSize: '1.2rem', marginTop: '1rem', opacity: 0.95 }}>
              Müşterilerimizin deneyimlerini paylaştığı yorumlar
            </p>
          </div>
        </div>

        <section className="content-section" style={{ padding: '3rem 0' }}>
          <div className="container">
            {/* İstatistikler */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '3rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '2rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {stats.averageRating.toFixed(1)}
                </div>
                <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                  <StarRating rating={stats.averageRating} readonly size={20} />
                </div>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                  Ortalama Puan
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {stats.totalReviews}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  Toplam Yorum
                </div>
              </div>
            </div>

            {/* Yorum Yaz Butonu */}
            {isAuthenticated && (
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                {!myReview ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    style={{
                      padding: '1rem 2rem',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#5568d3'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#667eea'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <Icon name="plus" size={18} style={{ marginRight: '0.5rem' }} />
                    Yorum Yaz
                  </button>
                ) : (
                  <div style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'inline-block'
                  }}>
                    <p style={{ margin: 0, color: '#0284c7' }}>
                      Zaten bir yorum yazdınız. 
                      <button
                        onClick={() => setShowReviewForm(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0284c7',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          marginLeft: '0.5rem'
                        }}
                      >
                        Düzenle
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Yorum Formu */}
            {showReviewForm && (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                  {myReview ? 'Yorumunu Düzenle' : 'Yorum Yaz'}
                </h2>
                
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

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Puanınız *
                    </label>
                    <StarRating
                      rating={formData.rating}
                      onRatingChange={(rating) => setFormData({ ...formData, rating })}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Yorumunuz *
                    </label>
                    <textarea
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      placeholder="Deneyiminizi paylaşın (en az 10 karakter)..."
                      required
                      rows="6"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                    <small style={{ color: '#666', fontSize: '0.85rem' }}>
                      {formData.comment.length}/1000 karakter
                    </small>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        padding: '0.75rem 2rem',
                        background: submitting ? '#ccc' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: submitting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {submitting ? 'Gönderiliyor...' : (myReview ? 'Güncelle' : 'Gönder')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(false)
                        setError('')
                        setSuccess('')
                      }}
                      style={{
                        padding: '0.75rem 2rem',
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
              </div>
            )}

            {/* Yorumlar Listesi */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Yorumlar yükleniyor...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <Icon name="mail" size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
                <p style={{ color: '#666', fontSize: '1.1rem' }}>
                  Henüz yorum bulunmamaktadır.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '2rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                          {review.userName}
                        </div>
                        <StarRating rating={review.rating} readonly size={18} />
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <p style={{
                      color: '#333',
                      lineHeight: '1.8',
                      marginBottom: '1rem'
                    }}>
                      {review.comment}
                    </p>
                    {review.photos && review.photos.length > 0 && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                        gap: '0.5rem',
                        marginTop: '1rem'
                      }}>
                        {review.photos.map((photo, idx) => (
                          photo?.base64 && (
                            <img
                              key={idx}
                              src={`data:${photo.mimetype || 'image/jpeg'};base64,${photo.base64}`}
                              alt={`Yorum fotoğrafı ${idx + 1}`}
                              style={{
                                width: '100%',
                                height: '100px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                const newWindow = window.open()
                                if (newWindow) {
                                  newWindow.document.write(`
                                    <html>
                                      <head><title>Yorum Fotoğrafı</title></head>
                                      <body style="margin:0;padding:20px;background:#f5f5f5;text-align:center;">
                                        <img src="data:${photo.mimetype || 'image/jpeg'};base64,${photo.base64}" 
                                             style="max-width:90%;max-height:80vh;border-radius:8px;" />
                                      </body>
                                    </html>
                                  `)
                                }
                              }}
                            />
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Reviews
