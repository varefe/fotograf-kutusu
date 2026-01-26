# 🆓 Ücretsiz Backend Deploy Seçenekleri

Railway ücretli olduğu için, tamamen ücretsiz alternatifler:

## 🥇 Seçenek 1: Render.com (ÖNERİLEN - En Kolay)

### ✅ Avantajlar:
- %100 ücretsiz
- GitHub entegrasyonu
- Otomatik SSL
- Kolay kurulum
- Dashboard'dan yönetim

### ⚠️ Dezavantajlar:
- 15 dakika kullanılmazsa uyku modu (ilk istek 30-60 saniye sürebilir)
- Çözüm: UptimeRobot ile her 5 dakikada bir ping

### 🚀 Kurulum (5 Dakika):

1. **https://render.com** adresine git
2. "Get Started for Free" → GitHub ile giriş yap
3. **"New +"** → **"Web Service"** seç
4. GitHub repo'yu bağla: `fotograf-proje`
5. Ayarları yap:

```
Name: fotograf-backend
Region: Frankfurt
Branch: main
Root Directory: (boş bırak)
Runtime: Node
Build Command: npm install
Start Command: node server/server.js
Plan: Free
```

6. **Environment Variables** ekle (Settings → Environment):

```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://fotografkutusu.com
MONGODB_URI=mongodb://mongo:...@yamanote.proxy.rlwy.net:38288
IYZIPAY_API_KEY=TZY4COlRiQDLL7ERFUK5FzGW3rNBDLio
IYZIPAY_SECRET_KEY=Eu1eRgVCgE3EKU90DpoKZdgiRNsIDZXN
IYZIPAY_URI=https://api.iyzipay.com
ENCRYPTION_KEY=your-32-character-encryption-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
```

7. **"Create Web Service"** butonuna tıkla
8. 2-3 dakika sonra URL hazır: `https://your-app.onrender.com`

### 🔄 Uyku Modunu Önleme:

1. **https://uptimerobot.com** (ücretsiz) adresine git
2. Yeni monitor ekle:
   - Type: HTTP(s)
   - URL: `https://your-app.onrender.com/api/health`
   - Interval: 5 dakika
3. Backend her zaman uyanık kalır

---

## 🥈 Seçenek 2: Fly.io (Daha Stabil)

### ✅ Avantajlar:
- %100 ücretsiz
- Uyku modu yok (her zaman çalışır)
- Daha hızlı
- Daha stabil

### ⚠️ Dezavantajlar:
- CLI kurulumu gerekir (biraz teknik)
- Terminal komutları kullanılır

### 🚀 Kurulum (5 Dakika):

1. **Fly.io CLI Kur:**

```bash
# macOS
curl -L https://fly.io/install.sh | sh

# Veya Homebrew
brew install flyctl
```

2. **Giriş Yap:**

```bash
fly auth signup
# veya
fly auth login
```

3. **Projeyi Deploy Et:**

```bash
cd "/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje"
fly launch
```

Sorulara cevap ver:
- App name: `fotograf-backend`
- Region: `fra` (Frankfurt)
- PostgreSQL: No
- Redis: No

4. **Environment Variables Ekle:**

```bash
fly secrets set NODE_ENV=production
fly secrets set PORT=5000
fly secrets set FRONTEND_URL=https://fotografkutusu.com
fly secrets set MONGODB_URI=mongodb://mongo:...@yamanote.proxy.rlwy.net:38288
fly secrets set IYZIPAY_API_KEY=TZY4COlRiQDLL7ERFUK5FzGW3rNBDLio
fly secrets set IYZIPAY_SECRET_KEY=Eu1eRgVCgE3EKU90DpoKZdgiRNsIDZXN
fly secrets set IYZIPAY_URI=https://api.iyzipay.com
fly secrets set ENCRYPTION_KEY=your-32-character-encryption-key
fly secrets set ADMIN_USERNAME=admin
fly secrets set ADMIN_PASSWORD=your-secure-password
fly secrets set JWT_SECRET=your-jwt-secret
```

5. **Deploy:**

```bash
fly deploy
```

6. **URL'i Al:**

```bash
fly status
# URL: https://fotograf-backend.fly.dev
```

---

## 🥉 Seçenek 3: Railway (Ücretsiz Plan)

Railway aslında ücretsiz plan sunuyor, ancak kredi bitmiş olabilir:

### Railway Ücretsiz Plan:
- Aylık $5 kredi (çoğu proje için yeterli)
- İlk ay tamamen ücretsiz
- Kredi bitince ödeme gerekir

### Kredi Kontrolü:
1. Railway dashboard'a git
2. **Settings** → **Usage** sekmesine bak
3. Kalan krediyi kontrol et

### Yeni Hesap:
Eğer kredi bittiyse, yeni bir GitHub hesabıyla yeni Railway hesabı açabilirsiniz (ücretsiz $5 kredi).

---

## 📊 Karşılaştırma

| Özellik | Render.com | Fly.io | Railway |
|---------|-----------|--------|---------|
| Ücretsiz | ✅ | ✅ | ✅ ($5/ay kredi) |
| Uyku Modu | ⚠️ Var | ✅ Yok | ✅ Yok |
| Kurulum | ⭐⭐⭐ Çok Kolay | ⭐⭐ Orta | ⭐⭐⭐ Kolay |
| Hız | ⭐⭐ Orta | ⭐⭐⭐ Hızlı | ⭐⭐⭐ Hızlı |
| Stabilite | ⭐⭐ Orta | ⭐⭐⭐ Çok İyi | ⭐⭐⭐ Çok İyi |

---

## 🎯 Öneri

**Render.com** ile başlayın:
- En kolay kurulum
- Dashboard'dan yönetim
- Uyku modunu UptimeRobot ile çözün

Eğer Render çalışmazsa, **Fly.io**'yu deneyin:
- Daha stabil
- Uyku modu yok
- Biraz daha teknik

---

## 🆘 Sorun Giderme

### Render.com:
- Detaylı rehber: `RENDER_UREETSIZ_DEPLOY.md`
- Sorun giderme: `RENDER_HATA_COZUMU.md`

### Fly.io:
- Detaylı rehber: `FLY_IO_HIZLI_KURULUM.md`
- Ücretsiz plan: `FLY_IO_UREETSIZ.md`

---

## ✅ Sonuç

**Render.com** en kolay ve en hızlı çözüm. 5 dakikada hazır olur!

**Adımlar:**
1. https://render.com → GitHub ile giriş
2. New Web Service → Repo'yu bağla
3. Ayarları yap → Deploy
4. URL'i al → Frontend'i güncelle

**Toplam Süre:** ~5 dakika
**Maliyet:** Tamamen ücretsiz
