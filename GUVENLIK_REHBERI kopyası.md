# Güvenlik Rehberi - Kişisel Verilerin Korunması

## 🔐 Güvenlik Özellikleri

Bu projede kişisel verilerin güvenliği için aşağıdaki özellikler uygulanmıştır:

### 1. Veri Şifreleme

#### Backend Şifreleme (AES-256-GCM)
- **Konum:** `server/utils/encryption.js`
- **Yöntem:** AES-256-GCM (Advanced Encryption Standard)
- **Özellikler:**
  - 256-bit anahtar
  - GCM (Galois/Counter Mode) - kimlik doğrulama ile
  - PBKDF2 ile key türetme (10,000 iterasyon)
  - Her şifrelemede rastgele IV ve Salt kullanımı

#### Şifrelenen Veriler:
- ✅ Müşteri adı (firstName, lastName)
- ✅ E-posta adresi (email)
- ✅ Telefon numarası (phone)
- ✅ Adres bilgisi (address)
- ✅ Fotoğraf base64 verisi (photo.base64)
- ✅ Notlar (notes)

### 2. Veritabanı Güvenliği

#### SQLite Veritabanı
- **Konum:** `data/orders.db`
- **Şifreleme:** Hassas alanlar şifrelenmiş olarak saklanır
- **Kolon:** `isEncrypted` - şifreleme durumunu gösterir

#### Veritabanı Yapısı:
```sql
CREATE TABLE orders (
  ...
  customer_firstName TEXT,      -- Şifrelenmiş
  customer_lastName TEXT,        -- Şifrelenmiş
  customer_email TEXT,           -- Şifrelenmiş
  customer_phone TEXT,           -- Şifrelenmiş
  customer_address TEXT,         -- Şifrelenmiş
  photo_base64 TEXT,             -- Şifrelenmiş
  notes TEXT,                    -- Şifrelenmiş
  isEncrypted INTEGER DEFAULT 1  -- Şifreleme durumu
)
```

### 3. API Güvenliği

#### Admin Authentication
- **Konum:** `server/middleware/auth.js`
- **Yöntem:** Basic Authentication
- **Korunan Endpoint'ler:**
  - `GET /api/orders` - Tüm siparişleri listele (SADECE ADMIN)
  - `GET /api/orders/:id` - Tek sipariş detayı (SADECE ADMIN)

#### Authentication Yöntemleri:
1. **Basic Auth** (Önerilen)
   - Header: `Authorization: Basic base64(username:password)`
   - Kullanım: Admin paneli API çağrılarında

2. **Session Token** (Alternatif)
   - Header: `X-Admin-Session: token`
   - Kullanım: Frontend session yönetimi için

3. **API Key** (Alternatif)
   - Header: `X-API-Key: key`
   - Kullanım: Servis-to-servis iletişim için

### 4. Frontend Güvenliği

#### Client-Side Şifreleme
- **Konum:** `src/utils/encryption.js`
- **Kullanım:** localStorage için ekstra koruma
- **Not:** Backend şifreleme daha güvenlidir, client-side şifreleme ekstra katman sağlar

#### Admin Panel Erişimi
- **Konum:** `src/pages/Admin.jsx`
- **Kontrol:** Session-based authentication
- **Süre:** 8 saat otomatik çıkış
- **API Çağrıları:** Basic Auth header ile korunur

## 🔑 Environment Variables

### Gerekli Değişkenler

```env
# Şifreleme Anahtarı (ÖNEMLİ: Production'da değiştirin!)
ENCRYPTION_KEY=your-very-strong-secret-key-min-32-chars

# Admin Bilgileri
ADMIN_USERNAME=efe
ADMIN_PASSWORD=193123

# Frontend Admin Bilgileri (Vite için)
VITE_ADMIN_USERNAME=efe
VITE_ADMIN_PASSWORD=193123

# API URL
VITE_API_URL=https://fotografkutusu.com/api
FRONTEND_URL=https://fotografkutusu.com
```

### ⚠️ ÖNEMLİ GÜVENLİK NOTLARI

