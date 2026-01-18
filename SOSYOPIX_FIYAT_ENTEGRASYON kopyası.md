# 💰 Sosyopix Fiyat Entegrasyonu

## 📋 Sosyopix Fiyat Yapısı

Sosyopix.com sitesinden alınan fiyat bilgileri:

### Klasik Fotoğraf Baskıları

| Boyut | Parlak Baskı | Mat Baskı | Not |
|-------|--------------|-----------|-----|
| 10x15 cm | ~15 TL | ~17 TL | Küçük boyut |
| 15x20 cm | ~18 TL | ~20 TL | Orta boyut |
| 20x30 cm | ~25 TL | ~27 TL | Popüler boyut |
| 30x40 cm | ~35 TL | ~37 TL | Büyük boyut |

### Pola Baskılar

- **9x11 cm Pola Kart (35 adet):** 279.90 TL → **~8 TL/adet**
- **9x11 cm Parlak Pola (35 adet):** 349.90 TL → **~10 TL/adet**

### Kargo

- **Standart Kargo:** 15 TL
- **Express Kargo:** 35 TL
- **99 TL üzeri:** Ücretsiz kargo

## 🔧 Fiyatları Güncelleme

### Yöntem 1: Manuel Güncelleme (Önerilen)

1. Sosyopix.com sitesinden güncel fiyatları kontrol edin
2. `src/utils/priceCalculator.js` dosyasını açın
3. Fiyatları güncelleyin

### Yöntem 2: Otomatik Güncelleme

Sosyopix API'si varsa veya web scraping yapmak isterseniz, `scripts/sosyopix-fiyat-scraper.js` dosyasını kullanabilirsiniz.

**Not:** Web scraping yasal ve etik sorunlara yol açabilir. Sosyopix'in kullanım şartlarını kontrol edin.

## 📝 Güncellenecek Dosyalar

1. ✅ `src/utils/priceCalculator.js` - Frontend fiyat hesaplama
2. ✅ `server/routes/order.js` - Backend fiyat hesaplama
3. ✅ `src/pages/Home.jsx` - Ana sayfa fiyat gösterimi

## 🎯 Önerilen Fiyat Yapısı

Sosyopix fiyatlarına göre güncellenmiş fiyatlar:

```javascript
const sizePrices = {
  '10x15': 15,  // Parlak baskı
  '15x20': 18,  // Parlak baskı
  '20x30': 25,  // Parlak baskı
  '30x40': 35   // Parlak baskı
}

const paperPrices = {
  'glossy': 0,   // Parlak (varsayılan)
  'matte': 2,    // Mat (+2 TL)
  'satin': 3     // Saten (+3 TL)
}
```

## ⚠️ Yasal Uyarı

- Sosyopix'in fiyatlarını kopyalamak telif hakkı ihlali olabilir
- Kendi fiyat yapınızı oluşturmanız önerilir
- Bu entegrasyon sadece referans amaçlıdır

---

**Not:** Fiyatları manuel olarak güncellemek daha güvenli ve yasal olacaktır.

