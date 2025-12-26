// Fiyat hesaplama fonksiyonu (backend ile aynı mantık)

export const calculatePrice = (size, quantity, frameType, paperType, colorMode, shippingType, customSize) => {
  // Boyut bazlı fiyat
  let basePrice = 0
  if (size === 'custom' && customSize) {
    const area = customSize.width * customSize.height
    basePrice = Math.ceil(area / 100) * 0.5 // cm² başına 0.5 TL
  } else {
    const sizePrices = {
      '10x15': 15,
      '15x20': 18,
      '20x30': 25,
      '30x40': 35
    }
    basePrice = sizePrices[size] || 25
  }

  // Çerçeve fiyatı
  const framePrices = {
    'none': 0,
    'standard': 10,
    'premium': 20
  }
  const framePrice = framePrices[frameType] || 10

  // Kağıt fiyatı
  const paperPrices = {
    'glossy': 0,
    'matte': 2,
    'satin': 3
  }
  const paperPrice = paperPrices[paperType] || 0

  // Renk modu fiyatı
  const colorPrices = {
    'color': 0,
    'blackwhite': -1,
    'sepia': 1
  }
  const colorPrice = colorPrices[colorMode] || 0

  // Kargo fiyatı
  const shippingPrices = {
    'standard': 15,
    'express': 35
  }
  const shippingPrice = shippingPrices[shippingType] || 15

  // Toplam fiyat
  let totalPrice = (basePrice + framePrice + paperPrice + colorPrice) * quantity + shippingPrice

  // İndirimler
  if (quantity >= 10) {
    totalPrice *= 0.85 // %15 indirim
  } else if (quantity >= 5) {
    totalPrice *= 0.90 // %10 indirim
  } else if (quantity >= 3) {
    totalPrice *= 0.95 // %5 indirim
  }

  return Math.round(totalPrice * 100) / 100 // 2 ondalık basamak
}
