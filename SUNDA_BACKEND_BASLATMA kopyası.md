# 🚀 Aynı Sunucuda Backend Başlatma Rehberi

## 📋 Ön Hazırlık

### 1. SSH ile Sunucuya Bağlan

```bash
ssh kullanici@fotografkutusu.com
# veya
ssh kullanici@sunucu-ip
```

### 2. Proje Klasörüne Git

```bash
cd ~/fotograf-proje
# veya projenizin bulunduğu klasör
cd ~/public_html/fotograf-proje
```

### 3. .env Dosyasını Oluştur/Kontrol Et

```bash
# .env dosyası var mı kontrol et
ls -la .env

# Yoksa oluştur
nano .env
```

`.env` dosyasına şunları ekleyin:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://fotografkutusu.com
IYZIPAY_API_KEY=TZY4COlRiQDLL7ERFUK5FzGW3rNBDLio
IYZIPAY_SECRET_KEY=Eu1eRgVCgE3EKU90DpoKZdgiRNsIDZXN
IYZIPAY_URI=https://api.iyzipay.com
ENCRYPTION_KEY=your-very-strong-encryption-key-minimum-32-characters
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password
```

**Önemli:** 
- `ENCRYPTION_KEY` için güçlü bir anahtar kullanın (minimum 32 karakter)
- `ADMIN_PASSWORD` için güvenli bir şifre kullanın

### 4. Dependencies Yükle

```bash
npm install
```

## 🚀 Backend'i Başlat

### Yöntem 1: PM2 ile Başlat (Önerilen)

PM2, backend'in sürekli çalışmasını sağlar ve sunucu yeniden başladığında otomatik başlatır.

#### PM2 Kurulumu (Eğer Yoksa)

```bash
npm install -g pm2
```

#### Backend'i PM2 ile Başlat

```bash
# Script ile başlat
./start-backend-pm2.sh

# Veya manuel:
pm2 start server/server.js --name "fotograf-backend" --env production
pm2 save
```

#### PM2 Komutları

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

#### PM2'yi Sistem Başlangıcında Otomatik Başlat

```bash
pm2 startup
pm2 save
```

### Yöntem 2: Normal Node ile Başlat (Test İçin)

```bash
# Script ile başlat
./start-backend.sh

# Veya manuel:
NODE_ENV=production PORT=5000 node server/server.js
```

**Not:** Bu yöntem terminal kapandığında backend durur. Production için PM2 kullanın.

## ✅ Kontrol

### 1. Backend Çalışıyor mu?

```bash
# Port 5000'de process var mı?
lsof -ti:5000

# Health check
curl http://localhost:5000/api/health
```

Beklenen yanıt:
```json
{"status":"OK","message":"Server is running"}
```

### 2. PM2 Durumu

```bash
pm2 status
```

Çıktı şöyle olmalı:
```
┌─────┬─────────────────────┬─────────┬─────────┬──────────┐
│ id  │ name                │ status  │ restart │ uptime   │
├─────┼─────────────────────┼─────────┼─────────┼──────────┤
│ 0   │ fotograf-backend    │ online  │ 0       │ 2m       │
└─────┴─────────────────────┴─────────┴─────────┴──────────┘
```

### 3. Tarayıcıdan Test

Tarayıcıda şu URL'yi açın:
```
https://fotografkutusu.com/api/health
```

JSON döndürmeli:
```json
{"status":"OK","message":"Server is running"}
```

## 🔧 Frontend Yapılandırması

Backend aynı sunucuda çalışıyorsa, frontend'in `/api` kullanması gerekiyor.

### 1. Frontend Config'i Güncelle

`src/config/api.js` dosyasını açın ve şunu kontrol edin:

```javascript
// Production ortamında
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  return '/api'  // Aynı sunucuda, mod_proxy ile
}
```

### 2. Build Yap

```bash
npm run build
```

### 3. Production'a Yükle

`dist/` klasöründeki dosyaları production sunucusuna yükleyin.

## 🔄 .htaccess Proxy Ayarları

Backend aynı sunucuda çalışıyorsa, `.htaccess` dosyasında proxy ayarları olmalı.

`.htaccess` dosyasında şu satırlar olmalı:

```apache
<IfModule mod_proxy.c>
  RewriteCond %{REQUEST_URI} ^/api
  RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]
</IfModule>
```

### mod_proxy Aktif Değilse

Eğer cPanel'de `mod_proxy` aktif değilse (shared hosting'de genellikle aktif değildir):

#### Seçenek 1: Hosting Sağlayıcısından mod_proxy Açtırın

cPanel'de Apache Modules bölümünden `mod_proxy` ve `mod_proxy_http` modüllerini aktif edin.

#### Seçenek 2: Backend'i Ayrı Subdomain'de Çalıştırın

1. `api.fotografkutusu.com` subdomain'i oluşturun
2. Backend'i orada çalıştırın
3. Frontend'de `https://api.fotografkutusu.com` kullanın

## 🧪 Test

### 1. Backend Health Check

```bash
curl http://localhost:5000/api/health
```

### 2. API Endpoint Test

```bash
curl -X POST http://localhost:5000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"orderId":"test","orderData":{"price":"100"}}'
```

### 3. Frontend'den Test

1. Tarayıcıda ödeme sayfasına gidin
2. Chrome DevTools → Network sekmesi
3. Ödeme formu oluşturulurken:
   - ✅ `/api/payment/create` isteği başarılı olmalı
   - ✅ JSON response dönmeli (HTML değil)

## 🆘 Sorun Giderme

### Backend Başlamıyor

1. **Port 5000 kullanımda mı?**
   ```bash
   lsof -ti:5000
   # Eğer process varsa, önce durdurun
   ```

2. **Node.js versiyonu uygun mu?**
   ```bash
   node --version
   # Node.js 18+ olmalı
   ```

3. **Dependencies yüklü mü?**
   ```bash
   npm install
   ```

4. **.env dosyası var mı?**
   ```bash
   ls -la .env
   ```

5. **Logları kontrol edin:**
   ```bash
   pm2 logs fotograf-backend
   # veya
   node server/server.js
   ```

### API İstekleri HTML Döndürüyor

1. **Backend çalışıyor mu?**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **.htaccess proxy çalışıyor mu?**
   - cPanel'de Apache Modules kontrol edin
   - `mod_proxy` aktif olmalı

3. **Alternatif: Backend'i ayrı subdomain'de çalıştırın**

### Port 5000 Erişilemiyor

1. **Firewall ayarlarını kontrol edin**
2. **Port 5000'in açık olduğundan emin olun**
3. **Alternatif: Farklı bir port kullanın** (örn: 3001)

### PM2 Komutları Çalışmıyor

1. **PM2 kurulu mu?**
   ```bash
   which pm2
   npm install -g pm2
   ```

2. **PM2 path'i doğru mu?**
   ```bash
   echo $PATH
   ```

## 📊 Monitoring

### PM2 Monitoring

```bash
# Durum kontrolü
pm2 status

# Logları görüntüle
pm2 logs fotograf-backend

# Canlı monitoring
pm2 monit
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

---

**Not:** Bu rehber production sunucusunda SSH ile bağlanarak çalıştırılmalıdır.

