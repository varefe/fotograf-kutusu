# cPanel Olmadan Backend Kurulumu

## 🚨 Durum
- ❌ cPanel çalışmıyor
- ❌ SSH erişimi yok
- ✅ Backend kodları hazır

## 🔧 Çözüm: Ücretsiz Cloud Servisler

cPanel olmadan backend'i çalıştırmak için ücretsiz cloud servisler kullanabiliriz:

### Seçenek 1: Railway.app (ÖNERİLEN - En Kolay)

1. **Railway'a kaydol:**
   - https://railway.app
   - GitHub ile giriş yap

2. **Yeni proje oluştur:**
   - "New Project" → "Deploy from GitHub repo"
   - Repository'yi seç

3. **Backend'i deploy et:**
   - Root directory: `/` (veya `server/` klasörü)
   - Start command: `node server/server.js`
   - Port: 5000

4. **Environment variables ekle:**
   - `.env` dosyasındaki tüm değişkenleri ekle

5. **URL'i al:**
   - Railway bir URL verir: `https://your-app.railway.app`
   - Bu URL'i frontend'de kullan

### Seçenek 2: Render.com

1. **Render'a kaydol:**
   - https://render.com
   - GitHub ile giriş yap

2. **Yeni Web Service oluştur:**
   - GitHub repo'yu bağla
   - Build command: `npm install`
   - Start command: `node server/server.js`

3. **Environment variables ekle**

4. **URL'i al ve frontend'de kullan**

### Seçenek 3: Fly.io

1. **Fly.io'ya kaydol:**
   - https://fly.io
   - CLI kur: `curl -L https://fly.io/install.sh | sh`

2. **Deploy et:**
   ```bash
   fly launch
   fly deploy
   ```

### Seçenek 4: Backend'i Localhost'ta Çalıştır (Geçici Test)

Sadece test için localhost'ta çalıştırabilirsiniz:

```bash
# Backend'i başlat
npm run server

# Frontend'de src/config/api.js dosyasını geçici olarak:
# return 'http://localhost:5000'  # Development için zaten var
```

**Not:** Bu sadece sizin bilgisayarınızda çalışır, başkaları erişemez.

## 📝 Frontend'i Güncelleme

Backend URL'ini aldıktan sonra:

1. **src/config/api.js** dosyasını düzenle:
   ```javascript
   if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
     return 'https://your-backend-url.railway.app' // veya Render/Fly.io URL'i
   }
   ```

2. **Frontend'i rebuild et:**
   ```bash
   npm run build
   ```

3. **Production'a yükle:**
   - `dist/` klasöründeki dosyaları yükle

## 🎯 Hızlı Başlangıç: Railway

1. Railway.app'e git → GitHub ile giriş
2. New Project → Deploy from GitHub
3. Repo'yu seç
4. Environment variables ekle
5. Deploy et
6. URL'i kopyala
7. Frontend'de kullan

**Süre:** ~10 dakika

---

**Not:** Bu yöntemler cPanel'e ihtiyaç duymaz ve ücretsizdir (belirli limitler dahilinde).

