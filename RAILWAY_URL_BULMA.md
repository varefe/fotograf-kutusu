# 🔗 Railway Backend URL'ini Bulma

## ✅ Durum

Railway'da servisler deploy edilmiş:
- ✅ **heartfelt-embrace** (Backend servisi)
- ✅ **MongoDB** (Database servisi)

## 📍 URL'i Bulma

### Yöntem 1: Railway Dashboard'dan (En Kolay)

1. **Railway.app** → Projenize gidin
2. **"heartfelt-embrace"** servisine tıklayın
3. Üst kısımda **yeşil nokta** yanında URL'i görebilirsiniz
   - Örnek: `https://heartfelt-embrace-production.up.railway.app`

VEYA

1. **Settings** → **Domains** sekmesine gidin
2. **"Generate Domain"** butonuna tıklayın (eğer domain yoksa)
3. URL'i kopyalayın

### Yöntem 2: Railway CLI ile

```bash
# Railway CLI kur (eğer yoksa)
curl -fsSL https://railway.com/install.sh | sh

# Projeyi linkle
railway link -p 90eaeee1-4637-48ed-9f7b-9b82887bfbde

# URL'i al
railway domain
```

## 🎯 URL Formatı

Railway URL'leri genellikle şu formatta olur:
- `https://heartfelt-embrace-production.up.railway.app`
- `https://heartfelt-embrace.railway.app`
- `https://heartfelt-embrace-production.railway.app`

## ✅ URL'i Aldıktan Sonra

URL'i aldıktan sonra:

1. **Bana söyleyin** → Frontend'i güncelleyip build yapayım
2. **VEYA kendiniz güncelleyin:**
   - `src/config/api.js` dosyasını açın
   - 16. satırı bulun
   - Railway URL'inizi yazın
   - `npm run build` yapın

## 🔍 Hızlı Kontrol

URL'i aldıktan sonra test edin:

```bash
curl https://your-railway-url.railway.app/api/health
```

Beklenen yanıt:
```json
{"status":"OK","message":"Server is running"}
```

---

**Not:** Railway dashboard'da servis sayfasında URL'i görebilirsiniz. Yeşil "Online" noktası yanında yazıyor.

