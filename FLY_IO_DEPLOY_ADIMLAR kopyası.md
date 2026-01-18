# Fly.io Deploy - Adım Adım

## 🚀 Render.com Çalışmıyor, Fly.io'ya Geçiyoruz

Fly.io daha stabil ve Root Directory sorunu yok.

### 1. Fly.io'ya Giriş Yap

Terminal'de çalıştır:

```bash
export PATH="$HOME/.fly/bin:$PATH"
flyctl auth signup
```

Veya eğer hesabın varsa:

```bash
export PATH="$HOME/.fly/bin:$PATH"
flyctl auth login
```

### 2. Projeyi Deploy Et

```bash
cd "/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje"
export PATH="$HOME/.fly/bin:$PATH"

flyctl launch
```

Sorulara cevap ver:
- **App name:** `fotograf-backend` (veya istediğin isim)
- **Region:** `fra` (Frankfurt - Türkiye'ye yakın)
- **PostgreSQL:** `No`
- **Redis:** `No`
- **fly.toml oluşturulsun mu?** `Yes` (zaten var, üzerine yazabilirsin)

### 3. Environment Variables Ekle

```bash
export PATH="$HOME/.fly/bin:$PATH"

flyctl secrets set NODE_ENV=production
flyctl secrets set PORT=5000
flyctl secrets set FRONTEND_URL=https://fotografkutusu.com
flyctl secrets set IYZIPAY_API_KEY=TZY4COlRiQDLL7ERFUK5FzGW3rNBDLio
flyctl secrets set IYZIPAY_SECRET_KEY=Eu1eRgVCgE3EKU90DpoKZdgiRNsIDZXN
flyctl secrets set IYZIPAY_URI=https://api.iyzipay.com
flyctl secrets set ENCRYPTION_KEY=rastgele-güvenli-anahtar-buraya
flyctl secrets set ADMIN_USERNAME=admin
flyctl secrets set ADMIN_PASSWORD=güvenli-şifre-buraya
```

### 4. Deploy

```bash
export PATH="$HOME/.fly/bin:$PATH"
flyctl deploy
```

### 5. URL'i Al

```bash
export PATH="$HOME/.fly/bin:$PATH"
flyctl status
```

URL'i gösterir: `https://fotograf-backend.fly.dev`

## ✅ Tamamlandı!

Backend artık Fly.io'da çalışıyor. URL'i bana ver, frontend'i ona bağlayayım.

## 💰 Maliyet

- Tamamen ücretsiz
- Uyku modu yok (her zaman çalışır)
- Render.com'dan daha stabil

---

**Not:** `fly.toml` dosyası zaten hazır, sadece giriş yapıp deploy etmen yeterli.






