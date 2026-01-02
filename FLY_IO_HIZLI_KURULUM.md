# Fly.io - Hızlı Kurulum (Render Çalışmıyorsa)

## 🚀 5 Dakikada Backend Çalıştır

Render.com çalışmıyorsa, Fly.io'yu deneyelim. Tamamen ücretsiz ve daha stabil.

### 1. Fly.io CLI Kur (1 dakika)

```bash
# macOS
curl -L https://fly.io/install.sh | sh

# Veya Homebrew
brew install flyctl
```

### 2. Giriş Yap (1 dakika)

```bash
fly auth signup
# veya
fly auth login
```

### 3. Projeyi Deploy Et (2 dakika)

```bash
cd "/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje"

# Fly.io'ya başlat
fly launch

# Sorulara cevap ver:
# - App name: fotograf-backend (veya istediğin isim)
# - Region: fra (Frankfurt - Türkiye'ye yakın)
# - PostgreSQL: No
# - Redis: No
```

### 4. Environment Variables Ekle (1 dakika)

```bash
fly secrets set NODE_ENV=production
fly secrets set PORT=5000
fly secrets set FRONTEND_URL=https://fotografkutusu.com
fly secrets set IYZIPAY_API_KEY=TZY4COlRiQDLL7ERFUK5FzGW3rNBDLio
fly secrets set IYZIPAY_SECRET_KEY=Eu1eRgVCgE3EKU90DpoKZdgiRNsIDZXN
fly secrets set IYZIPAY_URI=https://api.iyzipay.com
fly secrets set ENCRYPTION_KEY=rastgele-güvenli-anahtar
fly secrets set ADMIN_USERNAME=admin
fly secrets set ADMIN_PASSWORD=güvenli-şifre
```

### 5. Deploy

```bash
fly deploy
```

### 6. URL'i Al

```bash
fly status
# URL'i gösterir: https://fotograf-backend.fly.dev
```

## ✅ Tamamlandı!

Backend artık Fly.io'da çalışıyor. URL'i bana ver, frontend'i ona bağlayayım.

## 💰 Maliyet

- Tamamen ücretsiz
- 3 shared-cpu-1x VM (ücretsiz)
- 160GB outbound data transfer (aylık)
- Uyku modu yok (her zaman çalışır)

---

**Not:** Fly.io Render.com'dan daha stabil ve Root Directory sorunu yok.



