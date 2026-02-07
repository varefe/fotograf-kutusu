import { useState } from 'react'
import Icon from './Icon'
import { calculatePrice, getBulkPrice } from '../utils/priceCalculator'

const PRODUCT_SIZES = [
  { id: '10x15', name: '10x15 cm', width: 10, height: 15, area: 150, description: 'Küçük boyut - Polo kartlar için ideal' },
  { id: '15x20', name: '15x20 cm', width: 15, height: 20, area: 300, description: 'Orta boyut - Standart fotoğraflar' },
  { id: '20x30', name: '20x30 cm', width: 20, height: 30, area: 600, description: 'Büyük boyut - Duvar dekorasyonu' },
  { id: '30x40', name: '30x40 cm', width: 30, height: 40, area: 1200, description: 'Çok büyük boyut - Büyük duvar dekorasyonu' }
]

const QUANTITY_OPTIONS = [15, 25, 35, 50, 100]

function ProductComparison({ onAddToCart, onClose }) {
  const [selectedSizes, setSelectedSizes] = useState(['10x15', '15x20', '20x30', '30x40'])
  const [quantity, setQuantity] = useState(25)
  const [shippingType, setShippingType] = useState('standard')

  const toggleSize = (sizeId) => {
    setSelectedSizes(prev => 
      prev.includes(sizeId) 
        ? prev.filter(id => id !== sizeId)
        : [...prev, sizeId]
    )
  }

  const getPriceInfo = (size, qty) => {
    const basePrice = getBulkPrice(size, qty) || getBulkPrice(size, 15) || 0
    const subtotal = basePrice * qty
    const shippingPrice = subtotal >= 99 ? 0 : (shippingType === 'express' ? 35 : 15)
    const total = subtotal + shippingPrice
    
    return {
      basePrice,
      subtotal,
      shippingPrice,
      total,
      unitPrice: basePrice,
      isFreeShipping: subtotal >= 99
    }
  }

  const handleAddToCart = (size) => {
    if (onAddToCart) {
      onAddToCart({
        size,
        quantity,
        shippingType
      })
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflow: 'auto'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '1400px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 10
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#1f2937' }}>
              Ürün Karşılaştırma
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>
              Farklı boyutları ve fiyatları karşılaştırın
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Icon name="close" size={24} />
            </button>
          )}
        </div>

        {/* Controls */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {/* Quantity Selector */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                Adet Seçin
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                {QUANTITY_OPTIONS.map(qty => (
                  <option key={qty} value={qty}>{qty} adet</option>
                ))}
              </select>
            </div>

            {/* Shipping Type */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                Kargo Tipi
              </label>
              <select
                value={shippingType}
                onChange={(e) => setShippingType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="standard">Standart (15 ₺)</option>
                <option value="express">Express (35 ₺)</option>
              </select>
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Karşılaştırılacak Boyutlar
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {PRODUCT_SIZES.map(size => (
                <button
                  key={size.id}
                  onClick={() => toggleSize(size.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: `2px solid ${selectedSizes.includes(size.id) ? '#667eea' : '#d1d5db'}`,
                    borderRadius: '8px',
                    background: selectedSizes.includes(size.id) ? '#667eea' : 'white',
                    color: selectedSizes.includes(size.id) ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedSizes.includes(size.id)) {
                      e.currentTarget.style.borderColor = '#667eea'
                      e.currentTarget.style.background = '#f3f4f6'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedSizes.includes(size.id)) {
                      e.currentTarget.style.borderColor = '#d1d5db'
                      e.currentTarget.style.background = 'white'
                    }
                  }}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div style={{ padding: '2rem', overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '800px'
          }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '0.95rem'
                }}>
                  Özellik
                </th>
                {PRODUCT_SIZES.filter(size => selectedSizes.includes(size.id)).map(size => (
                  <th
                    key={size.id}
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '0.95rem',
                      minWidth: '180px'
                    }}
                  >
                    {size.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Boyut Bilgisi */}
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem', fontWeight: '600', color: '#6b7280' }}>
                  Boyut
                </td>
                {PRODUCT_SIZES.filter(size => selectedSizes.includes(size.id)).map(size => (
                  <td key={size.id} style={{ padding: '1rem', textAlign: 'center' }}>
                    {size.width} × {size.height} cm
                  </td>
                ))}
              </tr>

              {/* Alan */}
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <td style={{ padding: '1rem', fontWeight: '600', color: '#6b7280' }}>
                  Alan
                </td>
                {PRODUCT_SIZES.filter(size => selectedSizes.includes(size.id)).map(size => (
                  <td key={size.id} style={{ padding: '1rem', textAlign: 'center' }}>
                    {size.area} cm²
                  </td>
                ))}
              </tr>

              {/* Açıklama */}
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem', fontWeight: '600', color: '#6b7280' }}>
                  Açıklama
                </td>
                {PRODUCT_SIZES.filter(size => selectedSizes.includes(size.id)).map(size => (
                  <td key={size.id} style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#6b7280' }}>
                    {size.description}
                  </td>
                ))}
              </tr>

              {/* Birim Fiyat */}
              <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                <td style={{ padding: '1rem', fontWeight: '600', color: '#6b7280' }}>
                  Birim Fiyat ({quantity} adet)
                </td>
                {PRODUCT_SIZES.filter(size => selectedSizes.includes(size.id)).map(size => {
                  const priceInfo = getPriceInfo(size.id, quantity)
                  return (
                    <td key={size.id} style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#667eea' }}>
                        ₺{priceInfo.unitPrice.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        / adet
                      </div>
                    </td>
                  )
                })}
              </tr>

              {/* Ara Toplam */}
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem', fontWeight: '600', color: '#6b7280' }}>
                  Ara Toplam
                </td>
                {PRODUCT_SIZES.filter(size => selectedSizes.includes(size.id)).map(size => {
                  const priceInfo = getPriceInfo(size.id, quantity)
                  return (
                    <td key={size.id} style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                        ₺{priceInfo.subtotal.toFixed(2)}
                      </div>
                    </td>
                  )
                })}
              </tr>

              {/* Kargo */}
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <td style={{ padding: '1rem', fontWeight: '600', color: '#6b7280' }}>
                  Kargo
                </td>
                {PRODUCT_SIZES.filter(size => selectedSizes.includes(size.id)).map(size => {
                  const priceInfo = getPriceInfo(size.id, quantity)
                  return (
                    <td key={size.id} style={{ padding: '1rem', textAlign: 'center' }}>
                      {priceInfo.isFreeShipping ? (
                        <div style={{ color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          <Icon name="check-circle" size={16} />
                          Ücretsiz
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.95rem' }}>
                          ₺{priceInfo.shippingPrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>

              {/* Toplam Fiyat */}
              <tr style={{ borderBottom: '2px solid #667eea', background: '#eff6ff' }}>
                <td style={{ padding: '1rem', fontWeight: '700', color: '#1f2937', fontSize: '1.1rem' }}>
                  Toplam Fiyat
                </td>
                {PRODUCT_SIZES.filter(size => selectedSizes.includes(size.id)).map(size => {
                  const priceInfo = getPriceInfo(size.id, quantity)
                  return (
                    <td key={size.id} style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                        ₺{priceInfo.total.toFixed(2)}
                      </div>
                    </td>
                  )
                })}
              </tr>

              {/* Action Buttons */}
              <tr>
                <td style={{ padding: '1rem' }}></td>
                {PRODUCT_SIZES.filter(size => selectedSizes.includes(size.id)).map(size => (
                  <td key={size.id} style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => handleAddToCart(size.id)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        width: '100%'
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
                      Sepete Ekle
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ProductComparison
