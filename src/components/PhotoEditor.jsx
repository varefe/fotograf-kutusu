import { useState, useRef, useEffect } from 'react'
import Icon from './Icon'

const FILTERS = {
  none: { name: 'Orijinal', filter: 'none' },
  grayscale: { name: 'Siyah-Beyaz', filter: 'grayscale(100%)' },
  sepia: { name: 'Sepya', filter: 'sepia(100%)' },
  vintage: { name: 'Vintage', filter: 'sepia(50%) contrast(1.2) brightness(0.9)' },
  cool: { name: 'Soğuk', filter: 'brightness(1.1) contrast(1.1) saturate(0.8)' },
  warm: { name: 'Sıcak', filter: 'brightness(1.1) contrast(1.1) saturate(1.3)' },
  highContrast: { name: 'Yüksek Kontrast', filter: 'contrast(1.5)' },
  soft: { name: 'Yumuşak', filter: 'brightness(1.1) contrast(0.9) saturate(0.8)' }
}

function PhotoEditor({ photo, onSave, onCancel }) {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const containerRef = useRef(null)
  const imageElementRef = useRef(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [selectedFilter, setSelectedFilter] = useState('none')
  const [zoom, setZoom] = useState(100)
  const [isCropping, setIsCropping] = useState(false)
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 })
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [cropArea, setCropArea] = useState(null)

  useEffect(() => {
    if (photo) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        imageElementRef.current = img
        setImageLoaded(true)
        // Başlangıç crop alanını ayarla (tüm resim)
        if (img.width && img.height) {
          setCropArea({
            x: 0,
            y: 0,
            width: img.width,
            height: img.height
          })
        }
      }
      img.src = photo.preview || photo.url || photo
    }
  }, [photo])

  const applyFilters = () => {
    const filter = FILTERS[selectedFilter]?.filter || 'none'
    const brightnessValue = brightness / 100
    const contrastValue = contrast / 100
    const saturationValue = saturation / 100
    
    return `
      ${filter}
      brightness(${brightnessValue})
      contrast(${contrastValue})
      saturate(${saturationValue})
    `
  }

  const handleCropStart = (e) => {
    if (!isCropping) return
    
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setCropStart({ x, y })
    setCropEnd({ x, y })
    setIsDragging(true)
  }

  const handleCropMove = (e) => {
    if (!isDragging || !isCropping) return
    
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setCropEnd({ x, y })
  }

  const handleCropEnd = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const startX = Math.min(cropStart.x, cropEnd.x)
    const startY = Math.min(cropStart.y, cropEnd.y)
    const endX = Math.max(cropStart.x, cropEnd.x)
    const endY = Math.max(cropStart.y, cropEnd.y)
    
    const width = endX - startX
    const height = endY - startY
    
    if (width > 10 && height > 10 && imageElementRef.current) {
      // Canvas boyutlarına göre normalize et
      const scaleX = (imageElementRef.current.width || 1) / rect.width
      const scaleY = (imageElementRef.current.height || 1) / rect.height
      
      setCropArea({
        x: startX * scaleX,
        y: startY * scaleY,
        width: width * scaleX,
        height: height * scaleY
      })
    }
  }

  const handleSave = async () => {
    if (!canvasRef.current || !imageElementRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = imageElementRef.current
    
    // Canvas boyutlarını ayarla
    const displayWidth = containerRef.current?.clientWidth || img.width
    const displayHeight = containerRef.current?.clientHeight || img.height
    
    canvas.width = img.width
    canvas.height = img.height
    
    // Crop alanını hesapla
    let sourceX = 0
    let sourceY = 0
    let sourceWidth = img.width
    let sourceHeight = img.height
    
    if (cropArea && cropArea.width > 0 && cropArea.height > 0) {
      sourceX = Math.max(0, cropArea.x)
      sourceY = Math.max(0, cropArea.y)
      sourceWidth = Math.min(img.width - sourceX, cropArea.width)
      sourceHeight = Math.min(img.height - sourceY, cropArea.height)
    }
    
    // Canvas'a çiz
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Önce filtreleri uygula (canvas filter API kullanarak)
    ctx.save()
    
    // Brightness, contrast, saturation için canvas filter kullan
    ctx.filter = applyFilters()
    
    // Crop alanını çiz
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, canvas.width, canvas.height
    )
    
    ctx.restore()
    
    // Canvas'ı base64'e çevir
    const editedPhoto = canvas.toDataURL('image/jpeg', 0.9)
    
    // Orijinal photo objesini güncelle
    const updatedPhoto = {
      ...photo,
      preview: editedPhoto,
      edited: true
    }
    
    onSave(updatedPhoto)
  }

  const handleReset = () => {
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setSelectedFilter('none')
    setZoom(100)
    setIsCropping(false)
    setCropArea(null)
  }

  const imageSrc = photo?.preview || photo?.url || photo

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <h2 style={{ color: 'white', margin: 0 }}>Fotoğraf Düzenle</h2>
        <button
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          <Icon name="close" size={24} />
        </button>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: '#1a1a1a',
          borderRadius: '8px',
          marginBottom: '1rem',
          cursor: isCropping ? 'crosshair' : 'default'
        }}
        onMouseDown={handleCropStart}
        onMouseMove={handleCropMove}
        onMouseUp={handleCropEnd}
        onMouseLeave={handleCropEnd}
      >
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Edit"
          onLoad={(e) => {
            if (e.target.complete) {
              imageElementRef.current = e.target
              setImageLoaded(true)
              if (e.target.width && e.target.height) {
                setCropArea({
                  x: 0,
                  y: 0,
                  width: e.target.width,
                  height: e.target.height
                })
              }
            }
          }}
          style={{
            maxWidth: `${zoom}%`,
            maxHeight: `${zoom}%`,
            filter: applyFilters(),
            userSelect: 'none',
            pointerEvents: 'none'
          }}
        />
        
        {/* Crop Overlay */}
        {isCropping && isDragging && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(cropStart.x, cropEnd.x)}px`,
              top: `${Math.min(cropStart.y, cropEnd.y)}px`,
              width: `${Math.abs(cropEnd.x - cropStart.x)}px`,
              height: `${Math.abs(cropEnd.y - cropStart.y)}px`,
              border: '2px dashed #667eea',
              background: 'rgba(102, 126, 234, 0.2)',
              pointerEvents: 'none'
            }}
          />
        )}
        
        {cropArea && !isDragging && imageElementRef.current && (
          <div
            style={{
              position: 'absolute',
              left: `${(cropArea.x / (imageElementRef.current.width || 1)) * (containerRef.current?.clientWidth || 1)}px`,
              top: `${(cropArea.y / (imageElementRef.current.height || 1)) * (containerRef.current?.clientHeight || 1)}px`,
              width: `${(cropArea.width / (imageElementRef.current.width || 1)) * (containerRef.current?.clientWidth || 1)}px`,
              height: `${(cropArea.height / (imageElementRef.current.height || 1)) * (containerRef.current?.clientHeight || 1)}px`,
              border: '2px solid #667eea',
              background: 'rgba(102, 126, 234, 0.1)',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      {/* Controls */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '1rem',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setIsCropping(!isCropping)}
            style={{
              padding: '0.5rem 1rem',
              background: isCropping ? '#667eea' : 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Icon name="crop" size={16} />
            Kırp
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Icon name="refresh-cw" size={16} />
            Sıfırla
          </button>
        </div>

        {/* Zoom */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem' }}>
            Yakınlaştır: {zoom}%
          </label>
          <input
            type="range"
            min="50"
            max="200"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Brightness */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem' }}>
            Parlaklık: {brightness}%
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Contrast */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem' }}>
            Kontrast: {contrast}%
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Saturation */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem' }}>
            Doygunluk: {saturation}%
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem' }}>
            Filtreler
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '0.5rem'
          }}>
            {Object.entries(FILTERS).map(([key, filter]) => (
              <button
                key={key}
                onClick={() => setSelectedFilter(key)}
                style={{
                  padding: '0.5rem',
                  background: selectedFilter === key ? '#667eea' : 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Kaydet
          </button>
        </div>
      </div>

      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default PhotoEditor
