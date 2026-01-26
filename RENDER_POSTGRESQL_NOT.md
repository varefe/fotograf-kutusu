# ⚠️ PostgreSQL vs MongoDB - Önemli Not

## 📊 Mevcut Durum

Proje şu anda **MongoDB** kullanıyor:
- ✅ Mongoose ODM
- ✅ UserSchema (MongoDB)
- ✅ OrderSchema (MongoDB)
- ✅ Tüm route'lar MongoDB için yazılmış

## 🔄 PostgreSQL Bilgileri

Render'dan PostgreSQL veritabanı bilgileri alındı:

```
Host: dpg-d5rsv3ggjchc73fbbm80-a.frankfurt-postgres.render.com
Port: 5432
Database: fotografkutusu_com
User: fotografkutusu_com_user
Password: vzsIGuEbtFRviZ2RNCvkwLFzxGIDmKW1
Connection String: postgresql://fotografkutusu_com_user:vzsIGuEbtFRviZ2RNCvkwLFzxGIDmKW1@dpg-d5rsv3ggjchc73fbbm80-a.frankfurt-postgres.render.com/fotografkutusu_com
```

## ⚠️ PostgreSQL'e Geçiş

PostgreSQL'e geçiş yapmak için **büyük değişiklikler** gerekir:

### 1. Dependencies Değişikliği
```json
// package.json
- "mongoose": "^9.1.4"
+ "pg": "^8.11.0"
+ "sequelize": "^6.35.0" // veya başka bir ORM
```

### 2. Database Config Değişikliği
- `server/config/database.js` tamamen yeniden yazılmalı
- PostgreSQL connection pool kurulmalı
- Mongoose yerine Sequelize veya pg kullanılmalı

### 3. Model Değişiklikleri
- `server/models/UserSchema.js` → Sequelize model'e çevrilmeli
- `server/models/OrderSchema.js` → Sequelize model'e çevrilmeli
- Tüm Mongoose metodları (findOne, create, findByIdAndUpdate, vb.) değiştirilmeli

### 4. Route Değişiklikleri
- Tüm route'larda Mongoose sorguları değiştirilmeli
- `server/routes/user.js`
- `server/routes/order.js`
- `server/routes/admin.js`
- `server/routes/payment.js`

### 5. Migration
- Mevcut MongoDB verilerini PostgreSQL'e migrate etmek gerekir
- Schema migration'ları oluşturulmalı

## ✅ Önerilen Çözüm: MongoDB Kullanmaya Devam

### Render'da MongoDB Servisi Oluştur

1. **Render Dashboard'a git:**
   - https://render.com
   - "New +" → "MongoDB"

2. **MongoDB Servisi Oluştur:**
   - Name: `fotograf-kutusu-mongodb`
   - Plan: Free
   - Region: Frankfurt

3. **Connection String'i Al:**
   - Render otomatik olarak `MONGODB_URI` environment variable'ı oluşturur
   - Veya manuel olarak connection string'i kopyalayın

4. **Backend Environment Variables'a Ekle:**
   - Render dashboard → Backend servisi → Environment
   - `MONGODB_URI` değişkenini ekleyin

### Avantajlar:
- ✅ Mevcut kod değişmeden çalışır
- ✅ Hızlı kurulum (5 dakika)
- ✅ Veri kaybı yok
- ✅ Test edilmiş kod

## 🔄 Alternatif: PostgreSQL'e Geçiş (Büyük İş)

Eğer gerçekten PostgreSQL kullanmak istiyorsanız:

1. **Dependencies güncelle:**
   ```bash
   npm install pg sequelize
   npm uninstall mongoose
   ```

2. **Database config yeniden yaz:**
   - `server/config/database.js` tamamen değiştir

3. **Tüm modelleri değiştir:**
   - UserSchema → User model (Sequelize)
   - OrderSchema → Order model (Sequelize)

4. **Tüm route'ları güncelle:**
   - Mongoose sorgularını Sequelize sorgularına çevir

5. **Migration script'leri yaz:**
   - MongoDB'den PostgreSQL'e veri aktarımı

**Tahmini Süre:** 4-6 saat

## 🎯 Öneri

**MongoDB kullanmaya devam edin:**
- Render'da MongoDB servisi oluşturun (ücretsiz)
- Mevcut kod çalışmaya devam eder
- Hızlı ve kolay

PostgreSQL'e geçiş sadece gerçekten gerekliyse yapılmalı (örneğin, relational data gereksinimi varsa).

## 📝 Not

PostgreSQL connection string'i kaydedildi, ancak şu anda kullanılmıyor. İleride PostgreSQL'e geçiş yapmak isterseniz bu bilgileri kullanabilirsiniz.
