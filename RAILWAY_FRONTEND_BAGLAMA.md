# 🔗 Frontend'i Railway Backend'e Bağlama

## ✅ Yapılanlar

1. ✅ Frontend config güncellendi
2. ✅ Build yapıldı (`dist/` klasörü hazır)
3. ✅ Railway backend çalışıyor
4. ✅ MongoDB bağlantısı başarılı

## 📋 Railway Backend URL'ini Al

### Adım 1: Railway Dashboard'da URL'i Bul

1. Railway.app'de projenize gidin
2. **"heartfelt-embrace"** servisine tıklayın
3. **"Settings"** → **"Domains"** sekmesine gidin
4. URL'i kopyalayın (örn: `https://heartfelt-embrace-production.up.railway.app`)

VEYA

**"Settings"** → **"General"** sekmesinde **"Public Domain"** bölümünde URL'i görebilirsiniz.

## 🔧 Frontend'i Güncelle

### Yöntem 1: Environment Variable ile (Önerilen)

1. Railway backend URL'inizi alın (örn: `https://heartfelt-embrace-production.up.railway.app`)

2. Frontend build yaparken environment variable kullanın:
   ```bash
   VITE_RAILWAY_URL=https://heartfelt-embrace-production.up.railway.app npm run build
   ```

3. Veya `.env.production` dosyası oluşturun:
   ```env
   VITE_RAILWAY_URL=https://heartfelt-embrace-production.up.railway.app
   ```

4. Build yapın:
   ```bash
   npm run build
   ```

### Yöntem 2: Direkt Kodda Güncelle

1. `src/config/api.js` dosyasını açın
2. Şu satırı bulun:
   ```javascript
   return import.meta.env.VITE_RAILWAY_URL || '/api'
   ```
3. Railway URL'inizi ekleyin:
   ```javascript
   return 'https://heartfelt-embrace-production.up.railway.app'
   ```

4. Build yapın:
   ```bash
   npm run build
   ```

## 📤 Production'a Yükle

### Adım 1: Build Dosyalarını Kontrol Et

```bash
ls -la dist/
```

Şu dosyalar olmalı:
- `index.html`
- `assets/` klasörü
- `font-blocker-sw.js`
- Diğer dosyalar

### Adım 2: Production'a Yükle

#### Yöntem 1: cPanel File Manager

1. cPanel'e giriş yapın: https://fotografkutusu.com/cpanel
2. File Manager'ı açın
3. `public_html` klasörüne gidin
4. Eski dosyaları silin (veya yedekleyin)
5. `dist/` klasöründeki **TÜM DOSYALARI** yükleyin

#### Yöntem 2: FTP/SFTP

1. FTP istemcisi açın
2. `dist/` klasöründeki tüm dosyaları `public_html/` klasörüne yükleyin

## 🧪 Test

### 1. Health Check

Tarayıcıda Railway backend URL'inizi açın:
```
https://your-railway-app.railway.app/api/health
```

Beklenen yanıt:
```json
{"status":"OK","message":"Server is running"}
```

### 2. Frontend Test

1. Production sitesine gidin: https://fotografkutusu.com
2. Chrome DevTools → Network sekmesi
3. Ödeme sayfasına gidin
4. Ödeme formu oluşturulurken:
   - ✅ API isteği Railway backend URL'ine gidiyor
   - ✅ JSON response dönüyor (HTML değil)
   - ✅ Ödeme formu oluşturuluyor

### 3. Sipariş Testi

1. Bir sipariş oluşturun
2. Admin panelinde siparişin göründüğünü kontrol edin
3. MongoDB'de verinin kaydedildiğini doğrulayın

## ✅ Kontrol Listesi

- [x] Railway backend çalışıyor
- [x] MongoDB bağlantısı başarılı
- [x] Frontend build yapıldı
- [ ] Railway backend URL'i alındı
- [ ] Frontend config güncellendi
- [ ] Build yeniden yapıldı (URL ile)
- [ ] Production'a yüklendi
- [ ] Test edildi

## 🆘 Sorun Giderme

### Frontend Backend'e Bağlanamıyor

1. Railway backend URL'i doğru mu?
2. Build yapıldı mı? (`npm run build`)
3. Production'a yüklendi mi?
4. Tarayıcı cache'i temizlendi mi? (Hard refresh: `Cmd+Shift+R`)

### API İstekleri HTML Döndürüyor

1. Railway backend çalışıyor mu? (Logs kontrol edin)
2. URL doğru mu?
3. CORS ayarları doğru mu? (Backend'de `FRONTEND_URL` environment variable'ı doğru mu?)

---

**Not:** Railway backend URL'inizi aldıktan sonra frontend'i güncelleyip build yapın ve production'a yükleyin.

