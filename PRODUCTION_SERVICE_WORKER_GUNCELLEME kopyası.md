# 🚀 Production Service Worker Güncelleme Rehberi

## ✅ Yapılan Düzeltme

Service Worker artık **API isteklerini engellemiyor**, sadece İyzico font isteklerini engelliyor. Bu sayede ödeme API'si çalışacak.

## 📦 Production Build ve Deployment

### Adım 1: Yeni Build Oluştur

```bash
cd "/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje"
npm run build
```

Bu komut:
- ✅ Frontend'i build eder (`dist/` klasörüne)
- ✅ `public/font-blocker-sw.js` dosyasını `dist/` klasörüne kopyalar
- ✅ Güncel Service Worker'ı içerir

### Adım 2: Build Dosyalarını Kontrol Et

```bash
# Service Worker'ın güncel olduğunu kontrol et
cat dist/font-blocker-sw.js | grep "API isteklerini hiç yakalama"
```

Eğer bu satırı görüyorsanız, Service Worker güncel demektir.

### Adım 3: Production'a Yükleme

#### Seçenek 1: cPanel File Manager (Önerilen)

1. **cPanel'e giriş yapın:**
   - https://fotografkutusu.com/cpanel

2. **File Manager'ı açın:**
   - `public_html` klasörüne gidin

3. **Eski Service Worker'ı silin:**
   - `font-blocker-sw.js` dosyasını bulun
   - Sağ tıklayıp "Delete" seçin

4. **Yeni dosyaları yükleyin:**
   - "Upload" butonuna tıklayın
   - `dist/` klasöründen **sadece şu dosyayı** yükleyin:
     - `font-blocker-sw.js` ✅

5. **Dosya izinlerini kontrol edin:**
   - `font-blocker-sw.js` dosyasına sağ tıklayın
   - "Change Permissions" → `644` olmalı

#### Seçenek 2: Tüm Build'i Yeniden Yükle

Eğer tüm build'i yeniden yüklemek istiyorsanız:

```bash
# Build oluştur
npm run build

# ZIP oluştur
cd dist
zip -r ../build-new.zip .
```

Sonra cPanel File Manager'da:
1. `public_html` klasörüne gidin
2. Eski dosyaları silin (veya yedekleyin)
3. `build-new.zip` dosyasını yükleyin
4. ZIP dosyasına sağ tıklayıp "Extract" seçin
5. ZIP dosyasını silin

#### Seçenek 3: SSH ile Yükleme (Eğer SSH erişiminiz varsa)

```bash
# Build oluştur
npm run build

# Sadece Service Worker'ı yükle
scp dist/font-blocker-sw.js kullanici@sunucu:/path/to/public_html/

# Veya tüm build'i yükle
cd dist
tar -czf ../build.tar.gz .
scp ../build.tar.gz kullanici@sunucu:/path/to/public_html/

# SSH ile bağlan
ssh kullanici@sunucu
cd /path/to/public_html
tar -xzf build.tar.gz
rm build.tar.gz
```

## 🔄 Service Worker'ı Tarayıcıda Güncelleme

Dosyaları yükledikten sonra, kullanıcıların tarayıcılarında Service Worker'ı güncellemesi gerekiyor:

### Otomatik Güncelleme (Önerilen)

Service Worker otomatik olarak güncellenecek, ancak hemen etkili olması için:

1. **Sayfayı hard refresh yapın:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Service Worker'ı manuel güncelleyin:**
   - Chrome DevTools açın (F12)
   - Application sekmesi → Service Workers
   - "Update" butonuna tıklayın
   - Veya "Unregister" yapıp sayfayı yenileyin

### Cache Temizleme

Eğer hala eski Service Worker çalışıyorsa:

1. Chrome DevTools (F12)
2. Application → Storage
3. "Clear site data" butonuna tıklayın
4. Sayfayı yenileyin

## ✅ Kontrol Listesi

Deployment sonrası kontrol edin:

- [ ] `dist/font-blocker-sw.js` dosyası güncel (API isteklerini yakalamıyor)
- [ ] Production sunucusunda `font-blocker-sw.js` dosyası güncel
- [ ] Tarayıcıda Service Worker güncellendi
- [ ] Ödeme sayfası çalışıyor (API istekleri başarılı)
- [ ] Font yüklemeleri hala engelleniyor (İyzico fontları)

## 🧪 Test

Production'da test etmek için:

1. Ödeme sayfasına gidin
2. Chrome DevTools → Network sekmesi
3. Ödeme formu oluşturulurken:
   - ✅ `/api/payment/create` isteği **başarılı** olmalı
   - ✅ `static.iyzipay.com/fonts` istekleri **engellenmiş** olmalı

## 🆘 Sorun Giderme

### Service Worker Güncellenmiyor

1. Chrome DevTools → Application → Service Workers
2. "Unregister" yapın
3. Sayfayı hard refresh yapın (`Cmd+Shift+R`)
4. Service Worker yeniden kaydedilecek

### API İstekleri Hala Engelleniyor

1. `dist/font-blocker-sw.js` dosyasını kontrol edin
2. "API isteklerini hiç yakalama" yorumunu arayın
3. Eğer yoksa, build'i yeniden yapın: `npm run build`

### Backend Bağlantı Hatası

Service Worker artık API isteklerini engellemiyor, ancak backend sunucusu çalışmıyor olabilir:

1. Backend sunucusunun çalıştığını kontrol edin
2. API URL'lerinin doğru olduğunu kontrol edin
3. CORS ayarlarını kontrol edin

---

**Not:** Service Worker güncellemesi tüm kullanıcılara otomatik olarak yayılacak, ancak bazı kullanıcıların tarayıcılarını yenilemesi gerekebilir.

