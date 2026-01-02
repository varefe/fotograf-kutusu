# Manuel Deployment Rehberi

FTP/SFTP bağlantısı kurulamadığı için dosyaları manuel olarak yüklemeniz gerekiyor.

## 📦 Build Hazır

Build dosyaları `dist/` klasöründe hazır:
- ✅ `index.html`
- ✅ `.htaccess`
- ✅ `assets/` klasörü (CSS ve JS dosyaları)
- ✅ `vite.svg`

## 🚀 Yükleme Yöntemleri

### Yöntem 1: cPanel File Manager (Önerilen)

1. **cPanel'e giriş yapın:**
   - https://fotografkutusu.com/cpanel
   - Kullanıcı adı ve şifre ile giriş

2. **File Manager'ı açın:**
   - cPanel ana sayfasında "File Manager" butonuna tıklayın
   - `public_html` klasörüne gidin

3. **Dosyaları yükleyin:**
   - "Upload" butonuna tıklayın
   - `dist/` klasöründeki **TÜM DOSYALARI** seçin:
     - `.htaccess`
     - `index.html`
     - `vite.svg`
     - `assets/` klasörü (içindeki tüm dosyalar)

4. **Klasör yapısı kontrolü:**
   ```
   public_html/
   ├── .htaccess
   ├── index.html
   ├── vite.svg
   └── assets/
       ├── index-D81xOMOx.css
       └── index-DbJXtykn.js
   ```

### Yöntem 2: ZIP ile Yükleme

1. **ZIP oluştur:**
   ```bash
   cd dist
   zip -r ../build.zip .
   ```

2. **cPanel File Manager'da:**
   - `public_html` klasörüne gidin
   - "Upload" ile `build.zip` dosyasını yükleyin
   - ZIP dosyasına sağ tıklayıp "Extract" seçin
   - ZIP dosyasını silin

### Yöntem 3: Terminal/SSH (Eğer SSH erişiminiz varsa)

```bash
# Önce dist klasörünü sıkıştır
cd "/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje"
tar -czf build.tar.gz -C dist .

# SCP ile yükle (SSH erişimi varsa)
scp build.tar.gz pfotogex@fotografkutusu.com:~/public_html/

# SSH ile bağlan
ssh pfotogex@fotografkutusu.com

# Sunucuda aç
cd public_html
tar -xzf build.tar.gz
rm build.tar.gz
```

## ✅ Kontrol Listesi

Yükleme sonrası kontrol edin:

- [ ] `.htaccess` dosyası `public_html/` klasöründe
- [ ] `index.html` dosyası `public_html/` klasöründe
- [ ] `assets/` klasörü ve içindeki dosyalar yüklendi
- [ ] Dosya izinleri doğru (644 dosyalar, 755 klasörler)

## 🧪 Test

Yükleme sonrası test edin:

1. **Ana sayfa:**
   - https://fotografkutusu.com/
   - Sayfa yüklenmeli

2. **Sipariş sayfası:**
   - https://fotografkutusu.com/order
   - Form çalışmalı

3. **Admin giriş:**
   - https://fotografkutusu.com/admin/login
   - Login formu görünmeli

## ⚠️ Önemli Notlar

### .htaccess Dosyası

`.htaccess` dosyası **mutlaka** yüklenmeli! Bu dosya olmadan:
- React Router çalışmaz
- Sayfa yenilendiğinde 404 hatası alırsınız

### Dosya İzinleri

cPanel File Manager'da dosya izinlerini kontrol edin:
- Dosyalar: **644**
- Klasörler: **755**

Değiştirmek için:
1. Dosyaya sağ tıklayın
2. "Change Permissions" seçin
3. İzinleri ayarlayın

### SSL Sertifikası

Eğer SSL aktif değilse:
- `.htaccess` dosyası HTTP'den HTTPS'e yönlendirme yapar
- SSL sertifikası kurmanız gerekebilir

## 🔧 Sorun Giderme

### Sayfa bulunamadı (404)

1. `.htaccess` dosyasının yüklendiğinden emin olun
2. cPanel'de "Apache Modules" kontrol edin
3. `mod_rewrite` aktif olmalı

### CSS/JS yüklenmiyor

1. `assets/` klasörünün tamamen yüklendiğini kontrol edin
2. Tarayıcı konsolunda (F12) hata var mı bakın
3. Dosya yollarını kontrol edin

### Sayfa boş görünüyor

1. Tarayıcı konsolunda (F12) JavaScript hataları var mı kontrol edin
2. `index.html` dosyasının doğru yüklendiğini kontrol edin
3. Network sekmesinde dosyaların yüklendiğini kontrol edin

## 📞 Yardım

Sorun yaşarsanız:
1. Tarayıcı konsolunu kontrol edin (F12)
2. cPanel error log'larına bakın
3. Dosya izinlerini kontrol edin

---

**Build Dosyaları Konumu:** `/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje/dist/`
