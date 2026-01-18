# Backend Erişim Sorunu Çözümleri

## 🚨 Durum

- ❌ cPanel erişilemiyor
- ❌ SSH erişilemiyor (Port 22 kapalı)
- ❌ Backend production'da çalışmıyor

## 🔧 Çözüm Seçenekleri

### Seçenek 1: Hosting Sağlayıcısıyla İletişim (ÖNERİLEN)

Hosting sağlayıcınızla iletişime geçip:

1. **cPanel erişimini açtırın:**
   - cPanel şifresini sıfırlatın
   - cPanel URL'ini kontrol edin

2. **SSH erişimini açtırın:**
   - SSH portunu (22) açtırın
   - SSH kullanıcı adı ve şifresini kontrol edin

3. **Backend için port açtırın:**
   - Port 5000'i açtırın (veya başka bir port)
   - Firewall ayarlarını kontrol edin

### Seçenek 2: Backend'i Başka Bir Sunucuda Çalıştır

1. **Ücretsiz hosting seçenekleri:**
   - Railway.app
   - Render.com
   - Fly.io
   - Heroku (ücretli)

2. **Backend'i bu servislerde çalıştırın**

3. **Frontend'i güncelleyin:**
   - `src/config/api.js` dosyasında backend URL'ini güncelleyin

### Seçenek 3: Geçici Çözüm - Localhost Backend

Test için localhost'ta backend çalıştırıp frontend'i ona bağlayın:

```bash
# Localhost'ta backend'i başlat
npm run server

# Frontend'i build et
npm run build

# Frontend'i production'a yükle
# Backend localhost'ta çalışırken test edebilirsiniz
```

**Not:** Bu sadece test için. Production'da backend'in production sunucusunda çalışması gerekir.

### Seçenek 4: Backend'i Ayrı Subdomain'de Çalıştır (cPanel Erişildiğinde)

cPanel erişimi sağlandığında:

1. `api.fotografkutusu.com` subdomain'i oluşturun
2. Backend'i orada çalıştırın
3. `src/config/api.js` dosyasını güncelleyin

## 📋 Yapılacaklar Listesi

- [ ] Hosting sağlayıcısıyla iletişime geç
- [ ] cPanel erişimini açtır
- [ ] SSH erişimini açtır
- [ ] Backend'i production'da başlat
- [ ] Port 5000'i açtır (veya subdomain kullan)
- [ ] Frontend'i test et

## 🆘 Acil Durum

Eğer hiçbir erişim yoksa:

1. **Hosting sağlayıcısıyla iletişime geçin**
2. **Destek talebi açın:**
   - cPanel erişim sorunu
   - SSH erişim sorunu
   - Backend port açma talebi

3. **Alternatif olarak:**
   - Backend'i başka bir hosting'de çalıştırın
   - Frontend'i güncelleyin

---

**Not:** Backend production'da çalışmadığı sürece ödeme sistemi çalışmayacaktır.

