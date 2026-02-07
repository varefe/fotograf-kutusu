# SEO Optimizasyonu Rehberi

Bu dosya, Fotoğraf Kutusu sitesinin SEO optimizasyonu için yapılan iyileştirmeleri ve gelecekte yapılabilecek ek optimizasyonları içerir.

## ✅ Yapılan Optimizasyonlar

### 1. Meta Taglar
- **index.html**: Temel meta taglar, Open Graph ve Twitter Card tagları eklendi
- **Dinamik Meta Taglar**: `react-helmet-async` kullanılarak her sayfa için özel meta taglar
- **Canonical URL**: Her sayfa için canonical URL tanımlandı

### 2. Structured Data (JSON-LD)
- Schema.org LocalBusiness yapısı eklendi
- WebSite schema eklendi
- Arama motorları için yapılandırılmış veri sağlandı

### 3. robots.txt
- Arama motorları için yönlendirmeler tanımlandı
- Admin ve özel sayfalar engellendi
- Sitemap konumu belirtildi

### 4. sitemap.xml
- Tüm önemli sayfalar için sitemap oluşturuldu
- Her sayfa için priority ve changefreq değerleri ayarlandı
- Ürün sayfaları (boyutlar) eklendi

### 5. Sayfa Bazlı SEO
- **Ana Sayfa (Home)**: Genel site SEO'su
- **Hakkımızda (About)**: Şirket bilgileri
- **İletişim (Contact)**: İletişim sayfası
- **Ürün Sayfaları (ProductUpload)**: Dinamik ürün bazlı SEO

## 📋 Ek Yapılması Gerekenler

### 1. Görsel Optimizasyonu
```bash
# public/ klasörüne eklenmesi gerekenler:
- og-image.jpg (1200x630px) - Open Graph görseli
- logo.png - Site logosu
- apple-touch-icon.png - iOS için ikon
- favicon.ico - Favicon
```

### 2. Performans Optimizasyonu
- **Lazy Loading**: Görseller için lazy loading eklenmeli
- **Image Optimization**: WebP formatına dönüştürme
- **Code Splitting**: React Router için code splitting
- **Compression**: Gzip/Brotli sıkıştırma

### 3. İçerik Optimizasyonu
- **Alt Text**: Tüm görsellere alt text eklenmeli
- **Heading Yapısı**: H1, H2, H3 yapısı optimize edilmeli
- **İçerik Uzunluğu**: Her sayfada en az 300 kelime içerik
- **Internal Linking**: Sayfalar arası bağlantılar

### 4. Teknik SEO
- **HTTPS**: SSL sertifikası kontrolü
- **Page Speed**: Google PageSpeed Insights optimizasyonu
- **Mobile Friendly**: Mobil uyumluluk testi
- **Core Web Vitals**: LCP, FID, CLS metrikleri

### 5. Backend SEO
- **Server-Side Rendering (SSR)**: Next.js veya React SSR
- **Pre-rendering**: Statik sayfalar için pre-rendering
- **API Routes**: SEO-friendly URL yapısı

## 🔧 Kullanım

### Yeni Sayfa Eklerken SEO Ekleme

```jsx
import SEO from '../components/SEO'

function YeniSayfa() {
  return (
    <>
      <SEO 
        title="Sayfa Başlığı"
        description="Sayfa açıklaması (150-160 karakter)"
        keywords="anahtar, kelimeler, virgülle, ayrılmış"
        url="/yeni-sayfa"
      />
      {/* Sayfa içeriği */}
    </>
  )
}
```

### Dinamik SEO (URL Parametreleri)

```jsx
import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'

function DinamikSayfa() {
  const { id } = useParams()
  
  return (
    <>
      <SEO 
        title={`Ürün ${id} - Fotoğraf Kutusu`}
        description={`Ürün ${id} hakkında detaylı bilgi`}
        url={`/urun/${id}`}
      />
    </>
  )
}
```

## 📊 SEO Kontrol Listesi

- [x] Meta taglar (title, description, keywords)
- [x] Open Graph tagları
- [x] Twitter Card tagları
- [x] Canonical URL
- [x] robots.txt
- [x] sitemap.xml
- [x] Structured Data (JSON-LD)
- [x] Dinamik meta taglar (react-helmet-async)
- [ ] Görsel optimizasyonu (og-image, favicon)
- [ ] Alt text'ler
- [ ] Heading yapısı
- [ ] Internal linking
- [ ] Page speed optimizasyonu
- [ ] Mobile friendly test
- [ ] Google Search Console kaydı
- [ ] Google Analytics entegrasyonu

## 🚀 Hızlı Başlangıç

1. **Görselleri Ekle**: `public/` klasörüne og-image.jpg ve logo.png ekle
2. **Google Search Console**: Siteyi Google Search Console'a kaydet
3. **Sitemap Gönder**: Google Search Console'dan sitemap.xml'i gönder
4. **Analytics**: Google Analytics kodunu ekle (isteğe bağlı)

## 📝 Notlar

- Sitemap.xml'deki URL'leri production domain'inize göre güncelleyin
- robots.txt'deki domain'i production domain'inize göre güncelleyin
- Meta taglardaki URL'leri production domain'inize göre güncelleyin
- Structured Data'daki URL'leri production domain'inize göre güncelleyin

## 🔗 Yararlı Linkler

- [Google Search Console](https://search.google.com/search-console)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
