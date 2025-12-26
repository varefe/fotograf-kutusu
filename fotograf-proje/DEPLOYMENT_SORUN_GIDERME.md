# 🚨 Deployment Sorun Giderme Rehberi

## ✅ Build Hazır

Yeni build tamamlandı ve `dist/` klasöründe hazır:
- ✅ Tüm yeni sayfalar dahil (Hakkımızda, İletişim, Gizlilik, vb.)
- ✅ Logolar dahil (Visa, MasterCard, iyzico)
- ✅ `.htaccess` dosyası kopyalandı
- ✅ Tüm assets hazır

## 📤 Yükleme Adımları

### 1. cPanel File Manager ile Yükleme

1. **cPanel'e giriş yapın:**
   - https://fotografkutusu.com/cpanel
   - Kullanıcı adı: `pfotogex`
   - Şifre: `fot539IJdh}`

2. **File Manager'ı açın:**
   - cPanel ana sayfasında "File Manager" butonuna tıklayın
   - Sol taraftan `public_html` klasörüne gidin

3. **Mevcut dosyaları yedekleyin (önerilir):**
   - `public_html` içindeki tüm dosyaları seçin
   - "Compress" ile ZIP oluşturun (yedek için)

4. **Yeni dosyaları yükleyin:**
   - `dist/` klasöründeki **TÜM DOSYALARI** seçin
   - ZIP oluşturun: `build-new.zip`
   - cPanel File Manager'da "Upload" ile yükleyin
   - ZIP dosyasına sağ tıklayıp "Extract" seçin
   - ZIP dosyasını silin

5. **Gizli dosyaları gösterin:**
   - File Manager'da sağ üstte "Settings"
   - "Show Hidden Files (dotfiles)" işaretleyin
   - `.htaccess` dosyasının yüklendiğini kontrol edin

## 🔍 Yaygın Sorunlar ve Çözümleri

### Sorun 1: Sayfa Bulunamadı (404 Hatası)

**Belirtiler:**
- Ana sayfa açılıyor ama diğer sayfalar 404 veriyor
- Sayfa yenilendiğinde 404 hatası

**Çözüm:**
1. `.htaccess` dosyasının `public_html/` klasöründe olduğundan emin olun
2. Dosya izinlerini kontrol edin (644 olmalı)
3. cPanel'de "Apache Modules" kontrol edin:
   - `mod_rewrite` aktif olmalı
   - `mod_headers` aktif olmalı
   - `mod_mime` aktif olmalı

**Kontrol:**
```bash
# .htaccess dosyası var mı?
ls -la public_html/.htaccess

# Dosya izinleri doğru mu?
chmod 644 public_html/.htaccess
```

### Sorun 2: CSS/JS Dosyaları Yüklenmiyor

**Belirtiler:**
- Sayfa boş görünüyor
- Stiller uygulanmıyor
- Tarayıcı konsolunda 404 hatası

**Çözüm:**
1. `assets/` klasörünün tamamen yüklendiğini kontrol edin
2. Dosya yollarını kontrol edin:
   - `/assets/index-0pachyHY.js` erişilebilir olmalı
   - `/assets/index-DByeCqpt.css` erişilebilir olmalı
3. Tarayıcı konsolunda (F12) Network sekmesinde dosyaların yüklendiğini kontrol edin

**Kontrol:**
```bash
# Assets klasörü var mı?
ls -la public_html/assets/

# Dosya izinleri doğru mu?
chmod 755 public_html/assets/
chmod 644 public_html/assets/*
```

### Sorun 3: Logolar Görünmüyor

**Belirtiler:**
- Visa, MasterCard, iyzico logoları görünmüyor
- Tarayıcı konsolunda 404 hatası

**Çözüm:**
1. `logos/` klasörünün `public_html/` altında olduğunu kontrol edin
2. Logo dosyalarının yüklendiğini kontrol edin:
   - `/logos/visa.png`
   - `/logos/mastercard.png`
   - `/logos/iyzico-ile-ode-horizontal.png`

**Kontrol:**
```bash
# Logos klasörü var mı?
ls -la public_html/logos/

# Dosya izinleri doğru mu?
chmod 755 public_html/logos/
chmod 644 public_html/logos/*
```

