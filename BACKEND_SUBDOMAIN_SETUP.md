# Backend Subdomain Kurulum Rehberi

## 🎯 Amaç

Backend'i ayrı bir subdomain'de (`api.fotografkutusu.com`) çalıştırarak:
- Port açmaya gerek kalmaz
- mod_proxy gerekmez
- Daha güvenli ve temiz bir yapı oluşur

## 📋 Adımlar

### 1. Subdomain Oluştur

#### Yöntem 1: cPanel (Eğer Erişilebiliyorsa)

1. **cPanel'e giriş yapın:**
   - https://fotografkutusu.com/cpanel

2. **Subdomains bölümüne gidin:**
   - cPanel ana sayfasında "Subdomains" butonuna tıklayın

3. **Yeni subdomain oluşturun:**
   - **Subdomain:** `api`
   - **Domain:** `fotografkutusu.com`
   - **Document Root:** `/home/pfotogex/api.fotografkutusu.com` (otomatik oluşur)
   - "Create" butonuna tıklayın

#### Yöntem 2: SSH ile (cPanel Erişilemiyorsa)

```bash
# SSH ile sunucuya bağlan
ssh pfotogex@fotografkutusu.com

# Subdomain klasörünü oluştur
mkdir -p ~/api.fotografkutusu.com

# DNS kaydı için hosting sağlayıcınızla iletişime geçin
# veya cPanel'e erişim sağlandığında DNS kaydını ekleyin
```

### 2. Backend Dosyalarını Subdomain'e Yükle

1. **Backend dosyalarını hazırlayın:**
   - `server/` klasörü
   - `package.json`
   - `.env` dosyası
   - `node_modules/` (veya `npm install` çalıştırın)

2. **Dosyaları yükleyin:**
   - cPanel File Manager'da `api.fotografkutusu.com` klasörüne gidin
   - Backend dosyalarını yükleyin

3. **Klasör yapısı:**
   ```
   api.fotografkutusu.com/
   ├── server/
   │   ├── server.js
   │   ├── routes/
   │   ├── models/
   │   └── ...
   ├── package.json
   ├── .env
   └── node_modules/
   ```

### 3. Backend'i Başlat

SSH ile sunucuya bağlanın:

```bash
# Subdomain klasörüne git
cd ~/api.fotografkutusu.com

# Dependencies yükle
npm install

# PM2 ile başlat
pm2 start server/server.js --name "fotograf-backend-api" --env production
pm2 save
```

### 4. Frontend'i Güncelle

`src/config/api.js` dosyasında:

```javascript
// Production ortamında
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  return 'https://api.fotografkutusu.com'
}
```

### 5. CORS Ayarlarını Kontrol Et

`server/server.js` dosyasında CORS ayarları:

```javascript
const allowedOrigins = [
  'https://fotografkutusu.com',
  'https://www.fotografkutusu.com'
];
```

### 6. Test

1. **Backend health check:**
   ```bash
   curl https://api.fotografkutusu.com/api/health
   ```

2. **Frontend'den test:**
   - Tarayıcı konsolunda API istekleri `https://api.fotografkutusu.com/api/...` adresine gitmeli
   - Başarılı olmalı

## 🔒 Güvenlik

1. **Firewall:** Subdomain için özel firewall kuralları ekleyebilirsiniz
2. **SSL:** Subdomain için SSL sertifikası kurun (Let's Encrypt ücretsiz)
3. **Rate Limiting:** Backend'de zaten aktif

## 📊 Monitoring

```bash
# PM2 durumu
pm2 status

# Loglar
pm2 logs fotograf-backend-api

# Yeniden başlat
pm2 restart fotograf-backend-api
```

## 🆘 Sorun Giderme

### Subdomain çalışmıyor

1. DNS kayıtlarını kontrol edin
2. cPanel'de subdomain'in oluşturulduğunu kontrol edin
3. Document root'un doğru olduğunu kontrol edin

### Backend başlamıyor

1. Node.js versiyonunu kontrol edin
2. `.env` dosyasının doğru olduğunu kontrol edin
3. Port'un kullanılabilir olduğunu kontrol edin

### CORS hatası

1. `server/server.js` dosyasında CORS ayarlarını kontrol edin
2. `FRONTEND_URL` environment variable'ını kontrol edin

---

**Not:** Subdomain kurulumu tamamlandıktan sonra `src/config/api.js` dosyasını güncelleyin.

