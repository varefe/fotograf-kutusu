# 🚀 Production Deployment Rehberi

## 📋 Yayınlanması Gereken Dosyalar

### 1. Frontend Build Dosyaları (dist/ klasörü)
```bash
npm run build
```
Bu komut `dist/` klasörünü oluşturur. Bu klasördeki tüm dosyalar yayınlanmalıdır.

### 2. Backend Dosyaları
```
server/
├── config/
├── middleware/
├── models/
├── routes/
├── scripts/
├── utils/
└── server.js
```

### 3. Gerekli Dosyalar
- `package.json` - Dependencies listesi
- `package-lock.json` - Dependency versiyonları
- `.env` - Production environment variables (GÜVENLİK: Sunucuya yüklenmeli, Git'e eklenmemeli)
- `.htaccess` - Apache yapılandırması (cPanel için)
- `public/` - Statik dosyalar (logo, favicon, vb.)

### 4. Opsiyonel Dosyalar
- `Procfile` - Railway/Render için
- `railway.json` - Railway yapılandırması
- `fly.toml` - Fly.io yapılandırması
- `nginx.conf` - Nginx yapılandırması

## 🔧 Deployment Adımları

### Adım 1: Frontend Build
```bash
# Proje klasöründe
npm run build
```

Bu komut `dist/` klasörünü oluşturur. İçeriği:
- `index.html`
- `assets/` (CSS, JS dosyaları)
- Diğer statik dosyalar

### Adım 2: Backend Hazırlığı
Backend dosyaları zaten hazır. Sadece `.env` dosyasını production değerleriyle güncelleyin.

### Adım 3: Sunucuya Yükleme

#### Seçenek A: cPanel (Frontend + Backend ayrı)
1. **Frontend (dist/ klasörü):**
   - `dist/` klasöründeki tüm dosyaları `public_html/` veya `www/` klasörüne yükleyin
   - `.htaccess` dosyasını da yükleyin

2. **Backend:**
   - `server/` klasörünü sunucuya yükleyin (örn: `public_html/api/` veya ayrı subdomain)
   - `package.json` ve `package-lock.json` yükleyin
   - `.env` dosyasını production değerleriyle oluşturun
   - SSH ile bağlanıp `npm install --production` çalıştırın
   - Backend'i başlatın: `npm start` veya PM2 ile

#### Seçenek B: Railway/Render (Full Stack)
1. GitHub'a push edin
2. Railway/Render'da yeni proje oluşturun
3. GitHub repo'yu bağlayın
4. Environment variables'ı ekleyin
5. Build komutu: `npm run build`
6. Start komutu: `npm start`

#### Seçenek C: VPS (Ubuntu/Debian)
```bash
# 1. Projeyi klonla veya yükle
git clone <repo-url>
cd fotograf-proje

# 2. Dependencies yükle
npm install --production

# 3. Frontend build
npm run build

# 4. Environment variables ayarla
nano .env

# 5. Backend'i PM2 ile başlat
pm2 start server/server.js --name fotograf-backend
pm2 save
pm2 startup
```

## 📁 Yayınlanacak Dosya Listesi

### ✅ Yayınlanmalı:
```
✅ dist/                    # Frontend build çıktısı (TÜM İÇERİK)
✅ server/                  # Backend dosyaları (TÜM İÇERİK)
✅ public/                  # Statik dosyalar
✅ package.json             # Dependencies
✅ package-lock.json        # Dependency versiyonları
✅ .env                     # Production environment variables (GÜVENLİ!)
✅ .htaccess                # Apache yapılandırması (cPanel için)
✅ Procfile                 # Railway/Render için (varsa)
✅ railway.json             # Railway yapılandırması (varsa)
✅ nginx.conf               # Nginx yapılandırması (varsa)
```

### ❌ Yayınlanmamalı:
```
❌ node_modules/            # npm install ile oluşturulacak
❌ src/                     # Kaynak kod (build edilmiş hali dist/ içinde)
❌ .git/                    # Git klasörü
❌ .vscode/                 # Editor ayarları
❌ *.log                    # Log dosyaları
❌ .env.local               # Local environment
❌ build/                   # Eski build (dist/ kullanılacak)
```

## 🔐 Environment Variables (.env)

Production için `.env` dosyasında şunlar olmalı:

```env
# Backend
NODE_ENV=production
PORT=5001
BACKEND_URL=https://api.fotografkutusu.com
FRONTEND_URL=https://fotografkutusu.com

# MongoDB
MONGODB_URI=mongodb://...

# Iyzico
IYZICO_API_KEY=...
IYZICO_SECRET_KEY=...

# JWT
JWT_SECRET=...

# Encryption
ENCRYPTION_KEY=...
```

## 🚀 Hızlı Deployment Komutları

### 1. Build ve Hazırlık
```bash
# Frontend build
npm run build

# Dependencies kontrol
npm install --production
```

### 2. Dosya Yükleme (cPanel için)
```bash
# dist/ klasörünü sıkıştır
cd dist
zip -r ../frontend-build.zip .
cd ..

# server/ klasörünü sıkıştır
zip -r backend-build.zip server/ package.json package-lock.json
```

### 3. Sunucuda Kurulum
```bash
# Frontend dosyalarını çıkar
unzip frontend-build.zip -d public_html/

# Backend dosyalarını çıkar
unzip backend-build.zip -d ~/backend/

# Dependencies yükle
cd ~/backend
npm install --production

# .env dosyasını oluştur
nano .env
# (Production değerlerini gir)

# Backend'i başlat
pm2 start server/server.js --name fotograf-backend
```

## 📝 Kontrol Listesi

- [ ] Frontend build edildi (`npm run build`)
- [ ] `dist/` klasörü oluşturuldu
- [ ] `.env` dosyası production değerleriyle güncellendi
- [ ] Backend dosyaları hazır
- [ ] `package.json` ve `package-lock.json` hazır
- [ ] Sunucuda `npm install --production` çalıştırıldı
- [ ] Backend başlatıldı (PM2 veya başka bir process manager)
- [ ] Frontend dosyaları web sunucusuna yüklendi
- [ ] `.htaccess` dosyası yüklendi (cPanel için)
- [ ] Environment variables ayarlandı
- [ ] MongoDB bağlantısı test edildi
- [ ] Iyzico API keys test edildi
- [ ] Site test edildi (ödeme akışı dahil)

## 🌐 Platform Özel Notlar

### cPanel
- Frontend: `public_html/` veya `www/` klasörüne
- Backend: Subdomain veya alt klasör (örn: `api.fotografkutusu.com`)
- Node.js uygulamaları için "Node.js Selector" kullanın

### Railway
- GitHub repo bağlayın
- Build: `npm run build`
- Start: `npm start`
- Root directory: Proje kök dizini

### Render
- GitHub repo bağlayın
- Build: `npm run build`
- Start: `npm start`
- Environment: Production

### VPS (Ubuntu)
- Nginx reverse proxy kullanın
- PM2 ile backend'i yönetin
- SSL sertifikası (Let's Encrypt)

## ⚠️ Önemli Notlar

1. **Güvenlik:**
   - `.env` dosyasını asla Git'e eklemeyin
   - Production API keys'leri güvenli tutun
   - HTTPS kullanın

2. **Performance:**
   - Frontend build dosyalarını CDN'de servis edin
   - Backend için gzip compression açın
   - MongoDB connection pooling kullanın

3. **Monitoring:**
   - PM2 logs ile backend loglarını takip edin
   - Error tracking (Sentry vb.) ekleyin
   - Uptime monitoring kullanın

## 🆘 Sorun Giderme

### Frontend yüklenmiyor
- `dist/` klasörünün doğru yere yüklendiğini kontrol edin
- `.htaccess` dosyasının yüklendiğini kontrol edin
- Browser console'da hataları kontrol edin

### Backend çalışmıyor
- `npm install --production` çalıştırıldı mı?
- `.env` dosyası doğru mu?
- Port çakışması var mı? (`lsof -i :5001`)
- PM2 logs kontrol edin: `pm2 logs fotograf-backend`

### API istekleri başarısız
- CORS ayarlarını kontrol edin
- Backend URL'i doğru mu? (`FRONTEND_URL`, `BACKEND_URL`)
- Environment variables doğru mu?
