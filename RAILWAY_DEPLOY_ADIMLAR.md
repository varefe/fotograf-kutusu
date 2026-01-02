# Railway.app ile Backend Deploy - Adım Adım

## 🚀 Ücretsiz ve Kolay - 10 Dakikada Hazır

### Adım 1: Railway'a Kaydol (2 dakika)

1. **https://railway.app** adresine git
2. "Start a New Project" butonuna tıkla
3. **"Deploy from GitHub repo"** seç
4. GitHub hesabınla giriş yap
5. Repository'yi seç: `fotograf-proje` (veya repo adın neyse)

### Adım 2: Projeyi Ayarla (3 dakika)

1. Railway'da proje açıldığında **"Settings"** sekmesine git
2. **"Root Directory"** boş bırak (veya `server` yaz eğer backend server klasöründeyse)
3. **"Start Command"** kısmına yaz:
   ```
   node server/server.js
   ```
4. **"Build Command"** kısmına yaz:
   ```
   npm install
   ```

### Adım 3: Environment Variables Ekle (2 dakika)

1. Railway'da **"Variables"** sekmesine git
2. **"New Variable"** butonuna tıkla
3. Şu değişkenleri tek tek ekle:

```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://fotografkutusu.com
IYZIPAY_API_KEY=TZY4COlRiQDLL7ERFUK5FzGW3rNBDLio
IYZIPAY_SECRET_KEY=Eu1eRgVCgE3EKU90DpoKZdgiRNsIDZXN
IYZIPAY_URI=https://api.iyzipay.com
ENCRYPTION_KEY=your-encryption-key-buraya
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password-buraya
```

**Not:** `ENCRYPTION_KEY` ve `ADMIN_PASSWORD` için güvenli değerler kullan.

### Adım 4: Domain Al (1 dakika)

1. Railway'da **"Settings"** → **"Domains"** sekmesine git
2. **"Generate Domain"** butonuna tıkla
3. URL'i kopyala: `https://your-app.railway.app`

### Adım 5: Frontend'i Güncelle (2 dakika)

1. `src/config/api.js` dosyasını aç
2. Şu satırı bul:
   ```javascript
   return '/api'
   ```
3. Şununla değiştir:
   ```javascript
   return 'https://your-app.railway.app' // Railway URL'inizi buraya yazın
   ```

4. Frontend'i rebuild et:
   ```bash
   npm run build
   ```

5. `dist/` klasörünü production'a yükle

## ✅ Tamamlandı!

Backend artık Railway'da çalışıyor ve frontend ona bağlanabilir.

## 🆘 Sorun Giderme

### Backend Başlamıyor

1. Railway dashboard'da **"Logs"** sekmesine bak
2. Hata mesajlarını kontrol et
3. Environment variables doğru mu kontrol et

### API İstekleri Çalışmıyor

1. Railway URL'ini kontrol et: `https://your-app.railway.app/api/health`
2. JSON döndürmeli: `{"status":"OK","message":"Server is running"}`
3. Frontend'de URL doğru mu kontrol et

### CORS Hatası

1. `server/server.js` dosyasında CORS ayarlarını kontrol et
2. `FRONTEND_URL` environment variable'ı doğru mu?

## 💰 Maliyet

Railway ücretsiz plan:
- Aylık $5 kredi (çoğu küçük proje için yeterli)
- İlk ay tamamen ücretsiz
- Sonraki aylarda kullanım başına ödeme

---

**Süre:** Toplam ~10 dakika
**Maliyet:** Ücretsiz (ilk ay), sonra çok düşük