1. **ENCRYPTION_KEY Değiştirin!**
   - Production'da mutlaka güçlü bir key kullanın
   - Minimum 32 karakter, rastgele karakterler
   - Örnek: `openssl rand -base64 32`

2. **.env Dosyasını Koruyun**
   - `.gitignore`'da olduğundan emin olun
   - Asla Git'e commit etmeyin
   - Production'da güvenli bir yerde saklayın

3. **HTTPS Kullanın**
   - Production'da mutlaka SSL sertifikası kullanın
   - HTTP üzerinden hassas veri göndermeyin

4. **Admin Şifrelerini Değiştirin**
   - Varsayılan şifreleri değiştirin
   - Güçlü şifreler kullanın
   - Düzenli olarak değiştirin

## 📋 Güvenlik Kontrol Listesi

### Kurulum
- [ ] `ENCRYPTION_KEY` değiştirildi (production için)
- [ ] Admin kullanıcı adı ve şifresi değiştirildi
- [ ] `.env` dosyası `.gitignore`'da
- [ ] SSL sertifikası kuruldu (production için)
- [ ] HTTPS yönlendirmesi aktif

### Veri Güvenliği
- [ ] Veritabanı dosyası güvenli bir yerde
- [ ] Veritabanı yedekleri şifrelenmiş
- [ ] Eski veriler temizlendi (gerekirse)
- [ ] Log dosyalarında hassas veri yok

### API Güvenliği
- [ ] Admin endpoint'leri korunuyor
- [ ] CORS ayarları doğru
- [ ] Rate limiting aktif (önerilen)
- [ ] API logları güvenli

### Frontend Güvenliği
- [ ] Admin paneli korunuyor
- [ ] Session timeout çalışıyor
- [ ] API çağrıları authenticated
- [ ] Hassas veriler console'da loglanmıyor

## 🛡️ Güvenlik İyileştirme Önerileri

### Kısa Vadeli
1. ✅ Veri şifreleme (TAMAMLANDI)
2. ✅ Admin authentication (TAMAMLANDI)
3. ⏳ Rate limiting ekle
4. ⏳ API request logging

### Orta Vadeli
1. JWT token authentication
2. Refresh token mekanizması
3. IP whitelist (admin için)
4. 2FA (İki faktörlü kimlik doğrulama)

### Uzun Vadeli
1. Veritabanı şifreleme (SQLCipher)
2. Audit logging (kim ne zaman ne yaptı)
3. Veri saklama süresi politikası
4. KVKK/GDPR uyumluluğu

## 🔍 Güvenlik Testi

### Test Senaryoları

1. **Admin Olmayan Erişim Denemesi**
   ```bash
   curl http://localhost:5000/api/orders
   # Beklenen: 401 Unauthorized
   ```

2. **Yanlış Şifre ile Erişim**
   ```bash
   curl -u wrong:password http://localhost:5000/api/orders
   # Beklenen: 403 Forbidden
   ```

3. **Doğru Admin Bilgileri ile Erişim**
   ```bash
   curl -u efe:193123 http://localhost:5000/api/orders
   # Beklenen: 200 OK (şifreli veriler çözülmüş)
   ```

4. **Veritabanı Şifreleme Kontrolü**
   ```bash
   sqlite3 data/orders.db "SELECT customer_email FROM orders LIMIT 1;"
   # Beklenen: Şifrelenmiş base64 string (düz metin değil)
   ```

## 📞 Destek

Güvenlik soruları için:
- Kod incelemesi yapın
- Penetrasyon testi yapın
- Güvenlik uzmanına danışın

## ⚖️ Yasal Uyarı

Bu proje KVKK (Kişisel Verilerin Korunması Kanunu) ve GDPR (Genel Veri Koruma Tüzüğü) gerekliliklerini karşılamak için tasarlanmıştır. Ancak:

- ✅ Veri şifreleme uygulanmıştır
- ✅ Erişim kontrolü uygulanmıştır
- ⚠️ Yasal danışmanlık alınması önerilir
- ⚠️ Veri saklama politikası oluşturulmalıdır
- ⚠️ Kullanıcı onay formları eklenmelidir
