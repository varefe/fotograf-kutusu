# iyzico Debug Kontrol Listesi

## ✅ 1. Backend Token Üretiyor mu?

**Kontrol:** Backend log'larına bakın

```bash
# Backend sunucusunu çalıştırın
npm run dev:server

# Sipariş oluşturup ödeme sayfasına gidin
# Backend log'larında şunu görmelisiniz:
```

**Beklenen Log:**
```
✅ checkoutFormInitialize.Token: abc123xyz...
🔍 Iyzipay Response: {
  status: 'success',
  token: 'abc123xyz...',
  checkoutFormContent: 'VAR',
  paymentPageUrl: 'https://...'
}
```

**Sorun Varsa:**
- ❌ `TOKEN YOK!` görüyorsanız → iyzico API key'leri yanlış olabilir
- ❌ `errorMessage` görüyorsanız → iyzico'dan gelen hatayı kontrol edin

---

## ✅ 2. Token Frontend'e Geliyor mu?

**Kontrol:** Tarayıcı konsolunu açın (F12 → Console)

**Beklenen Log:**
```javascript
🔍 Backend Response: {
  success: true,
  token: 'abc123xyz...',
  hasCheckoutFormContent: true,
  paymentPageUrl: 'https://...'
}
✅ Token frontend'e geldi: abc123xyz...
```

**Sorun Varsa:**
- ❌ `TOKEN YOK!` görüyorsanız → Backend token üretemiyor
- ❌ `hasCheckoutFormContent: false` → Backend'de sorun var

---

## ✅ 3. iyzico.js Yükleniyor mu?

**Kontrol:** 
1. Tarayıcı konsolunu açın (F12 → Console)
2. Network sekmesine gidin (F12 → Network)
3. `iyzipay-checkout.js` dosyasını arayın

**Beklenen:**
- Network'te `iyzipay-checkout.js` dosyası **200 OK** dönmeli
- Console'da: `✅ Script 1: https://static.iyzipay.com/...`
- Console'da: `✅ window.iyzipayCheckout mevcut`

**Sorun Varsa:**
- ❌ `404 Not Found` → iyzico script URL'i yanlış
- ❌ `window.iyzipayCheckout bulunamadı` → Script yüklenmemiş

---

## ✅ 4. Callback URL Doğru mu?

**Kontrol:** Callback URL'i tarayıcıdan test edin

```bash
# Test endpoint'ini çağırın
curl http://localhost:5000/api/payment/callback/test

# Veya tarayıcıdan açın
http://localhost:5000/api/payment/callback/test
```

**Beklenen:**
```json
{
  "success": true,
  "message": "Callback URL çalışıyor",
  "callbackUrl": "http://localhost:3000/api/payment/callback"
}
```

**Sorun Varsa:**
- ❌ `404 Not Found` → Route tanımlı değil
- ❌ `Cannot GET /api/payment/callback` → POST endpoint'i, GET değil

**Gerçek Callback URL:**
- iyzico ödeme sonrası POST isteği gönderir
- URL: `${FRONTEND_URL}/api/payment/callback`
- Şu an: `http://localhost:3000/api/payment/callback` (development)
- Production: `https://fotografkutusu.com/api/payment/callback`

---

## 🔍 Debug Adımları

### Adım 1: Backend Log'larını Kontrol Et
```bash
npm run dev:server
# Sipariş oluştur
# Backend log'larında token görünmeli
```

### Adım 2: Frontend Console'u Kontrol Et
```javascript
// F12 → Console
// Ödeme sayfasına gidin
// Console'da token log'larını görün
```

### Adım 3: Network Tab'ını Kontrol Et
```
F12 → Network → Filter: "iyzipay"
// iyzipay-checkout.js dosyası 200 OK dönmeli
```

### Adım 4: Callback URL'i Test Et
```bash
# Terminal'den
curl http://localhost:5000/api/payment/callback/test

# Veya tarayıcıdan
http://localhost:5000/api/payment/callback/test
```

---

## 🐛 Yaygın Sorunlar

### Sorun 1: Token Üretilmiyor
**Neden:** 
- iyzico API key'leri yanlış
- Sandbox key'leri production URI ile kullanılıyor
- Sipariş verisi eksik

**Çözüm:**
```env
# .env dosyasında
IYZIPAY_API_KEY=doğru-key
IYZIPAY_SECRET_KEY=doğru-secret
IYZIPAY_URI=https://sandbox-api.iyzipay.com  # veya https://api.iyzipay.com
```

### Sorun 2: Token Frontend'e Gelmiyor
**Neden:**
- CORS hatası
- Backend response'u hatalı

**Çözüm:**
- Backend sunucusunu yeniden başlatın
- CORS ayarlarını kontrol edin

### Sorun 3: iyzico.js Yüklenmiyor
**Neden:**
- Network hatası
- CSP (Content Security Policy) engelliyor

**Çözüm:**
- Network tab'ında hatayı kontrol edin
- CSP ayarlarını kontrol edin

### Sorun 4: Callback URL Çalışmıyor
**Neden:**
- Route tanımlı değil
- POST endpoint'i yanlış

**Çözüm:**
- `server/routes/payment.js` dosyasında callback route'unu kontrol edin
- Backend sunucusunu yeniden başlatın

---

## 📝 Test Senaryosu

1. **Sipariş Oluştur**
   - `/order` sayfasına gidin
   - Formu doldurun
   - "Sipariş Ver" butonuna basın

2. **Ödeme Sayfasına Git**
   - Otomatik yönlendirilmelisiniz
   - `/payment?orderId=123` sayfası açılmalı

3. **Backend Log'larını Kontrol Et**
   - Terminal'de token log'larını görün
   - `✅ checkoutFormInitialize.Token:` görünmeli

4. **Frontend Console'u Kontrol Et**
   - F12 → Console
   - Token log'larını görün
   - `✅ Token frontend'e geldi:` görünmeli

5. **Network Tab'ını Kontrol Et**
   - F12 → Network
   - `iyzipay-checkout.js` dosyası yüklenmeli
   - Status: 200 OK

6. **Callback URL'i Test Et**
   - `http://localhost:5000/api/payment/callback/test` açın
   - JSON response görmelisiniz

---

**Son Güncelleme:** $(date)