### Sorun 4: Sayfa Boş Görünüyor

**Belirtiler:**
- Sayfa yükleniyor ama içerik görünmüyor
- Sadece beyaz sayfa

**Çözüm:**
1. Tarayıcı konsolunu açın (F12)
2. Console sekmesinde JavaScript hataları var mı kontrol edin
3. Network sekmesinde dosyaların yüklendiğini kontrol edin
4. `index.html` dosyasının doğru yüklendiğini kontrol edin

**Kontrol:**
```bash
# index.html var mı?
cat public_html/index.html

# İçeriği kontrol edin
```

### Sorun 5: React Router Çalışmıyor

**Belirtiler:**
- URL değişiyor ama sayfa içeriği değişmiyor
- Tüm linkler aynı sayfayı gösteriyor

**Çözüm:**
1. `.htaccess` dosyasının doğru olduğundan emin olun
2. `mod_rewrite` modülünün aktif olduğunu kontrol edin
3. `.htaccess` dosyasının içeriğini kontrol edin

**Kontrol:**
```bash
# .htaccess içeriği
cat public_html/.htaccess
```

## 📋 Kontrol Listesi

Yükleme sonrası şunları kontrol edin:

- [ ] `.htaccess` dosyası `public_html/` klasöründe
- [ ] `index.html` dosyası `public_html/` klasöründe
- [ ] `assets/` klasörü ve içindeki dosyalar yüklendi
- [ ] `logos/` klasörü ve içindeki dosyalar yüklendi
- [ ] `logo.jpg` dosyası yüklendi
- [ ] Dosya izinleri doğru (644 dosyalar, 755 klasörler)
- [ ] Apache modülleri aktif (`mod_rewrite`, `mod_headers`, `mod_mime`)

## 🧪 Test Adımları

1. **Ana Sayfa:**
   - https://fotografkutusu.com/
   - Sayfa yüklenmeli ✅
   - Güvenli ödeme logoları görünmeli ✅

2. **Hakkımızda:**
   - https://fotografkutusu.com/about
   - Sayfa yüklenmeli ✅

3. **İletişim:**
   - https://fotografkutusu.com/contact
   - Sayfa yüklenmeli ✅

4. **Gizlilik Politikası:**
   - https://fotografkutusu.com/privacy
   - Sayfa yüklenmeli ✅

5. **Mesafeli Satış:**
   - https://fotografkutusu.com/distance-selling
   - Sayfa yüklenmeli ✅

6. **Teslimat ve İade:**
   - https://fotografkutusu.com/delivery-returns
   - Sayfa yüklenmeli ✅

7. **Sipariş Sayfası:**
   - https://fotografkutusu.com/order
   - Form çalışmalı ✅

8. **Ödeme Sayfası:**
   - https://fotografkutusu.com/payment
   - Güvenli ödeme logoları görünmeli ✅

## 🔧 Dosya İzinleri

Doğru dosya izinleri:

```bash
# Dosyalar
chmod 644 public_html/.htaccess
chmod 644 public_html/index.html
chmod 644 public_html/logo.jpg
chmod 644 public_html/vite.svg
chmod 644 public_html/assets/*
chmod 644 public_html/logos/*

# Klasörler
chmod 755 public_html/
chmod 755 public_html/assets/
chmod 755 public_html/logos/
```

## 📞 Hala Sorun Varsa

1. **Tarayıcı konsolunu kontrol edin (F12):**
   - Console sekmesinde hatalar var mı?
   - Network sekmesinde hangi dosyalar yüklenemiyor?

2. **cPanel Error Log'larını kontrol edin:**
   - cPanel → Metrics → Errors
   - Son hataları kontrol edin

3. **Dosya yollarını kontrol edin:**
   - Tüm dosyalar `public_html/` altında mı?
   - Alt klasörler doğru mu?

4. **Apache modüllerini kontrol edin:**
   - cPanel → Software → Select PHP Version → Extensions
   - `mod_rewrite` aktif mi?

---

**Build Dosyaları:** `/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje/dist/`

**Son Build Tarihi:** $(date)





