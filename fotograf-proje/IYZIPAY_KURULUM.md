# Iyzipay Ödeme Entegrasyonu

## 1. Iyzipay Hesabı Oluşturma

1. [Iyzipay](https://www.iyzipay.com/) sitesine gidin
2. Hesap oluşturun veya giriş yapın
3. Dashboard'dan API bilgilerinizi alın

## 2. Sandbox (Test) Ortamı

Test için sandbox bilgileri:
- **API Key:** `sandbox-xxx` (Iyzipay dashboard'dan alın)
- **Secret Key:** `sandbox-xxx` (Iyzipay dashboard'dan alın)
- **URI:** `https://sandbox-api.iyzipay.com`

## 3. Production (Canlı) Ortamı

Canlı ortam için:
- **API Key:** Iyzipay dashboard'dan alın
- **Secret Key:** Iyzipay dashboard'dan alın
- **URI:** `https://api.iyzipay.com`

## 4. Environment Variables (.env)

Proje kök dizininde `.env` dosyasına ekleyin:

```env
# Iyzipay Ayarları
IYZIPAY_API_KEY=sandbox-xxx
IYZIPAY_SECRET_KEY=sandbox-xxx
IYZIPAY_URI=https://sandbox-api.iyzipay.com

# Frontend URL (Callback için)
FRONTEND_URL=http://localhost:3000

# Server Port
PORT=5000
NODE_ENV=development
```

**Production için:**
```env
IYZIPAY_API_KEY=production-api-key
IYZIPAY_SECRET_KEY=production-secret-key
IYZIPAY_URI=https://api.iyzipay.com
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

## 5. Test Kartları (Sandbox)

### Başarılı Ödeme:
- **Kart No:** `5528 7900 0000 0000`
- **Son Kullanma:** `12/25`
- **CVV:** `123`
- **3D Secure Şifre:** `123456`

### Başarısız Ödeme:
- **Kart No:** `5528 7900 0000 0001`
- **Son Kullanma:** `12/25`
- **CVV:** `123`

## 6. Ödeme Akışı

1. Kullanıcı sipariş formunu doldurur
2. Sipariş veritabanına kaydedilir
3. Ödeme sayfasına yönlendirilir (`/payment?orderId=123`)
4. Iyzipay ödeme formu gösterilir
5. Kullanıcı ödeme yapar
6. Iyzipay callback URL'e yönlendirir (`/api/payment/callback`)
7. Ödeme durumu kontrol edilir
8. Başarılı/başarısız sayfasına yönlendirilir

## 7. Ödeme Durumları

- **pending:** Ödeme bekleniyor
- **paid:** Ödeme yapıldı
- **failed:** Ödeme başarısız
- **refunded:** İade edildi

## 8. Sorun Giderme

### Ödeme formu açılmıyor
- Iyzipay API bilgilerini kontrol edin
- `.env` dosyasının doğru yüklendiğinden emin olun
- Server loglarını kontrol edin

### Callback çalışmıyor
- `FRONTEND_URL` doğru mu kontrol edin
- Iyzipay dashboard'da callback URL'i kontrol edin
- CORS ayarlarını kontrol edin

### Ödeme başarılı ama sipariş güncellenmiyor
- Veritabanı bağlantısını kontrol edin
- Server loglarını kontrol edin
- Sipariş ID'nin doğru geldiğini kontrol edin

## 9. Production'a Geçiş

1. Iyzipay'da production hesabı oluşturun
2. `.env` dosyasını production bilgileriyle güncelleyin
3. `IYZIPAY_URI`'yi `https://api.iyzipay.com` olarak değiştirin
4. `FRONTEND_URL`'i production domain'inizle değiştirin
5. Test edin

## 10. Güvenlik

- **Asla** API key ve secret key'i frontend'de kullanmayın
- `.env` dosyasını `.gitignore`'a ekleyin (zaten ekli)
- Production'da HTTPS kullanın
- Iyzipay webhook'larını kullanarak ödeme durumunu doğrulayın


















