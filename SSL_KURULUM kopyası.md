# SSL Sertifikası Kurulum Rehberi

## Mail Onayı ile SSL Kurulumu

SSL sertifikası kurulumu için e-posta doğrulaması gerekiyor. İşte yapmanız gerekenler:

### 1. E-posta Kontrolü

**Hangi e-postaları kontrol etmelisiniz:**
- `admin@fotografkutusu.com`
- `administrator@fotografkutusu.com`
- `webmaster@fotografkutusu.com`
- `hostmaster@fotografkutusu.com`
- `postmaster@fotografkutusu.com`
- Domain kayıt sırasında kullandığınız e-posta adresi

**E-posta içeriğinde şunlar olacak:**
- SSL sertifikası onay linki
- Doğrulama kodu
- "Verify" veya "Approve" butonu

### 2. E-posta Onayını Yapma

1. E-posta kutunuzu kontrol edin (Spam klasörüne de bakın)
2. SSL sertifikası onay e-postasını bulun
3. E-postadaki linke tıklayın veya doğrulama kodunu girin
4. Onay işlemini tamamlayın

### 3. Alternatif: DNS Doğrulaması

Eğer e-posta erişiminiz yoksa, DNS doğrulaması yapabilirsiniz:

1. Hosting panelinize giriş yapın
2. SSL/TLS bölümüne gidin
3. "DNS Verification" veya "DNS Doğrulama" seçeneğini seçin
4. Verilen TXT kaydını DNS ayarlarınıza ekleyin:
   ```
   Type: TXT
   Name: @ (veya fotografkutusu.com)
   Value: [E-postada verilen değer]
   ```
5. DNS değişikliğinin yayılması için 5-10 dakika bekleyin
6. Doğrulama butonuna tıklayın

### 4. cPanel'den SSL Kurulumu

Eğer cPanel kullanıyorsanız:

1. cPanel'e giriş yapın: `https://fotografkutusu.com:2083` veya hosting sağlayıcınızın cPanel linki
2. "SSL/TLS Status" veya "SSL/TLS" bölümüne gidin
3. `fotografkutusu.com` domain'ini seçin
4. "Run AutoSSL" veya "Install SSL" butonuna tıklayın
5. Let's Encrypt otomatik olarak kurulacak

### 5. Manuel SSL Kurulumu (Let's Encrypt)

Eğer otomatik kurulum çalışmazsa:

1. cPanel > SSL/TLS Status
2. Domain'i seçin
3. "Run AutoSSL" butonuna tıklayın
4. 5-10 dakika bekleyin
5. SSL aktif olacak

### 6. SSL Kurulumunu Kontrol Etme

Kurulum sonrası kontrol edin:

```bash
# Tarayıcıda test
https://fotografkutusu.com

# Terminal'de test
curl -I https://fotografkutusu.com
```

**Başarılı kurulum belirtileri:**
- ✅ Tarayıcıda yeşil kilit ikonu görünür
- ✅ `https://` ile site açılır
- ✅ "Secure" veya "Güvenli" yazısı görünür

### 7. HTTP'den HTTPS'e Yönlendirme

SSL kurulduktan sonra, `.htaccess` dosyasına HTTPS yönlendirmesi ekleyin:

```apache
# HTTP'den HTTPS'e yönlendirme
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

### 8. Sorun Giderme

**SSL kurulumu çalışmıyor:**
- E-posta onayını yaptınız mı kontrol edin
- DNS kayıtlarının yayıldığını kontrol edin (5-10 dakika bekleyin)
- Hosting sağlayıcınızın SSL desteği olduğundan emin olun

**"Mixed Content" hatası:**
- Tüm kaynakların (CSS, JS, resimler) HTTPS kullandığından emin olun
- `http://` ile başlayan linkleri `https://` olarak değiştirin

**Sertifika geçersiz hatası:**
- Tarayıcı cache'ini temizleyin
- SSL sertifikasının yenilendiğinden emin olun (Let's Encrypt 90 günde bir yenilenir)

## Hızlı Çözüm

1. **E-posta kontrolü yapın** (Spam klasörü dahil)
2. **Onay linkine tıklayın**
3. **5-10 dakika bekleyin**
4. **cPanel'den "Run AutoSSL" butonuna tıklayın**
5. **Siteyi test edin:** `https://fotografkutusu.com`

## Destek

Eğer sorun devam ederse:
- Hosting sağlayıcınızın destek ekibiyle iletişime geçin
- cPanel'deki SSL/TLS Status sayfasındaki hata mesajlarını kontrol edin
- DNS ayarlarınızı kontrol edin


