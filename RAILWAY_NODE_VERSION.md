# 🔧 Railway Node.js Versiyon Sorunu Çözümü

## ❌ Sorun

Railway Node.js 18 kullanıyor ama:
- MongoDB 7.0.0 → Node.js 20.19.0+ gerektiriyor
- Mongoose 9.0.1 → Node.js 20.19.0+ gerektiriyor
- better-sqlite3 → Python gerektiriyor (artık kullanmıyoruz)

## ✅ Çözüm

### 1. Railway'da Node.js Versiyonunu Ayarla

Railway dashboard'da:

1. **Settings** → **General** sekmesine gidin
2. **"Node Version"** veya **"NIXPACKS_NODE_VERSION"** environment variable ekleyin:
   ```
   NIXPACKS_NODE_VERSION=20
   ```

VEYA

**Settings** → **Variables** sekmesine gidin ve ekleyin:
```
NIXPACKS_NODE_VERSION=20
```

### 2. .nvmrc Dosyası Eklendi

Proje kök dizinine `.nvmrc` dosyası eklendi (Node.js 20).

### 3. better-sqlite3 Kaldırıldı

Artık MongoDB kullandığımız için `better-sqlite3` paketi `package.json`'dan kaldırıldı.

### 4. Deploy Et

1. Ayarları kaydedin
2. **Deployments** sekmesine gidin
3. **Redeploy** butonuna tıklayın

## 📋 Kontrol Listesi

Railway Settings'te:

- ✅ **NIXPACKS_NODE_VERSION=20** environment variable eklendi
- ✅ **Build Command:** `npm install`
- ✅ **Start Command:** `node server/server.js`
- ✅ **Root Directory:** Boş (veya `/`)

## 🧪 Test

Deploy başladıktan sonra loglarda şunu görmelisiniz:

```
✅ MongoDB bağlantısı başarılı
✅ Veritabanı hazır
✅ Server 5000 portunda çalışıyor
```

---

**Not:** Node.js 20 kullanmak zorunlu çünkü MongoDB 7.0.0 ve Mongoose 9.0.1 Node.js 20+ gerektiriyor.

