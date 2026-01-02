# 📦 .env Dosyasını Production'a Yükleme Rehberi

## ✅ Evet, .env Dosyasını Production'a Yükleyebilirsiniz!

`.env` dosyasını production'a yükleyip backend'i başlatabilirsiniz. İşte adım adım rehber:

## 📋 Adım 1: .env Dosyasını Hazırla

`.env.production` dosyası hazır! Bu dosyayı production'a yükleyeceksiniz.

**Önemli:** 
- `ADMIN_PASSWORD` değerini değiştirin (şu an placeholder var)
- Dosya adını `.env` olarak yükleyin (`.env.production` değil)

## 📤 Adım 2: Production'a Yükleme

### Yöntem 1: cPanel File Manager (Önerilen)

1. **cPanel'e giriş yapın:**
   - https://fotografkutusu.com/cpanel

2. **File Manager'ı açın:**
   - cPanel ana sayfasında "File Manager" butonuna tıklayın

3. **Proje klasörüne gidin:**
   - `public_html` veya `fotograf-proje` klasörüne gidin
   - Backend dosyalarının olduğu klasöre gidin (genellikle `~/fotograf-proje` veya `~/public_html/fotograf-proje`)

4. **.env dosyasını yükleyin:**
   - "Upload" butonuna tıklayın
   - `.env.production` dosyasını seçin
   - Yükleyin

5. **Dosya adını değiştirin:**
   - Yüklenen dosyaya sağ tıklayın
   - "Rename" seçin
   - `.env.production` → `.env` olarak değiştirin

### Yöntem 2: FTP/SFTP ile Yükleme

1. **FTP istemcisi açın** (FileZilla, WinSCP, Cyberduck vb.)

2. **Sunucuya bağlanın:**
   - Host: `fotografkutusu.com`
   - Kullanıcı adı: FTP kullanıcı adınız
   - Şifre: FTP şifreniz
   - Port: 21 (FTP) veya 22 (SFTP)

3. **Proje klasörüne gidin:**
   - `public_html/fotograf-proje` veya backend dosyalarının olduğu klasör

4. **.env dosyasını yükleyin:**
   - `.env.production` dosyasını seçin
   - Yükleyin
   - Dosya adını `.env` olarak değiştirin

### Yöntem 3: Terminal/SSH ile (Eğer Erişim Varsa)

```bash
# SSH ile bağlan
ssh kullanici@fotografkutusu.com

# Proje klasörüne git
cd ~/fotograf-proje  # veya doğru klasör

# .env dosyasını oluştur
nano .env

# İçeriği yapıştır ve kaydet (Ctrl+X, Y, Enter)
```

## 🔧 Adım 3: .env Dosyasını Düzenle

**ÖNEMLİ:** Production'a yüklemeden önce şunları değiştirin:

1. **ADMIN_PASSWORD:** Güvenli bir şifre belirleyin
   ```env
   ADMIN_PASSWORD=your-secure-admin-password-here
   ```
   → Güvenli bir şifre ile değiştirin

2. **ENCRYPTION_KEY:** Zaten güvenli bir key oluşturuldu, değiştirmenize gerek yok

## 🚀 Adım 4: Backend'i Başlat

`.env` dosyasını yükledikten sonra backend'i başlatmanız gerekiyor. Ancak SSH erişimi olmadığı için:

### Seçenek 1: cPanel Terminal (Eğer Varsa)

1. **cPanel'de Terminal'i açın:**
   - cPanel ana sayfasında "Terminal" veya "Advanced" → "Terminal" butonuna tıklayın

2. **Backend'i başlatın:**
   ```bash
   cd ~/fotograf-proje  # veya doğru klasör
   npm install  # Eğer dependencies yüklenmemişse
   pm2 start server/server.js --name "fotograf-backend" --env production
   pm2 save
   ```

3. **Kontrol edin:**
   ```bash
   pm2 status
   curl http://localhost:5000/api/health
   ```

### Seçenek 2: cPanel Node.js App (Eğer Varsa)

Bazı hosting sağlayıcıları cPanel'de Node.js uygulaması başlatma özelliği sunar:

1. **cPanel'de "Node.js" veya "Node.js App" bölümünü bulun**

2. **Yeni uygulama oluşturun:**
   - Application Root: `fotograf-proje` (veya doğru klasör)
   - Application URL: `fotografkutusu.com` (veya subdomain)
   - Application Startup File: `server/server.js`
   - Node.js Version: 18+ seçin

3. **Environment Variables ekleyin:**
   - `.env` dosyasındaki tüm değişkenleri ekleyin

4. **Uygulamayı başlatın**

### Seçenek 3: Hosting Sağlayıcısından SSH Açtırma

Hosting sağlayıcınızla iletişime geçip SSH erişimini açtırın, sonra:

```bash
ssh kullanici@fotografkutusu.com
cd ~/fotograf-proje
npm install
pm2 start server/server.js --name "fotograf-backend" --env production
pm2 save
```

## ✅ Adım 5: Kontrol

### 1. .env Dosyası Yüklendi mi?

cPanel File Manager'da `.env` dosyasının olduğunu kontrol edin.

### 2. Backend Çalışıyor mu?

Tarayıcıda şu URL'yi açın:
```
https://fotografkutusu.com/api/health
```

Beklenen yanıt:
```json
{"status":"OK","message":"Server is running"}
```

Eğer HTML döndürüyorsa, backend çalışmıyor demektir.

## 🆘 Sorun Giderme

### .env Dosyası Görünmüyor

- cPanel File Manager'da "Show Hidden Files" seçeneğini aktif edin
- Dosya adının `.env` olduğundan emin olun (nokta ile başlamalı)

### Backend Başlamıyor

1. **cPanel Terminal erişiminiz var mı?** Kontrol edin
2. **Node.js kurulu mu?** Hosting sağlayıcınızdan kontrol edin
3. **PM2 kurulu mu?** `npm install -g pm2` komutu ile kurun
4. **Port 5000 açık mı?** Hosting sağlayıcınızdan kontrol edin

### SSH Erişimi Yok

- Hosting sağlayıcınızdan SSH erişimini açtırın
- Veya Railway.app/Render.com gibi cloud servisler kullanın

## 💡 Alternatif: Cloud Servisler

SSH erişimi yoksa, backend'i cloud servislerde çalıştırabilirsiniz:

- **Railway.app:** Ücretsiz, kolay, 10 dakikada hazır
- **Render.com:** Ücretsiz, kolay, 10 dakikada hazır

Detaylar için: `SSH_OLMADAN_BACKEND.md` dosyasına bakın.

---

## 📝 Özet

1. ✅ `.env.production` dosyası hazır
2. 📤 Production'a yükleyin (cPanel File Manager veya FTP)
3. 🔧 `ADMIN_PASSWORD` değerini değiştirin
4. 🚀 Backend'i başlatın (cPanel Terminal veya SSH)
5. ✅ Test edin: `https://fotografkutusu.com/api/health`

**Not:** SSH erişimi olmadan backend'i başlatmak zor olabilir. En kolay çözüm Railway.app veya Render.com kullanmaktır.

