# 🚨 Render.com ACİL DÜZELTME

## ❌ Sorun

Render.com şu ayarları kullanıyor (YANLIŞ):
- Root Directory: `src` ❌
- Build Command: `npm run dev` ❌

## ✅ Doğru Ayarlar

Render.com dashboard'da şunları değiştir:

### 1. Settings → General

**Root Directory:**
- **TAMAMEN SİL, BOŞ BIRAK** (hiçbir şey yazma)
- Şu an `src` yazıyor, sil!

**Build Command:**
- Şu an: `npm run dev` ❌
- Olması gereken: `npm install` ✅

**Start Command:**
- Olması gereken: `node server/server.js` ✅

### 2. Deploy

1. Ayarları kaydet
2. **"Manual Deploy"** → **"Deploy latest commit"** tıkla

## 📋 Kontrol Listesi

- [ ] Root Directory **BOŞ** (hiçbir şey yok)
- [ ] Build Command: `npm install`
- [ ] Start Command: `node server/server.js`
- [ ] Environment variables eklendi
- [ ] Deploy edildi

## 🆘 Hala Çalışmıyorsa

Render dashboard → **Logs** sekmesine bak ve hatayı paylaş.

---

**ÖNEMLİ:** Root Directory'yi **KESINLIKLE BOŞ BIRAK**, `src` yazma!

