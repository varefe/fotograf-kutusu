import { useState } from 'react'
import Icon from './Icon'

function StarRating({ rating = 0, onRatingChange, readonly = false, size = 24 }) {
  const [hoverRating, setHoverRating] = useState(0)

  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value)
    }
  }

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          onClick={() => handleClick(value)}
          onMouseEnter={() => handleMouseEnter(value)}
          onMouseLeave={handleMouseLeave}
          style={{
            cursor: readonly ? 'default' : 'pointer',
            color: value <= displayRating ? '#fbbf24' : '#d1d5db',
            fontSize: `${size}px`,
            transition: 'color 0.2s',
            userSelect: 'none'
          }}
        >
          ★
        </span>
      ))}
      {rating > 0 && (
        <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  )
}

export default StarRating
