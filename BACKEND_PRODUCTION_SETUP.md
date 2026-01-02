# Backend Production Kurulum Rehberi

## 🚀 Hızlı Başlangıç

### 1. Backend'i PM2 ile Başlat (Önerilen)

```bash
# PM2 kurulumu (eğer yoksa)
npm install -g pm2

# Backend'i başlat
./start-backend-pm2.sh

# Veya manuel:
pm2 start server/server.js --name "fotograf-backend" --env production
pm2 save
```

### 2. Backend'i Normal Node ile Başlat

```bash
# Direkt başlat
./start-backend.sh

# Veya manuel:
NODE_ENV=production PORT=5000 node server/server.js
```

## 📋 Kontrol Listesi

### Backend Çalışıyor mu?

```bash
# Port 5000'de process var mı?
lsof -ti:5000

# Backend health check
curl http://localhost:5000/api/health

# PM2 ile kontrol
pm2 status
pm2 logs fotograf-backend
```

### .htaccess Proxy Çalışıyor mu?

1. **cPanel'de Apache Modules kontrol edin:**
   - `mod_proxy` aktif olmalı
   - `mod_proxy_http` aktif olmalı
   - `mod_rewrite` aktif olmalı

2. **Test edin:**
   ```bash
   # Tarayıcıdan test
   https://fotografkutusu.com/api/health
   
   # JSON döndürmeli:
   # {"status":"OK","message":"Server is running"}
   ```

## ⚠️ Sorun: mod_proxy Aktif Değilse

Eğer cPanel'de `mod_proxy` aktif değilse (shared hosting'de genellikle aktif değildir), iki seçeneğiniz var:

### Seçenek 1: Backend'i Ayrı Subdomain'de Çalıştır (Önerilen)

1. **cPanel'de subdomain oluşturun:**
   - `api.fotografkutusu.com`

2. **Backend'i bu subdomain'de çalıştırın:**
   - Subdomain'in document root'una backend dosyalarını yükleyin
   - Backend'i başlatın

3. **Frontend'i güncelleyin:**
   - `src/config/api.js` dosyasında:
   ```javascript
   return 'https://api.fotografkutusu.com'
   ```

4. **.htaccess'i güncelleyin:**
   ```apache
   RewriteRule ^api/(.*)$ https://api.fotografkutusu.com/api/$1 [P,L]
   ```

### Seçenek 2: Backend'i Tam URL ile Çağır

1. **Backend'i ayrı bir port'ta çalıştırın:**
   - Örnek: `https://fotografkutusu.com:5000`

2. **Frontend'i güncelleyin:**
   - `src/config/api.js` dosyasında:
   ```javascript
   return 'https://fotografkutusu.com:5000'
   ```

3. **CORS ayarlarını kontrol edin:**
   - `server/server.js` dosyasında CORS ayarları doğru olmalı

## 🔧 Backend Sunucu Yapılandırması

### PM2 ile Otomatik Başlatma

PM2'yi sistem başlangıcında otomatik başlatmak için:

```bash
pm2 startup
pm2 save
```

### Environment Variables

Production'da `.env` dosyası şu değişkenleri içermeli:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://fotografkutusu.com
IYZIPAY_API_KEY=your-production-api-key
IYZIPAY_SECRET_KEY=your-production-secret-key
IYZIPAY_URI=https://api.iyzipay.com
ENCRYPTION_KEY=your-encryption-key
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-admin-password
```

## 🧪 Test

### 1. Backend Health Check

```bash
curl http://localhost:5000/api/health
```

Beklenen yanıt:
```json
{"status":"OK","message":"Server is running"}
```

### 2. API Endpoint Test

```bash
curl -X POST http://localhost:5000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"orderId":"test","orderData":{"price":"100"}}'
```

### 3. Frontend'den Test

Tarayıcı konsolunda:
- `🌐 API Endpoint oluşturuldu: /api/payment/create` görünmeli
- API isteği başarılı olmalı
- JSON response dönmeli

## 📊 Monitoring

### PM2 Monitoring

```bash
# Durum kontrolü
pm2 status

# Logları görüntüle
pm2 logs fotograf-backend

# Yeniden başlat
pm2 restart fotograf-backend

# Durdur
pm2 stop fotograf-backend

# Sil
pm2 delete fotograf-backend
```

### Log Dosyaları

PM2 kullanıyorsanız loglar:
- `logs/error.log` - Hata logları
- `logs/out.log` - Çıktı logları

## 🔒 Güvenlik

1. **Firewall:** Port 5000'i sadece localhost'tan erişilebilir yapın
2. **HTTPS:** Production'da mutlaka HTTPS kullanın
3. **Environment Variables:** `.env` dosyasını asla Git'e commit etmeyin
4. **Rate Limiting:** Backend'de rate limiting aktif (zaten yapılandırılmış)

## 🆘 Sorun Giderme

### Backend Başlamıyor

1. Port 5000 kullanımda mı?
   ```bash
   lsof -ti:5000
   ```

2. Node.js versiyonu uygun mu?
   ```bash
   node --version
   ```

3. Dependencies yüklü mü?
   ```bash
   npm install
   ```

### API İstekleri HTML Döndürüyor

1. Backend çalışıyor mu?
   ```bash
   curl http://localhost:5000/api/health
   ```

2. .htaccess proxy çalışıyor mu?
   - cPanel'de Apache Modules kontrol edin
   - `mod_proxy` aktif olmalı

3. Alternatif: Backend'i ayrı subdomain'de çalıştırın

### CORS Hatası

1. `server/server.js` dosyasında CORS ayarlarını kontrol edin
2. `FRONTEND_URL` environment variable'ı doğru mu?

---

**Not:** Bu rehber production sunucusunda çalıştırılmalıdır.

