# Railway.app - 5 Dakikada Backend Çalıştır

## 🚀 Adım Adım (Çok Kolay!)

### 1. Railway'a Git ve Kaydol (1 dakika)
- https://railway.app
- "Start a New Project" → "Deploy from GitHub repo"
- GitHub ile giriş yap

### 2. Repository'yi Seç (30 saniye)
- `fotograf-proje` repository'yi seç
- Railway otomatik deploy edecek

### 3. Ayarları Yap (2 dakika)

**Settings → General:**
- Root Directory: Boş bırak (veya `server` yaz)
- Start Command: `node server/server.js`
- Build Command: `npm install`

### 4. Environment Variables Ekle (1 dakika)

**Settings → Variables → New Variable:**

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

### 5. Domain Al (30 saniye)

**Settings → Domains → Generate Domain**
- URL'i kopyala: `https://your-app.railway.app`

### 6. Frontend'i Güncelle

Railway URL'ini aldıktan sonra bana söyle, frontend'i güncelleyeyim.

## ✅ Tamamlandı!

Backend artık çalışıyor! Railway URL'ini bana ver, frontend'i ona bağlayayım.

## 💰 Maliyet

- **İlk ay:** Tamamen ücretsiz
- **Sonraki aylar:** Aylık $5 kredi (çoğu proje için yeterli)
- **Kullanım:** Çok düşük maliyet

---

**Toplam Süre:** ~5 dakika
**Zorluk:** Çok kolay
