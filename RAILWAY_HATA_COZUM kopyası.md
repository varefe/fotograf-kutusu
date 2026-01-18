# 🚨 Railway "Railpack could not determine" Hatası Çözümü

## ❌ Hata

```
✖ Railpack could not determine how to build the app
```

Bu hata, Railway'ın otomatik olarak build komutunu belirleyemediği anlamına gelir.

## ✅ Çözüm

Railway'da manuel olarak build ve start komutlarını ayarlamanız gerekiyor.

### Adım 1: Railway Dashboard'a Git

1. Railway.app'de projenize gidin
2. **"Settings"** sekmesine tıklayın
3. **"General"** bölümüne gidin

### Adım 2: Build ve Start Komutlarını Ayarla

**Build Command:**
```
npm install
```

**Start Command:**
```
node server/server.js
```

**Root Directory:**
- Boş bırakın (veya `/` yazın)
- **ÖNEMLİ:** `src` yazmayın!

### Adım 3: Deploy Et

1. Ayarları kaydedin
2. **"Deployments"** sekmesine gidin
3. **"Redeploy"** butonuna tıklayın
4. Veya yeni bir commit yapın (otomatik deploy olur)

## 🔍 Kontrol Listesi

Railway Settings'te şunlar olmalı:

- ✅ **Root Directory:** Boş (veya `/`)
- ✅ **Build Command:** `npm install`
- ✅ **Start Command:** `node server/server.js`
- ✅ **Environment Variables:** Tüm değişkenler eklenmiş

## 🆘 Hala Çalışmıyorsa

### 1. Logları Kontrol Et

Railway dashboard'da **"Logs"** sekmesine bakın ve hata mesajlarını kontrol edin.

### 2. package.json Kontrolü

`package.json` dosyasında şu script'ler olmalı:

```json
{
  "scripts": {
    "server": "node server/server.js",
    "start": "node server/server.js"
  }
}
```

### 3. Root Directory Sorunu

Eğer hala çalışmıyorsa:

1. **Root Directory'yi tamamen boş bırakın** (hiçbir şey yazmayın)
2. Veya `/` yazın
3. **KESINLIKLE `src` yazmayın!**

### 4. Node.js Versiyonu

Railway Settings'te:
- **Node Version:** 18 veya 20 seçin

## 📋 Doğru Ayarlar Özeti

```
Root Directory: (boş)
Build Command: npm install
Start Command: node server/server.js
Node Version: 18 (veya 20)
```

## ✅ Test

Deploy başladıktan sonra:

1. **Logs** sekmesinde şunu görmelisiniz:
   ```
   ==> Installing dependencies...
   ==> Starting application...
   ✅ Server 5000 portunda çalışıyor
   ```

2. **Health check:**
   - Railway URL'inizi alın: `https://your-app.railway.app`
   - Tarayıcıda açın: `https://your-app.railway.app/api/health`
   - JSON döndürmeli: `{"status":"OK","message":"Server is running"}`

---

**Not:** Bu hata genellikle Root Directory veya Build Command ayarlarının eksik olmasından kaynaklanır.

