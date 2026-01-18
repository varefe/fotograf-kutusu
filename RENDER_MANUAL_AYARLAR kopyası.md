# Render.com Manuel Ayarlar (render.yaml Çalışmıyorsa)

## 🔧 Render Dashboard'da Yapılacaklar

Eğer `render.yaml` çalışmıyorsa, Render dashboard'da manuel ayarla:

### 1. Settings → General

**Root Directory:** 
- **BOŞ BIRAK** (hiçbir şey yazma)
- VEYA sadece `.` (nokta) yaz

**Build Command:**
```
npm install
```

**Start Command:**
```
node server/server.js
```

### 2. Settings → Environment

Şu environment variables'ları ekle (her birini ayrı ayrı):

```
NODE_ENV = production
PORT = 5000
FRONTEND_URL = https://fotografkutusu.com
IYZIPAY_API_KEY = TZY4COlRiQDLL7ERFUK5FzGW3rNBDLio
IYZIPAY_SECRET_KEY = Eu1eRgVCgE3EKU90DpoKZdgiRNsIDZXN
IYZIPAY_URI = https://api.iyzipay.com
ENCRYPTION_KEY = rastgele-güvenli-anahtar-buraya
ADMIN_USERNAME = admin
ADMIN_PASSWORD = güvenli-şifre-buraya
```

### 3. Deploy

**"Manual Deploy"** → **"Deploy latest commit"** tıkla

## ⚠️ Önemli

- Root Directory **KESINLIKLE BOŞ** olmalı veya sadece `.` olmalı
- `src` yazarsan hata verir
- `server` yazarsan hata verir
- Sadece **BOŞ** veya **`.`** (nokta)

## 🆘 Hala Çalışmıyorsa

1. Render dashboard → **Logs** sekmesine bak
2. Hata mesajını kontrol et
3. Root Directory'nin boş olduğundan emin ol
4. Build Command ve Start Command'ın doğru olduğundan emin ol

---

**Not:** render.yaml dosyasını silip manuel ayarlamak daha iyi olabilir.

