# 🚀 Railway Backend Deploy Rehberi

## ❌ Sorun

Production'da API endpoint'leri 404 hatası veriyor:
- `Cannot POST /api/user/login`
- `Cannot GET /api/user/profile`

Bu, Railway'deki backend'in güncel olmadığı veya route'ların düzgün mount edilmediği anlamına geliyor.

## ✅ Çözüm: Railway Backend'i Yeniden Deploy Et

### Adım 1: Railway Dashboard'a Git

1. https://railway.app adresine gidin
2. Projenize girin
3. **"heartfelt-embrace"** servisine tıklayın

### Adım 2: Deploy Ayarlarını Kontrol Et

1. **Settings** → **General** sekmesine gidin
2. Şu ayarları kontrol edin:
   - **Root Directory**: Boş bırak (veya `server` yazın - eğer backend `server/` klasöründeyse)
   - **Build Command**: `npm install` (veya boş bırak)
   - **Start Command**: `node server/server.js` (veya `npm start`)

### Adım 3: Environment Variables Kontrol Et

**Settings** → **Variables** sekmesinde şu değişkenler olmalı:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://fotografkutusu.com
MONGODB_URI=mongodb+srv://...
IYZIPAY_API_KEY=TZY4COlRiQDLL7ERFUK5FzGW3rNBDLio
IYZIPAY_SECRET_KEY=Eu1eRgVCgE3EKU90DpoKZdgiRNsIDZXN
IYZIPAY_URI=https://api.iyzipay.com
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key
```

### Adım 4: Manuel Deploy Tetikle

1. **Deployments** sekmesine gidin
2. **"Redeploy"** butonuna tıklayın
3. Veya **Settings** → **General** → **"Redeploy"** butonuna tıklayın

### Adım 5: Log'ları Kontrol Et

1. **Deployments** sekmesinde en son deployment'a tıklayın
2. **Logs** sekmesine gidin
3. Şu mesajları görmelisiniz:
   - `✅ MongoDB bağlantısı başarılı`
   - `✅ Server 5000 portunda çalışıyor`
   - `🌐 Environment: production`

### Adım 6: Test Et

Deploy tamamlandıktan sonra:

```bash
# Health check
curl https://heartfelt-embrace-production-3c74.up.railway.app/api/health

# Login test (404 hatası almamalı)
curl -X POST https://heartfelt-embrace-production-3c74.up.railway.app/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

Eğer hala 404 hatası alıyorsanız, Railway'deki backend kodunun güncel olduğundan emin olun.

## 🔄 Alternatif: GitHub'dan Otomatik Deploy

Eğer Railway GitHub repo'nuzu otomatik deploy ediyorsa:

1. Değişiklikleri GitHub'a push edin:
   ```bash
   git add .
   git commit -m "Backend route'ları düzeltildi"
   git push origin main
   ```

2. Railway otomatik olarak deploy edecek
3. Deploy tamamlandıktan sonra test edin

## ⚠️ Önemli Notlar

- Railway'de backend'in **root directory** ayarı doğru olmalı
- Eğer backend `server/` klasöründeyse, **Root Directory**'ye `server` yazın
- Eğer backend root'taysa, **Root Directory**'yi boş bırakın
- **Start Command** mutlaka `node server/server.js` veya `npm start` olmalı

## 🐛 Hala Sorun Varsa

1. Railway log'larını kontrol edin
2. Backend'in çalıştığından emin olun (health check)
3. Route'ların doğru mount edildiğini kontrol edin
4. Environment variables'ların doğru olduğunu kontrol edin

