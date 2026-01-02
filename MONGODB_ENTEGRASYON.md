# 🍃 MongoDB Entegrasyonu Tamamlandı!

## ✅ Yapılan Değişiklikler

1. ✅ `server/config/database.js` - MongoDB/Mongoose bağlantısı
2. ✅ `server/models/OrderSchema.js` - Mongoose schema oluşturuldu
3. ✅ `server/models/Order.js` - MongoDB model'i kullanıyor
4. ✅ `server/routes/order.js` - Async/await ile güncellendi
5. ✅ `server/server.js` - MongoDB bağlantısı eklendi

## 🔧 Railway'da Yapılacaklar

### 1. Environment Variables Ekle

Railway dashboard'da **"Variables"** sekmesine gidin ve şu değişkeni ekleyin:

```
MONGODB_URI=mongodb://mongo:DpZZNKhEweSoBgjnsTmwjOpjpmtRlSqP@yamanote.proxy.rlwy.net:38288
```

**VEYA** Railway otomatik olarak MongoDB servisini bağladıysa, `MONGODB_URI` değişkeni otomatik oluşturulmuş olabilir. Kontrol edin.

### 2. Diğer Environment Variables

Aşağıdaki değişkenlerin de eklendiğinden emin olun:

```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://fotografkutusu.com
IYZIPAY_API_KEY=TZY4COlRiQDLL7ERFUK5FzGW3rNBDLio
IYZIPAY_SECRET_KEY=Eu1eRgVCgE3EKU90DpoKZdgiRNsIDZXN
IYZIPAY_URI=https://api.iyzipay.com
ENCRYPTION_KEY=CTJXtl9tnkQVwEF1pscutNxDqUf3NUcyETPc1QjkPb8=
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password-here
MONGODB_URI=mongodb://mongo:DpZZNKhEweSoBgjnsTmwjOpjpmtRlSqP@yamanote.proxy.rlwy.net:38288
```

### 3. Deploy Et

1. Ayarları kaydedin
2. **"Deployments"** sekmesine gidin
3. **"Redeploy"** butonuna tıklayın

## 🧪 Test

Deploy başladıktan sonra:

### 1. Logları Kontrol Et

Railway dashboard'da **"Logs"** sekmesinde şunu görmelisiniz:

```
✅ MongoDB bağlantısı başarılı
✅ Veritabanı hazır
✅ Server 5000 portunda çalışıyor
```

### 2. Health Check

Tarayıcıda şu URL'yi açın:
```
https://your-app.railway.app/api/health
```

Beklenen yanıt:
```json
{"status":"OK","message":"Server is running"}
```

### 3. MongoDB Bağlantısı Test

Backend loglarında MongoDB bağlantı mesajını görmelisiniz.

## 📊 MongoDB Yapısı

### Database: `test` (veya Railway'ın belirlediği database)

### Collection: `orders`

### Schema Yapısı:

```javascript
{
  photo: {
    filename: String,
    originalName: String,
    base64: String (şifrelenmiş),
    mimetype: String,
    size: Number
  },
  size: String,
  customSize: {
    width: Number,
    height: Number
  },
  quantity: Number,
  frameType: String,
  paperType: String,
  colorMode: String,
  shippingType: String,
  customerInfo: {
    firstName: String (şifrelenmiş),
    lastName: String (şifrelenmiş),
    email: String (şifrelenmiş),
    phone: String (şifrelenmiş),
    address: String (şifrelenmiş)
  },
  price: Number,
  status: String,
  paymentStatus: String,
  notes: String (şifrelenmiş),
  isEncrypted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Güvenlik

- ✅ Hassas bilgiler (müşteri bilgileri, fotoğraflar, notlar) şifreleniyor
- ✅ Sadece admin kullanıcılar şifrelenmiş verileri görebiliyor
- ✅ MongoDB bağlantısı güvenli (Railway üzerinden)

## 🆘 Sorun Giderme

### MongoDB Bağlantı Hatası

1. **MONGODB_URI kontrol edin:**
   - Railway dashboard'da Variables sekmesinde `MONGODB_URI` var mı?
   - Değer doğru mu?

2. **MongoDB servisi çalışıyor mu?**
   - Railway dashboard'da MongoDB servisinin çalıştığını kontrol edin

3. **Logları kontrol edin:**
   - Railway dashboard'da Logs sekmesine bakın
   - Hata mesajlarını kontrol edin

### Backend Başlamıyor

1. **Dependencies yüklü mü?**
   - `package.json`'da `mongoose` var mı? (Zaten var ✅)

2. **Build Command doğru mu?**
   - Railway Settings'te: `npm install`

3. **Start Command doğru mu?**
   - Railway Settings'te: `node server/server.js`

## ✅ Tamamlandı!

MongoDB entegrasyonu tamamlandı. Artık Railway'da backend MongoDB kullanıyor!

---

**Not:** SQLite dosyaları (`data/orders.db`) artık kullanılmıyor. Tüm veriler MongoDB'de saklanacak.

