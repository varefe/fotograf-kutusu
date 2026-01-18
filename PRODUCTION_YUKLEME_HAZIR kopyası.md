# ✅ Production'a Yükleme Hazır!

## ✅ Yapılanlar

1. ✅ Frontend config güncellendi → Railway backend URL'i eklendi
2. ✅ Build yapıldı → `dist/` klasörü hazır
3. ✅ Railway backend çalışıyor → `https://heartfelt-embrace-production-3c74.up.railway.app`
4. ✅ MongoDB bağlantısı başarılı

## 📤 Production'a Yükleme

### Adım 1: Build Dosyalarını Kontrol Et

```bash
ls -la dist/
```

Şu dosyalar olmalı:
- ✅ `index.html`
- ✅ `assets/` klasörü (CSS ve JS dosyaları)
- ✅ `font-blocker-sw.js`
- ✅ Diğer dosyalar

### Adım 2: Production'a Yükle

#### Yöntem 1: cPanel File Manager (Önerilen)

1. **cPanel'e giriş yapın:**
   - https://fotografkutusu.com/cpanel

2. **File Manager'ı açın:**
   - cPanel ana sayfasında "File Manager" butonuna tıklayın

3. **public_html klasörüne gidin:**
   - Sol menüden `public_html` klasörüne tıklayın

4. **Eski dosyaları yedekleyin (opsiyonel):**
   - Mevcut dosyaları bir klasöre taşıyın (yedek için)

5. **Yeni dosyaları yükleyin:**
   - "Upload" butonuna tıklayın
   - `dist/` klasöründeki **TÜM DOSYALARI** seçin
   - Yükleyin

6. **Klasör yapısı kontrolü:**
   ```
   public_html/
   ├── index.html
   ├── font-blocker-sw.js
   ├── assets/
   │   ├── index-6ZrGnkE6.js
   │   └── index-DByeCqpt.css
   └── diğer dosyalar
   ```

#### Yöntem 2: FTP/SFTP ile Yükleme

1. **FTP istemcisi açın** (FileZilla, WinSCP, Cyberduck vb.)

2. **Sunucuya bağlanın:**
   - Host: `fotografkutusu.com`
   - Kullanıcı adı: FTP kullanıcı adınız
   - Şifre: FTP şifreniz
   - Port: 21 (FTP) veya 22 (SFTP)

3. **public_html klasörüne gidin**

4. **dist/ klasöründeki TÜM DOSYALARI yükleyin**

#### Yöntem 3: ZIP ile Yükleme

1. **ZIP oluştur:**
   ```bash
   cd dist
   zip -r ../build-production.zip .
   ```

2. **cPanel File Manager'da:**
   - `public_html` klasörüne gidin
   - "Upload" ile `build-production.zip` dosyasını yükleyin
   - ZIP dosyasına sağ tıklayıp "Extract" seçin
   - ZIP dosyasını silin

## 🧪 Test

### 1. Siteyi Ziyaret Edin

Tarayıcıda: https://fotografkutusu.com

### 2. Backend Bağlantısını Test Edin

1. Chrome DevTools → Network sekmesi
2. Ödeme sayfasına gidin
3. Ödeme formu oluşturulurken:
   - ✅ API isteği `https://heartfelt-embrace-production-3c74.up.railway.app` adresine gidiyor
   - ✅ JSON response dönüyor (HTML değil)
   - ✅ Ödeme formu oluşturuluyor

### 3. Health Check

Tarayıcıda veya terminal'de:

```bash
curl https://heartfelt-embrace-production-3c74.up.railway.app/api/health
```

Beklenen yanıt:
```json
{"status":"OK","message":"Server is running"}
```

### 4. Sipariş Testi

1. Bir sipariş oluşturun
2. Admin panelinde siparişin göründüğünü kontrol edin
3. MongoDB'de verinin kaydedildiğini doğrulayın

## ✅ Kontrol Listesi

- [x] Railway backend çalışıyor
- [x] MongoDB bağlantısı başarılı
- [x] Frontend config güncellendi
- [x] Build yapıldı
- [ ] Production'a yüklendi
- [ ] Test edildi

## 🆘 Sorun Giderme

### Frontend Backend'e Bağlanamıyor

1. **Railway backend çalışıyor mu?**
   - Railway dashboard'da logları kontrol edin
   - Health check yapın: `curl https://heartfelt-embrace-production-3c74.up.railway.app/api/health`

2. **Frontend build yapıldı mı?**
   - `dist/` klasöründe dosyalar var mı?

3. **Production'a yüklendi mi?**
   - `public_html` klasöründe dosyalar var mı?

4. **Tarayıcı cache'i temizlendi mi?**
   - Hard refresh: `Cmd+Shift+R` (Mac) veya `Ctrl+Shift+R` (Windows)

### API İstekleri HTML Döndürüyor

1. **Railway backend URL'i doğru mu?**
   - `src/config/api.js` dosyasında URL doğru mu?
   - Build yapıldı mı?

2. **CORS hatası var mı?**
   - Railway backend'de `FRONTEND_URL` environment variable'ı doğru mu?
   - `https://fotografkutusu.com` olmalı

---

## 🎉 Tamamlandı!

Artık production'da çalışıyor olmalı! Test edin ve sonucu paylaşın.

**Railway Backend URL:** `https://heartfelt-embrace-production-3c74.up.railway.app`
**Frontend URL:** `https://fotografkutusu.com`

