# 🚀 Production API Sorunu Çözüm Rehberi

## ❌ Sorun

Production'da `/api/payment/create` isteği HTML döndürüyor. Bu, backend sunucusunun çalışmadığı veya yanlış yönlendirme yapıldığı anlamına geliyor.

## ✅ Yapılan Düzeltmeler

1. ✅ `Payment.jsx` artık `src/config/api.js` dosyasını kullanıyor
2. ✅ API URL yapılandırması merkezi hale getirildi

## 🔧 Çözüm Seçenekleri

### Seçenek 1: Backend'i Render.com'da Başlat (Önerilen - Ücretsiz)

1. **Render.com'a giriş yapın:**
   - https://render.com
   - GitHub hesabınızla giriş yapın

2. **Yeni Web Service oluşturun:**
   - "New +" → "Web Service"
   - GitHub repo'nuzu seçin

3. **Ayarları yapın:**
   - **Name:** `fotograf-backend`
   - **Root Directory:** Boş bırak (veya `server` yazın)
   - **Build Command:** `npm install`
   - **Start Command:** `node server/server.js`

4. **Environment Variables ekleyin:**
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

5. **Deploy edin:**
   - Render.com otomatik olarak deploy edecek
   - URL'i kopyalayın: `https://fotograf-backend.onrender.com`

6. **Frontend'i güncelleyin:**
   - `src/config/api.js` dosyasında Render.com URL'i zaten var
   - Build yapın: `npm run build`
   - Production'a yükleyin

### Seçenek 2: Backend'i Railway.app'de Başlat (Alternatif)

1. **Railway.app'e giriş yapın:**
   - https://railway.app
   - GitHub hesabınızla giriş yapın

2. **Yeni proje oluşturun:**
   - "New Project" → "Deploy from GitHub repo"
   - Repo'nuzu seçin

3. **Ayarları yapın:**
   - **Root Directory:** Boş bırak
   - **Build Command:** `npm install`
   - **Start Command:** `node server/server.js`

4. **Environment Variables ekleyin** (Render.com ile aynı)

5. **Domain alın:**
   - Settings → Domains → "Generate Domain"
   - URL'i kopyalayın

6. **Frontend'i güncelleyin:**
   - `src/config/api.js` dosyasında Railway URL'ini kullanın:
   ```javascript
   return 'https://your-app.railway.app'
   ```
   - Build yapın: `npm run build`
   - Production'a yükleyin

### Seçenek 3: Backend'i Aynı Sunucuda Çalıştır (cPanel/SSH Erişimi Varsa)

1. **SSH ile sunucuya bağlanın:**
   ```bash
   ssh kullanici@fotografkutusu.com
   ```

2. **Backend'i başlatın:**
   ```bash
   cd ~/fotograf-proje  # veya doğru klasör
   npm install
   pm2 start server/server.js --name "fotograf-backend" --env production
   pm2 save
   ```

3. **Frontend'i güncelleyin:**
   - `src/config/api.js` dosyasında:
   ```javascript
   // Production ortamında
   if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
     return '/api'  // Aynı sunucuda, mod_proxy ile
   }
   ```

4. **.htaccess'i kontrol edin:**
   - `mod_proxy` aktif olmalı
   - `.htaccess` dosyasında proxy ayarları olmalı

5. **Build yapın:**
   ```bash
   npm run build
   ```
   - Production'a yükleyin

### Seçenek 4: Backend'i Ayrı Subdomain'de Çalıştır (cPanel Erişimi Varsa)

1. **cPanel'de subdomain oluşturun:**
   - Subdomains → `api` subdomain'i oluşturun
   - Document root: `/home/kullanici/api.fotografkutusu.com`

2. **Backend dosyalarını yükleyin:**
   - `server/` klasörü
   - `package.json`
   - `.env` dosyası

3. **Backend'i başlatın:**
   ```bash
   cd ~/api.fotografkutusu.com
   npm install
   pm2 start server/server.js --name "fotograf-backend-api" --env production
   pm2 save
   ```

4. **Frontend'i güncelleyin:**
   - `src/config/api.js` dosyasında:
   ```javascript
   // Production ortamında
   if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
     return 'https://api.fotografkutusu.com'
   }
   ```

5. **Build yapın:**
   ```bash
   npm run build
   ```
   - Production'a yükleyin

## 📋 Kontrol Listesi

Backend'i başlattıktan sonra:

- [ ] Backend health check çalışıyor: `curl https://backend-url/api/health`
- [ ] Frontend'te `src/config/api.js` doğru URL'i kullanıyor
- [ ] Build yapıldı: `npm run build`
- [ ] Production'a yüklendi
- [ ] Tarayıcıda test edildi: Ödeme sayfası çalışıyor

## 🧪 Test

### Backend Test

```bash
# Health check
curl https://your-backend-url/api/health

# Beklenen yanıt:
# {"status":"OK","message":"Server is running"}
```

### Frontend Test

1. Tarayıcıda ödeme sayfasına gidin
2. Chrome DevTools → Network sekmesi
3. Ödeme formu oluşturulurken:
   - ✅ API isteği backend URL'ine gidiyor
   - ✅ JSON response dönüyor (HTML değil)
   - ✅ Ödeme formu oluşturuluyor

## 🆘 Sorun Giderme

### Backend 404 Döndürüyor

- Backend'in çalıştığını kontrol edin
- URL'in doğru olduğunu kontrol edin
- Environment variables'ın doğru olduğunu kontrol edin

### Frontend Hala HTML Döndürüyor

- `src/config/api.js` dosyasında doğru URL var mı?
- Build yapıldı mı? (`npm run build`)
- Production'a yüklendi mi?
- Tarayıcı cache'i temizlendi mi?

### CORS Hatası

- Backend'de `FRONTEND_URL` environment variable'ı doğru mu?
- CORS ayarları `server/server.js` dosyasında doğru mu?

---

**Not:** En kolay çözüm Render.com veya Railway.app kullanmak. Ücretsiz ve kolay kurulum.

