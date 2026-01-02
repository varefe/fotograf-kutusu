# 🔍 Ödeme Sayfası Sorun Giderme

## ❌ Sorun

Ödeme sayfası gelmiyor.

## 🔍 Kontrol Adımları

### 1. Tarayıcı Konsolunu Kontrol Et

1. Ödeme sayfasına gidin: `https://fotografkutusu.com/payment?orderId=...`
2. Chrome DevTools açın (F12)
3. **Console** sekmesine bakın
4. Hata mesajlarını kontrol edin

**Beklenen loglar:**
```
🔍 Payment sayfası yüklendi, orderId: ...
🚀 Ödeme formu oluşturuluyor, orderId: ...
🌐 API URL: https://heartfelt-embrace-production-3c74.up.railway.app
🌐 API Endpoint oluşturuldu: https://heartfelt-embrace-production-3c74.up.railway.app/api/payment/create
📥 API Response Status: 200 OK
```

### 2. Network Sekmesini Kontrol Et

1. Chrome DevTools → **Network** sekmesi
2. Ödeme sayfasına gidin
3. `/api/payment/create` isteğini bulun
4. İsteğe tıklayın ve kontrol edin:
   - **Status:** 200 OK olmalı
   - **Response:** JSON olmalı (HTML değil)
   - **Headers:** CORS header'ları olmalı

### 3. Backend Loglarını Kontrol Et

Railway dashboard'da:
1. **"heartfelt-embrace"** servisine gidin
2. **"Logs"** sekmesine bakın
3. `/api/payment/create` isteği geliyor mu?
4. Hata mesajı var mı?

## 🛠️ Olası Sorunlar ve Çözümler

### Sorun 1: API İsteği Başarısız

**Belirtiler:**
- Network sekmesinde `/api/payment/create` isteği kırmızı
- Console'da "Failed to fetch" hatası

**Çözüm:**
1. Railway backend çalışıyor mu?
   ```bash
   curl https://heartfelt-embrace-production-3c74.up.railway.app/api/health
   ```

2. CORS ayarları doğru mu?
   - Backend'de `FRONTEND_URL=https://fotografkutusu.com` olmalı

### Sorun 2: API HTML Döndürüyor

**Belirtiler:**
- Network sekmesinde response HTML
- Console'da "API JSON döndürmedi, HTML döndü" hatası

**Çözüm:**
1. API endpoint doğru mu?
   - `https://heartfelt-embrace-production-3c74.up.railway.app/api/payment/create` olmalı

2. Backend route çalışıyor mu?
   - Railway loglarında `/api/payment/create` isteği görünüyor mu?

### Sorun 3: CORS Hatası

**Belirtiler:**
- Console'da "CORS policy" hatası
- Network sekmesinde OPTIONS isteği başarısız

**Çözüm:**
1. Backend CORS ayarları güncellendi (yapıldı ✅)
2. Railway'da backend'i yeniden deploy edin

### Sorun 4: localStorage'da Sipariş Yok

**Belirtiler:**
- Console'da "localStorage'da sipariş bulunamadı" hatası
- Sayfa hata mesajı gösteriyor

**Çözüm:**
1. Sipariş sayfasından tekrar sipariş oluşturun
2. localStorage'ı kontrol edin:
   ```javascript
   // Chrome Console'da:
   JSON.parse(localStorage.getItem('orders'))
   ```

## 🔧 Hızlı Test

### 1. Backend Health Check

```bash
curl https://heartfelt-embrace-production-3c74.up.railway.app/api/health
```

Beklenen: `{"status":"OK","message":"Server is running"}`

### 2. API Endpoint Test

```bash
curl -X POST https://heartfelt-embrace-production-3c74.up.railway.app/api/payment/create \
  -H "Content-Type: application/json" \
  -H "Origin: https://fotografkutusu.com" \
  -d '{"orderId":"test123","orderData":{"price":"100","customerInfo":{"email":"test@test.com","address":"test"}}}'
```

### 3. Frontend Test

1. Tarayıcıda: `https://fotografkutusu.com/payment?orderId=test123`
2. Console'u açın
3. Logları kontrol edin

## 📋 Debug Checklist

- [ ] Backend çalışıyor mu? (Health check)
- [ ] API endpoint doğru mu?
- [ ] CORS ayarları doğru mu?
- [ ] localStorage'da sipariş var mı?
- [ ] Network sekmesinde istek başarılı mı?
- [ ] Console'da hata var mı?
- [ ] Railway loglarında hata var mı?

## 🆘 Hala Çalışmıyorsa

1. **Tarayıcı konsolundaki tam hata mesajını paylaşın**
2. **Network sekmesindeki istek detaylarını paylaşın**
3. **Railway loglarını paylaşın**

---

**Not:** CORS ayarları güncellendi. Railway'da backend'i yeniden deploy etmeniz gerekebilir.

