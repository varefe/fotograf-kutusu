# 🔄 PostgreSQL Geçiş Rehberi

## ✅ Tamamlanan İşlemler

1. ✅ PostgreSQL dependencies eklendi (`pg`, `sequelize`)
2. ✅ PostgreSQL bağlantı config dosyası oluşturuldu (`server/config/postgres.js`)
3. ✅ User modeli Sequelize ile oluşturuldu (`server/models/User.js`)
4. ✅ Order modeli Sequelize ile oluşturuldu (`server/models/Order.js`)
5. ✅ Server.js PostgreSQL bağlantısına güncellendi
6. ✅ User route'ları güncellendi (login, register, profile)

## ⚠️ Yapılması Gerekenler

### 1. Dependencies Yükleme

node_modules'da sorunlu dosyalar var. Temizleyip yeniden yükleyin:

```bash
# Sorunlu klasörleri temizle
rm -rf "node_modules/vite 2"
rm -rf "node_modules/sshpk 2"

# Dependencies yükle
npm install
```

Veya node_modules'ı tamamen temizleyip yeniden yükleyin:

```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. Environment Variable Ekle

`.env` dosyasına veya production environment variables'a ekleyin:

```env
POSTGRES_URI=postgresql://fotografkutusu_com_user:vzsIGuEbtFRviZ2RNCvkwLFzxGIDmKW1@dpg-d5rsv3ggjchc73fbbm80-a.frankfurt-postgres.render.com/fotografkutusu_com
```

VEYA

```env
DATABASE_URL=postgresql://fotografkutusu_com_user:vzsIGuEbtFRviZ2RNCvkwLFzxGIDmKW1@dpg-d5rsv3ggjchc73fbbm80-a.frankfurt-postgres.render.com/fotografkutusu_com
```

### 3. Kalan Route'ları Güncelle

Şu route dosyalarını güncellemeniz gerekiyor:

- ✅ `server/routes/user.js` - Tamamlandı
- ⏳ `server/routes/order.js` - Güncellenmeli
- ⏳ `server/routes/admin.js` - Güncellenmeli
- ⏳ `server/routes/payment.js` - Güncellenmeli

### 4. Order Route'larını Güncelle

`server/routes/order.js` dosyasında:
- `Order.findById` → `Order.findByPk`
- `Order.findOne` → `Order.findOne({ where: {...} })`
- `Order.create` → Aynı (Sequelize'de de create var)
- `Order.findByIdAndUpdate` → `Order.update` veya `Order.findByPk` + `order.save()`
- `Order.find` → `Order.findAll({ where: {...} })`

### 5. Admin Route'larını Güncelle

`server/routes/admin.js` dosyasında:
- Tüm Mongoose sorgularını Sequelize sorgularına çevir
- `OrderModel.findAll` → `Order.findAll`
- `OrderModel.formatOrder` → `Order.formatOrder` (zaten var)

### 6. Test Et

1. Backend'i başlatın: `npm run server`
2. PostgreSQL bağlantısını kontrol edin (loglarda "✅ PostgreSQL bağlantısı başarılı" görmelisiniz)
3. Tabloların oluşturulduğunu kontrol edin (loglarda "✅ PostgreSQL tabloları hazır" görmelisiniz)
4. Login/Register test edin
5. Sipariş oluşturma test edin

## 📝 Notlar

- **JSONB Kullanımı:** Order modelinde `photo`, `photos`, `customerInfo`, `customSize` alanları JSONB olarak saklanıyor
- **Encryption:** Şifreleme mekanizması aynı şekilde çalışıyor (hooks ile)
- **Timestamps:** Sequelize otomatik olarak `createdAt` ve `updatedAt` yönetiyor
- **Relations:** User ve Order arasında foreign key ilişkisi var (`userId`)

## 🆘 Sorun Giderme

### "User is not defined" Hatası

`server/routes/user.js` dosyasında `getUser()` fonksiyonunu kullanın:

```javascript
const UserModel = await getUser();
const user = await UserModel.findOne({ where: { email: '...' } });
```

### "Order is not defined" Hatası

Order route'larında da benzer şekilde:

```javascript
import { defineOrder } from '../models/Order.js';
const getOrder = async () => {
  const sequelize = await connectPostgres();
  return defineOrder(sequelize);
};
```

### Tablo Bulunamadı Hatası

Tablolar otomatik oluşturulmalı. Eğer oluşmadıysa:

```javascript
await User.sync({ force: true }); // DİKKAT: Tüm verileri siler!
await Order.sync({ force: true }); // DİKKAT: Tüm verileri siler!
```

### Connection String Hatası

Environment variable'ı kontrol edin:
- `POSTGRES_URI`
- `DATABASE_URL`
- `POSTGRES_URL`

Hepsi destekleniyor.
