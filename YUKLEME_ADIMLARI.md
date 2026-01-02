# 🚀 Site Yayınlama Adımları

## ✅ Build Tamamlandı
- Tüm dosyalar `dist/` klasöründe hazır
- ZIP dosyası: `build.zip` (127 KB)

## 📤 cPanel File Manager ile Yükleme

### Adım 1: cPanel'e Giriş
1. Tarayıcınızda şu adrese gidin: **https://fotografkutusu.com/cpanel**
2. Kullanıcı adı: `pfotogex`
3. Şifre: `fot539IJdh}`
4. Giriş yapın

### Adım 2: File Manager Açma
1. cPanel ana sayfasında **"File Manager"** butonuna tıklayın
2. Sol taraftan **`public_html`** klasörüne gidin

### Adım 3: ZIP ile Yükleme (ÖNERİLEN)
1. **"Upload"** butonuna tıklayın
2. **`build.zip`** dosyasını seçin ve yükleyin
   - Dosya konumu: `/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje/build.zip`
3. Yükleme tamamlandıktan sonra:
   - `build.zip` dosyasına **sağ tıklayın**
   - **"Extract"** seçin
   - Dosyalar otomatik olarak `public_html/` klasörüne çıkarılacak
4. `build.zip` dosyasını **silin**

### Adım 4: Gizli Dosyaları Gösterme
`.htaccess` dosyasını görmek için:
1. File Manager'da sağ üstte **"Settings"** butonuna tıklayın
2. **"Show Hidden Files (dotfiles)"** seçeneğini işaretleyin
3. **"Save"** butonuna tıklayın

### Adım 5: Dosya İzinleri Kontrolü
Her dosyaya sağ tıklayıp **"Change Permissions"** ile kontrol edin:
- **Dosyalar:** 644
- **Klasörler:** 755

## ✅ Test

Yükleme sonrası test edin:

1. **Ana Sayfa:**
   - https://fotografkutusu.com/
   - Sayfa yüklenmeli ✅

2. **Sipariş Sayfası:**
   - https://fotografkutusu.com/order
   - Form çalışmalı ✅

3. **Admin Giriş:**
   - https://fotografkutusu.com/admin/login
   - Login formu görünmeli ✅

## ⚠️ ÖNEMLİ NOTLAR

### .htaccess Dosyası
- **MUTLAKA** yüklenmeli!
- Bu dosya olmadan React Router çalışmaz
- Sayfa yenilendiğinde 404 hatası alırsınız

### Eğer Sorun Yaşarsanız

**Sayfa bulunamadı (404):**
- `.htaccess` dosyasının yüklendiğinden emin olun
- Dosya izinlerini kontrol edin (644)

**CSS/JS yüklenmiyor:**
- `assets/` klasörünün tamamen yüklendiğini kontrol edin
- Tarayıcı konsolunda (F12) hata var mı bakın

**Sayfa boş görünüyor:**
- Tarayıcı konsolunda (F12) JavaScript hataları var mı kontrol edin
- `index.html` dosyasının doğru yüklendiğini kontrol edin

## 📍 Dosya Konumları

**Yerel Bilgisayar:**
- Build dosyaları: `/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje/dist/`
- ZIP dosyası: `/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje/build.zip`

**Sunucu:**
- Hedef klasör: `public_html/`

---

**Not:** FTP/SFTP portları kapalı olduğu için otomatik yükleme yapılamadı. cPanel File Manager ile manuel yükleme yapmanız gerekiyor.
