# Render.com Deploy Hatası Çözümü

## ❌ Hata

```
npm error path /opt/render/project/src/package.json
npm error errno -2
npm error enoent Could not read package.json
```

## 🔧 Çözüm

Render.com yanlış klasörde `package.json` arıyor. Root Directory ayarını düzelt:

### Render Dashboard'da:

1. **Projenin "Settings" sekmesine git**
2. **"Root Directory"** kısmını bul
3. **Boş bırak** veya **`.`** (nokta) yaz
4. **"Save Changes"** tıkla
5. **"Manual Deploy"** → **"Deploy latest commit"** tıkla

### Alternatif: render.yaml ile

`render.yaml` dosyasını güncelledim, şimdi GitHub'a push et:

```bash
git add render.yaml
git commit -m "Render.yaml root directory düzeltildi"
git push
```

Render otomatik olarak yeniden deploy edecek.

## ✅ Doğru Ayarlar

**Root Directory:** Boş (veya `.`)

**Build Command:** `npm install`

**Start Command:** `node server/server.js`

---

**Not:** Root Directory `src` olarak ayarlanmışsa, Render `src/package.json` arar ama dosya root'ta olduğu için hata verir.

