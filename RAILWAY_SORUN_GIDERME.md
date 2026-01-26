# 🚨 Railway Sorun Giderme Rehberi

## ❌ Railway Çalışmıyor - Hızlı Çözüm

### 1. Railway Dashboard'da Kontrol Et

1. **https://railway.app** adresine git
2. Projenize girin
3. **"Deployments"** sekmesine bakın
4. Son deployment'ın durumunu kontrol edin:
   - ✅ **Success** = Başarılı
   - ❌ **Failed** = Başarısız (logları kontrol et)
   - ⏳ **Building** = Hala build ediliyor

### 2. Logları Kontrol Et

**Deployments** → En son deployment → **Logs** sekmesine bakın:

#### ✅ Başarılı Loglar:
```
✅ Server 5000 portunda çalışıyor
🌐 Environment: production
✅ MongoDB bağlantısı başarılı
```

#### ❌ Hata Logları:
- `Cannot find module` → Dependencies eksik
- `Port already in use` → Port çakışması
- `MongoDB connection failed` → MongoDB URI yanlış
- `ENCRYPTION_KEY is required` → Environment variable eksik

### 3. Settings Kontrolü

**Settings** → **General** sekmesinde:

```
Root Directory: (boş bırak)
Build Command: npm install
Start Command: node server/server.js
```

**ÖNEMLİ:** Root Directory'ye `server` yazmayın! Boş bırakın.

### 4. Environment Variables Kontrolü

**Settings** → **Variables** sekmesinde şunlar olmalı:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://fotografkutusu.com
MONGODB_URI=mongodb://mongo:...@yamanote.proxy.rlwy.net:38288
IYZIPAY_API_KEY=TZY4COlRiQDLL7ERFUK5FzGW3rNBDLio
IYZIPAY_SECRET_KEY=Eu1eRgVCgE3EKU90DpoKZdgiRNsIDZXN
IYZIPAY_URI=https://api.iyzipay.com
ENCRYPTION_KEY=your-32-character-encryption-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=your-jwt-secret-key-here
```

**ÖNEMLİ:** 
- `MONGODB_URI` mutlaka olmalı
- `ENCRYPTION_KEY` minimum 32 karakter olmalı
- `PORT` Railway otomatik sağlar, ama manuel de eklenebilir

### 5. Manuel Redeploy

1. **Deployments** sekmesine git
2. En son deployment'a tıkla
3. **"Redeploy"** butonuna tıkla
4. Veya **Settings** → **General** → **"Redeploy"** butonuna tıkla

### 6. GitHub Bağlantısını Kontrol Et

1. **Settings** → **Source** sekmesine git
2. GitHub repo bağlı mı kontrol et
3. Branch doğru mu kontrol et (genellikle `main`)

### 7. Health Check Test

Deploy tamamlandıktan sonra:

```bash
# Railway URL'inizi alın (Settings → Domains)
curl https://your-app.railway.app/api/health
```

Şu cevabı almalısınız:
```json
{"status":"OK","message":"Server is running"}
```

### 8. Yaygın Hatalar ve Çözümleri

#### ❌ "Railpack could not determine"
**Çözüm:** Settings → General → Build Command: `npm install` yazın

#### ❌ "Cannot find module"
**Çözüm:** 
1. `package.json` dosyasında dependencies kontrol edin
2. `npm install` çalıştığını loglardan kontrol edin

#### ❌ "Port 5000 already in use"
**Çözüm:** 
1. Settings → Variables → `PORT` değişkenini kaldırın
2. Railway otomatik PORT sağlar

#### ❌ "MongoDB connection failed"
**Çözüm:**
1. `MONGODB_URI` doğru mu kontrol edin
2. Railway MongoDB servisi çalışıyor mu kontrol edin
3. MongoDB URI'yi Railway dashboard'dan yeniden alın

#### ❌ "ENCRYPTION_KEY is required"
**Çözüm:**
1. Settings → Variables → `ENCRYPTION_KEY` ekleyin
2. Minimum 32 karakter olmalı

### 9. Railway Servisini Yeniden Başlat

1. **Settings** → **General** sekmesine git
2. En alta scroll yap
3. **"Restart Service"** butonuna tıkla

### 10. Yeni Deployment Oluştur

Eğer hiçbir şey işe yaramazsa:

1. **Settings** → **Source** sekmesine git
2. GitHub repo'yu disconnect edin
3. Tekrar connect edin
4. Yeni deployment otomatik başlayacak

## ✅ Başarı Kontrolü

Railway çalışıyorsa şunları görmelisiniz:

1. **Deployments** sekmesinde: ✅ Success
2. **Logs** sekmesinde: `✅ Server XXXX portunda çalışıyor`
3. **Health check**: `{"status":"OK","message":"Server is running"}`
4. **Domain**: Railway URL'iniz çalışıyor

## 🆘 Hala Çalışmıyorsa

1. Railway loglarını tam olarak okuyun
2. Hata mesajını not edin
3. Bu rehberdeki ilgili bölüme bakın
4. Hala çözülmezse Railway support'a başvurun

## 📝 Notlar

- Railway ücretsiz planında aylık $5 kredi var
- İlk ay tamamen ücretsiz
- Railway otomatik olarak PORT sağlar (genellikle rastgele bir port)
- MongoDB bağlantısı başarısız olursa, backend çalışsa bile veritabanı işlemleri çalışmaz
