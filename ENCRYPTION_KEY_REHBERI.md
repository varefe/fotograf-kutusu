# ENCRYPTION_KEY Rehberi

## 🔑 ENCRYPTION_KEY Nedir?

`ENCRYPTION_KEY`, veritabanında saklanan **hassas kişisel verileri şifrelemek** için kullanılan gizli anahtardır.

### Ne İşe Yarar?

Bu anahtar ile şifrelenen veriler:
- ✅ Müşteri adı ve soyadı
- ✅ E-posta adresi
- ✅ Telefon numarası
- ✅ Adres bilgisi
- ✅ Fotoğraf base64 verisi
- ✅ Sipariş notları

### Neden Önemli?

1. **Veri Güvenliği:** Veritabanı ele geçirilse bile, veriler şifrelenmiş olduğu için okunamaz
2. **KVKK Uyumluluğu:** Kişisel verilerin korunması kanunu gerekliliklerini karşılar
3. **Güvenlik:** Üçüncü taraf kişiler verilere erişemez

## 📍 Nerede Kullanılıyor?

**Dosya:** `server/utils/encryption.js`

```javascript
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fotograf-baski-secret-key-2024-change-in-production';
```

Bu anahtar:
- Environment variable'dan (`process.env.ENCRYPTION_KEY`) alınır
- Eğer yoksa, varsayılan bir değer kullanılır (GÜVENSİZ - sadece development için)
- **Production'da mutlaka değiştirilmelidir!**

## ⚠️ ÖNEMLİ UYARILAR

### 1. Production'da Değiştirin!
Varsayılan anahtar (`fotograf-baski-secret-key-2024-change-in-production`) **herkes tarafından biliniyor** ve güvensizdir!

### 2. Güçlü Anahtar Kullanın
- Minimum 32 karakter
- Rastgele karakterler (harf, rakam, özel karakter)
- Tahmin edilmesi zor olmalı

### 3. Asla Paylaşmayın
- `.env` dosyasını Git'e commit etmeyin (zaten `.gitignore`'da)
- Başkalarıyla paylaşmayın
- Güvenli bir yerde saklayın

### 4. Kaybetmeyin!
Anahtarı kaybederseniz, şifrelenmiş verileri **bir daha çözemezsiniz**!

## 🔧 Nasıl Oluşturulur?

### Yöntem 1: OpenSSL (Önerilen)

```bash
openssl rand -base64 32
```

**Örnek çıktı:**
```
K8mN9pQ2rT5vWxYzA3bC4dE6fG7hI8jK9lM0nO1pQ2rS3tU4vW5xY6zA=
```

### Yöntem 2: Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Yöntem 3: Online Generator (Güvenli siteler)
- https://randomkeygen.com/
- https://www.lastpass.com/features/password-generator

## 📝 .env Dosyasına Ekleme

Proje kök dizinindeki `.env` dosyasına ekleyin:

```env
# Şifreleme Anahtarı (ÖNEMLİ: Production'da değiştirin!)
ENCRYPTION_KEY=K8mN9pQ2rT5vWxYzA3bC4dE6fG7hI8jK9lM0nO1pQ2rS3tU4vW5xY6zA=
```

**Önemli:**
- `=` işaretini kaldırmayın (base64 formatında)
- Tırnak işareti kullanmayın
- Boşluk bırakmayın

## 🔄 Anahtarı Değiştirme

### ⚠️ DİKKAT: Mevcut Verileri Kaybedersiniz!

Eğer anahtarı değiştirirseniz, **eski anahtarla şifrelenmiş veriler çözülemez**!

### Güvenli Değiştirme Yöntemi:

1. **Yeni anahtar oluştur:**
   ```bash
   openssl rand -base64 32
   ```

2. **Eski verileri yedekle:**
   - Veritabanını yedekle (`data/orders.db`)
   - Eski anahtarla verileri çöz ve export et

3. **Yeni anahtarı `.env`'e ekle:**
   ```env
   ENCRYPTION_KEY=yeni-anahtar-buraya
   ```

4. **Yeni veriler yeni anahtarla şifrelenecek**

5. **Eski verileri yeniden şifrele (opsiyonel):**
   - Eski anahtarla çöz
   - Yeni anahtarla tekrar şifrele

## 🧪 Test Etme

Anahtarın çalışıp çalışmadığını test edin:

```bash
# Server'ı başlat
npm run server

# Sipariş oluştur (veriler şifrelenecek)
# Admin panelinden kontrol et (veriler çözülmüş görünmeli)
```

## 📋 Kontrol Listesi

- [ ] Production için yeni anahtar oluşturuldu
- [ ] `.env` dosyasına eklendi
- [ ] `.env` dosyası `.gitignore`'da (zaten var)
- [ ] Anahtar güvenli bir yerde saklandı
- [ ] Varsayılan anahtar kullanılmıyor
- [ ] Anahtar en az 32 karakter
- [ ] Anahtar rastgele ve tahmin edilmesi zor

## 🔐 Güvenlik İpuçları

1. **Her Ortam İçin Farklı Anahtar:**
   - Development: Bir anahtar
   - Staging: Başka bir anahtar
   - Production: Tamamen farklı bir anahtar

2. **Anahtar Yönetimi:**
   - Password manager'da saklayın (1Password, LastPass)
   - Güvenli bir yerde yedekleyin
   - Ekip üyeleriyle güvenli şekilde paylaşın

3. **Rotasyon (Döndürme):**
   - Düzenli olarak değiştirin (6-12 ayda bir)
   - Değiştirirken eski verileri yedekleyin

## ❓ Sık Sorulan Sorular

### S: Anahtarı kaybedersem ne olur?
**C:** Şifrelenmiş verileri bir daha çözemezsiniz. Bu yüzden anahtarı mutlaka güvenli bir yerde saklayın!

### S: Anahtarı değiştirebilir miyim?
**C:** Evet, ama eski anahtarla şifrelenmiş veriler çözülemez. Önce eski verileri yedekleyin.

### S: Anahtar ne kadar uzun olmalı?
**C:** Minimum 32 karakter (256 bit). Daha uzun olabilir ama 32 karakter yeterli.

### S: Anahtarı başkalarıyla paylaşmalı mıyım?
**C:** Sadece güvenilir ekip üyeleriyle, güvenli bir kanaldan paylaşın. Asla public olarak paylaşmayın!

### S: Varsayılan anahtarı kullanabilir miyim?
**C:** **HAYIR!** Sadece development/test için. Production'da mutlaka değiştirin!

## 📞 Yardım

Anahtar ile ilgili sorun yaşarsanız:
1. `.env` dosyasını kontrol edin
2. Server'ı yeniden başlatın
3. Anahtarın doğru formatta olduğundan emin olun (base64)

---

**Özet:** `ENCRYPTION_KEY` hassas verileri şifrelemek için kullanılan gizli anahtardır. Production'da mutlaka güçlü ve rastgele bir anahtar kullanın!
