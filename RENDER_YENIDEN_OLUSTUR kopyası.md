# 🔄 Render.com Projeyi Yeniden Oluştur

## ❌ Sorun

Root Directory ayarı düzeltilmiyor. En kolay çözüm: Projeyi silip yeniden oluştur.

## ✅ Çözüm: Projeyi Yeniden Oluştur

### Adım 1: Mevcut Projeyi Sil

1. Render.com dashboard'a git
2. **"fotograf-backend"** projesine tıkla
3. **"Settings"** sekmesine git
4. En altta **"Delete Service"** butonuna tıkla
5. Onayla

### Adım 2: Yeni Proje Oluştur

1. Dashboard'da **"New +"** butonuna tıkla
2. **"Web Service"** seç
3. **"Connect GitHub"** → Repository'yi seç: `fotograf-kutusu`

### Adım 3: Ayarları Yap (ÖNEMLİ!)

**Name:** `fotograf-backend`

**Region:** `Frankfurt`

**Branch:** `main`

**Root Directory:** 
- **BOŞ BIRAK** (hiçbir şey yazma!)
- Bu çok önemli!

**Runtime:** `Node`

**Build Command:**
```
npm install
```

**Start Command:**
```
node server/server.js
```

**Plan:** `Free`

### Adım 4: Environment Variables Ekle

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

### Adım 5: Create Web Service

**"Create Web Service"** butonuna tıkla. Deploy başlayacak.

## ✅ Kontrol

Deploy başladığında **"Logs"** sekmesine git. Şunu görmelisin:

```
==> Running build command 'npm install'...
==> Installing dependencies...
```

Eğer hala `/opt/render/project/src/package.json` görüyorsan, Root Directory'yi tekrar kontrol et - **KESINLIKLE BOŞ** olmalı.

---

**Not:** Projeyi silip yeniden oluşturmak, Root Directory ayarını sıfırlar ve doğru ayarlarla başlamanı sağlar.






