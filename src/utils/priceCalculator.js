// Fiyat hesaplama fonksiyonu (backend ile aynı mantık)
// Sosyopix.com toplu fiyatlarına göre güncellenmiştir

// Toplu fiyat tablosu (minimum 15 adet, tekli fiyat yok)
const getBulkPrice = (size, quantity) => {
  // Toplu fiyat tablosu (15+ adet)
  const bulkPrices = {
    '10x15': {
      bulk: {
        15: 16,   // 15 adet: minimum fiyat
        25: 14,   // 25 adet: 349.90 TL / 25 = ~14 TL/adet
        35: 8,    // 35 adet: Pola kart referansı
        50: 7.5,  // 50+ adet ek indirim
        100: 7    // 100+ adet ek indirim
      }
    },
    '15x20': {
      bulk: {
        15: 19,   // 15 adet: minimum fiyat
        25: 16,
        35: 14,
        50: 13,
        100: 12
      }
    },
    '20x30': {
      bulk: {
        15: 26,   // 15 adet: minimum fiyat
        25: 22,
        35: 20,
        50: 19,
        100: 18
      }
    },
    '30x40': {
      bulk: {
        15: 36,   // 15 adet: minimum fiyat
        25: 32,
        35: 30,
        50: 29,
        100: 28
      }
    }
  }

  const sizeData = bulkPrices[size]
  if (!sizeData) return null
  
  // Toplu fiyat kontrolü (15+ adet)
  if (quantity >= 100 && sizeData.bulk[100]) {
    return sizeData.bulk[100]
  } else if (quantity >= 50 && sizeData.bulk[50]) {
    return sizeData.bulk[50]
  } else if (quantity >= 35 && sizeData.bulk[35]) {
    return sizeData.bulk[35]
  } else if (quantity >= 25 && sizeData.bulk[25]) {
    return sizeData.bulk[25]
  } else if (quantity >= 15 && sizeData.bulk[15]) {
    return sizeData.bulk[15]
  }
  
  // 15'ten az adet için null (minimum 15 adet gerekli)
  return null
}

// Sadece toplu fiyat hesaplama (minimum 15 adet, tekli fiyat yok)
export const calculatePrice = (size, quantity, shippingType, customSize) => {
  // Minimum 15 adet kontrolü
  if (quantity < 15) {
    throw new Error('Minimum 15 adet seçmelisiniz')
  }

  // Boyut bazlı fiyat (Sadece toplu fiyatlar, minimum 15 adet)
  let basePrice = 0
  if (size === 'custom' && customSize) {
    const area = customSize.width * customSize.height
    basePrice = Math.ceil(area / 100) * 0.5 // cm² başına 0.5 TL
  } else {
    // Toplu fiyat tablosundan fiyat al (minimum 15 adet)
    const bulkPrice = getBulkPrice(size, quantity)
    if (bulkPrice) {
      basePrice = bulkPrice
    } else {
      // Fallback: 15 adet fiyatı (minimum)
      const sizePrices = {
        '10x15': 16,
        '15x20': 19,
        '20x30': 26,
        '30x40': 36
      }
      basePrice = sizePrices[size] || 26
    }
  }

  // Kargo fiyatı (Sosyopix: Standart 15 TL, Express 35 TL, 99 TL üzeri ücretsiz)
  const shippingPrices = {
    'standard': 15,  // Sosyopix: Standart kargo 15 TL
    'express': 35     // Sosyopix: Express kargo 35 TL
  }
  let shippingPrice = shippingPrices[shippingType] || 15
  
  // 99 TL üzeri ücretsiz kargo (Sosyopix politikası)
  const subtotal = basePrice * quantity
  if (subtotal >= 99) {
    shippingPrice = 0 // Ücretsiz kargo
  }

  // Toplam fiyat (sadece toplu fiyat, ek seçenek yok)
  const totalPrice = basePrice * quantity + shippingPrice

  return Math.round(totalPrice * 100) / 100 // 2 ondalık basamak
}

// Sosyopix toplu fiyat referansları (bilgi amaçlı)
export const sosyopixPriceReference = {
  klasikBaskilar: {
    '10x15': { 
      single: { parlak: 15, mat: 17 },
      bulk: {
        25: { parlak: 14, mat: 11.2 },  // 25 adet: 349.90 TL (parlak) / 279.90 TL (mat)
        35: { parlak: 8, mat: 8 },      // 35 adet: Pola kart referansı
        50: { parlak: 7.5, mat: 7.5 },
        100: { parlak: 7, mat: 7 }
      }
    },
    '15x20': { 
      single: { parlak: 18, mat: 20 },
      bulk: {
        25: { parlak: 16, mat: 18 },
        35: { parlak: 14, mat: 16 },
        50: { parlak: 13, mat: 15 },
        100: { parlak: 12, mat: 14 }
      }
    },
    '20x30': { 
      single: { parlak: 25, mat: 27 },
      bulk: {
        25: { parlak: 22, mat: 24 },
        35: { parlak: 20, mat: 22 },
        50: { parlak: 19, mat: 21 },
        100: { parlak: 18, mat: 20 }
      }
    },
    '30x40': { 
      single: { parlak: 35, mat: 37 },
      bulk: {
        25: { parlak: 32, mat: 34 },
        35: { parlak: 30, mat: 32 },
        50: { parlak: 29, mat: 31 },
        100: { parlak: 28, mat: 30 }
      }
    }
  },
  kargo: {
    standard: 15,
    express: 35,
    freeOver: 99
  },
  note: 'Sosyopix.com toplu fiyatları - 25+ adet için özel fiyatlar uygulanır'
}
