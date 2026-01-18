# Render.com - Tamamen Ücretsiz Backend Deploy

## 🆓 %100 Ücretsiz - Sınırsız

Render.com'un ücretsiz planı:
- ✅ Tamamen ücretsiz
- ✅ Sınırsız deploy
- ✅ GitHub entegrasyonu
- ✅ Otomatik SSL
- ⚠️ 15 dakika kullanılmazsa uyku modu (ilk istekte uyanır)

## 🚀 Adım Adım (5 Dakika)

### Adım 1: Render'a Kaydol (1 dakika)

1. **https://render.com** adresine git
2. "Get Started for Free" butonuna tıkla
3. **GitHub ile giriş yap**
4. Repository'ye erişim izni ver

### Adım 2: Yeni Web Service Oluştur (2 dakika)

1. Render dashboard'da **"New +"** butonuna tıkla
2. **"Web Service"** seç
3. **"Connect GitHub"** → Repository'yi seç: `fotograf-proje`
4. Ayarları yap:

**Name:** `fotograf-backend` (veya istediğin isim)

**Region:** `Frankfurt` (Türkiye'ye en yakın)

**Branch:** `main` (veya `master`)

**Root Directory:** Boş bırak (veya `server` yaz)

**Runtime:** `Node`

**Build Command:** 
```
npm install
```

**Start Command:**
```
node server/server.js
```

**Plan:** `Free` (ücretsiz plan)

### Adım 3: Environment Variables Ekle (1 dakika)

**"Environment"** sekmesine git ve şunları ekle:

```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://fotografkutusu.com
IYZIPAY_API_KEY=TZY4COlRiQDLL7ERFUK5FzGW3rNBDLio
IYZIPAY_SECRET_KEY=Eu1eRgVCgE3EKU90DpoKZdgiRNsIDZXN
IYZIPAY_URI=https://api.iyzipay.com
ENCRYPTION_KEY=rastgele-güvenli-anahtar-buraya
ADMIN_USERNAME=admin
ADMIN_PASSWORD=güvenli-şifre-buraya
```

### Adım 4: Deploy Et (1 dakika)

1. **"Create Web Service"** butonuna tıkla
2. Render otomatik deploy edecek (2-3 dakika sürer)
3. Deploy tamamlandığında URL'i gör: `https://your-app.onrender.com`

### Adım 5: Frontend'i Güncelle

Render URL'ini aldıktan sonra bana söyle, frontend'i güncelleyeyim.

## ✅ Tamamlandı!

Backend artık Render'da çalışıyor! URL'i bana ver, frontend'i ona bağlayayım.

## ⚠️ Önemli Notlar

### Uyku Modu

Render'ın ücretsiz planında:
- 15 dakika kullanılmazsa uyku moduna geçer
- İlk istek 30-60 saniye sürebilir (uyanma süresi)
- Sonraki istekler normal hızda

**Çözüm:** 
- Ücretsiz bir "ping" servisi kullan (UptimeRobot, Pingdom)
- Her 10 dakikada bir health check yap
- Backend uyanık kalır

### Health Check Endpoint

Backend'de zaten var: `/api/health`

UptimeRobot ile:
1. https://uptimerobot.com (ücretsiz)
2. Yeni monitor ekle
3. URL: `https://your-app.onrender.com/api/health`
4. Interval: 5 dakika

## 🆘 Sorun Giderme

### Deploy Başarısız

1. Logs'a bak: Render dashboard → Logs
2. Environment variables doğru mu?
3. Start command doğru mu?

### API Çalışmıyor

1. Health check: `https://your-app.onrender.com/api/health`
2. JSON döndürmeli
3. CORS ayarlarını kontrol et

---

**Maliyet:** Tamamen ücretsiz
**Süre:** ~5 dakika
**Zorluk:** Çok kolay

