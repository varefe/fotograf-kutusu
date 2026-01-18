# Fly.io - Tamamen Ücretsiz Alternatif

## 🆓 %100 Ücretsiz

Fly.io'nun ücretsiz planı:
- ✅ Tamamen ücretsiz
- ✅ 3 shared-cpu-1x VM (ücretsiz)
- ✅ 160GB outbound data transfer (aylık)
- ✅ Uyku modu yok (her zaman çalışır)

## 🚀 Kurulum

### 1. Fly.io CLI Kur

```bash
# macOS
curl -L https://fly.io/install.sh | sh

# Veya Homebrew
brew install flyctl
```

### 2. Giriş Yap

```bash
fly auth signup
# veya
fly auth login
```

### 3. Projeyi Deploy Et

```bash
cd "/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje"
fly launch
```

### 4. Environment Variables Ekle

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
# URL'i gösterir: https://your-app.fly.dev
```

---

**Not:** Fly.io biraz daha teknik, ama tamamen ücretsiz ve uyku modu yok.

