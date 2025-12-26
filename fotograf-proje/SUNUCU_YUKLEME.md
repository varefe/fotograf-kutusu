# Sunucuya Yükleme Rehberi

## Build Dosyaları

Proje build edildi ve `dist/` klasöründe hazır. Bu klasördeki tüm dosyaları sunucuya yüklemeniz gerekiyor.

## Yükleme Adımları

### 1. FTP/SFTP ile Yükleme

1. FTP istemcisi açın (FileZilla, WinSCP, Cyberduck vb.)
2. Sunucu bilgilerinizi girin:
   - Host: sunucu IP veya domain
   - Kullanıcı adı: FTP kullanıcı adınız
   - Şifre: FTP şifreniz
   - Port: 21 (FTP) veya 22 (SFTP)

3. `dist/` klasöründeki **TÜM DOSYALARI** seçin:
   - `index.html`
   - `assets/` klasörü (içindeki tüm dosyalar)
   - `.htaccess` dosyası

4. Sunucunuzdaki `public_html/` veya `www/` klasörüne yükleyin

### 2. cPanel File Manager ile Yükleme

1. cPanel'e giriş yapın
2. File Manager'ı açın
3. `public_html` klasörüne gidin
4. "Upload" butonuna tıklayın
5. `dist/` klasöründeki tüm dosyaları seçip yükleyin
6. `.htaccess` dosyasının yüklendiğinden emin olun

### 3. Terminal/SSH ile Yükleme

```bash
# Önce dist klasörünü sıkıştır
cd dist
tar -czf ../build.tar.gz .

# Sunucuya SCP ile yükle
scp ../build.tar.gz kullanici@sunucu:/path/to/public_html/

# Sunucuda SSH ile bağlan
ssh kullanici@sunucu

# Sunucuda aç
cd /path/to/public_html
tar -xzf build.tar.gz
rm build.tar.gz
```

## Önemli Notlar

### React Router Desteği

React Router kullandığımız için, sunucuda SPA (Single Page Application) routing desteği gerekiyor. `.htaccess` dosyası bu işi yapıyor.

**Apache sunucular için:**
- `.htaccess` dosyası otomatik çalışır
- `mod_rewrite` modülünün aktif olduğundan emin olun

**Nginx sunucular için:**
`.htaccess` çalışmaz, Nginx config'e şunu ekleyin:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Dosya İzinleri

- `.htaccess` dosyası için: 644
- Klasörler için: 755
- Dosyalar için: 644

### Domain Ayarları

Eğer domain alt klasöründe çalışacaksa (örn: `domain.com/subfolder`), `vite.config.js`'de `base` ayarını yapın:

```js
export default defineConfig({
  base: '/subfolder/',
  // ...
})
```

Sonra tekrar build edin: `npm run build`

## Kontrol Listesi

- [ ] `dist/` klasöründeki tüm dosyalar yüklendi
- [ ] `.htaccess` dosyası yüklendi
- [ ] `assets/` klasörü ve içindeki dosyalar yüklendi
- [ ] Dosya izinleri doğru (644/755)
- [ ] Domain/subdomain doğru yapılandırıldı
- [ ] SSL sertifikası varsa aktif
- [ ] Tarayıcıda test edildi

## Sorun Giderme

### Sayfa bulunamadı hatası (404)
- `.htaccess` dosyasının yüklendiğinden emin olun
- Apache'de `mod_rewrite` aktif mi kontrol edin
- Nginx kullanıyorsanız config dosyasını güncelleyin

### CSS/JS dosyaları yüklenmiyor
- `assets/` klasörünün tamamen yüklendiğinden emin olun
- Dosya yollarını kontrol edin
- Tarayıcı konsolunda hata var mı bakın

### Sayfa boş görünüyor
- Tarayıcı konsolunda JavaScript hataları var mı kontrol edin
- `index.html` dosyasının doğru yüklendiğinden emin olun
- Network sekmesinde dosyaların yüklendiğini kontrol edin

## Test

Yükleme sonrası şu adresleri test edin:
- Ana sayfa: `https://yourdomain.com/`
- Sipariş sayfası: `https://yourdomain.com/order`
- Her iki sayfa da çalışmalı

