# 🔄 PostgreSQL Kurulum Talimatı

## ⚠️ ÖNEMLİ: node_modules Sorunu

node_modules klasöründe sorunlu dosyalar var (`* 2` ile biten klasörler). Bu yüzden `npm install` başarısız oluyor.

## ✅ Çözüm: node_modules'ı Temizle ve Yeniden Yükle

### Adım 1: node_modules'ı Temizle

```bash
cd "/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje"
rm -rf node_modules
rm -f package-lock.json
```

### Adım 2: Dependencies Yükle

```bash
npm install
```

Bu komut `pg` ve `sequelize` paketlerini de yükleyecek (package.json'da zaten var).

### Adım 3: Backend'i Başlat

```bash
npm run server
```

## 📝 Environment Variable Ekle

`.env` dosyasına veya production environment variables'a ekleyin:

```env
POSTGRES_URI=postgresql://fotografkutusu_com_user:vzsIGuEbtFRviZ2RNCvkwLFzxGIDmKW1@dpg-d5rsv3ggjchc73fbbm80-a.frankfurt-postgres.render.com/fotografkutusu_com
```

VEYA

```env
DATABASE_URL=postgresql://fotografkutusu_com_user:vzsIGuEbtFRviZ2RNCvkwLFzxGIDmKW1@dpg-d5rsv3ggjchc73fbbm80-a.frankfurt-postgres.render.com/fotografkutusu_com
```

## ✅ Yapılan Değişiklikler

1. ✅ PostgreSQL bağlantı config (`server/config/postgres.js`)
2. ✅ User modeli Sequelize (`server/models/User.js`)
3. ✅ Order modeli Sequelize (`server/models/Order.js`)
4. ✅ Server.js PostgreSQL bağlantısı
5. ✅ User route'ları güncellendi
6. ⏳ Order route'ları kısmen güncellendi (bazı Mongoose referansları kaldı)

## ⚠️ Kalan İşler

1. **Admin route'larını güncelle** (`server/routes/admin.js`)
2. **Payment route'larını kontrol et** (`server/routes/payment.js`)
3. **Order route'larındaki JSONB sorgularını düzelt** (customerInfo.email kontrolü)

## 🧪 Test

Backend başladıktan sonra:

1. PostgreSQL bağlantısını kontrol et (loglarda "✅ PostgreSQL bağlantısı başarılı")
2. Tabloların oluşturulduğunu kontrol et (loglarda "✅ PostgreSQL tabloları hazır")
3. Login/Register test et
4. Sipariş oluşturma test et

## 🆘 Sorun Giderme

### "Cannot find package 'sequelize'"

node_modules'ı temizleyip yeniden yükleyin (yukarıdaki adımlar).

### "Table 'users' doesn't exist"

Tablolar otomatik oluşturulmalı. Eğer oluşmadıysa:

```javascript
// server.js'de sync zaten var, ama manuel olarak:
await User.sync({ force: true }); // DİKKAT: Tüm verileri siler!
await Order.sync({ force: true }); // DİKKAT: Tüm verileri siler!
```

### JSONB Sorgu Hatası

PostgreSQL'de JSONB içinde email kontrolü için:

```javascript
const { literal } = await import('sequelize');
const order = await OrderModel.findOne({
  where: literal(`customer_info->>'email' = '${email}'`)
});
```
