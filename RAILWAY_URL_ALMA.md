# 🔗 Railway Backend URL'ini Alma

## 🎯 Hızlı Yöntem: Dashboard'dan (Önerilen)

### Adım 1: Railway Dashboard'a Git

1. https://railway.app adresine gidin
2. Projenize girin
3. **"heartfelt-embrace"** servisine tıklayın

### Adım 2: URL'i Al

**Yöntem 1: Settings → Domains**
1. **Settings** sekmesine tıklayın
2. **Domains** sekmesine gidin
3. **"Generate Domain"** butonuna tıklayın (eğer domain yoksa)
4. URL'i kopyalayın (örn: `https://heartfelt-embrace-production.up.railway.app`)

**Yöntem 2: Settings → General**
1. **Settings** → **General** sekmesine gidin
2. **"Public Domain"** bölümünde URL'i görebilirsiniz

**Yöntem 3: Service Overview**
1. Servis sayfasında üst kısımda URL'i görebilirsiniz
2. Yeşil nokta yanında URL yazıyor

## 🔧 Railway CLI ile (Alternatif)

Eğer Railway CLI kullanmak istiyorsanız:

### 1. Railway CLI Kur

```bash
curl -fsSL https://railway.com/install.sh | sh
```

### 2. Projeyi Linkle

```bash
railway link -p 90eaeee1-4637-48ed-9f7b-9b82887bfbde
```

### 3. URL'i Al

```bash
railway domain
```

VEYA

```bash
railway status
```

## 📋 URL Formatı

Railway URL'leri genellikle şu formatta olur:
- `https://heartfelt-embrace-production.up.railway.app`
- `https://heartfelt-embrace.railway.app`
- `https://your-service-name.up.railway.app`

## ✅ URL'i Aldıktan Sonra

URL'i aldıktan sonra bana söyleyin, frontend'i güncelleyip build yapayım!

VEYA

Kendiniz güncellemek isterseniz:

1. `src/config/api.js` dosyasını açın
2. 16. satırı bulun: `return import.meta.env.VITE_RAILWAY_URL || '/api'`
3. Şununla değiştirin: `return 'https://your-railway-url.railway.app'`
4. Build yapın: `npm run build`

---

**Not:** Dashboard'dan URL almak daha kolay ve hızlıdır. Railway CLI kurulumu gerekmez.

