# SQLite Veritabanına Erişim Yöntemleri

## 1. Terminal/CLI ile Erişim

### SQLite3 Kurulumu (macOS):
```bash
brew install sqlite3
```

### Veritabanını Açma:
```bash
sqlite3 data/orders.db
```

### Temel Komutlar:
```sql
-- Tüm siparişleri görüntüle
SELECT * FROM orders;

-- Son 10 siparişi görüntüle
SELECT * FROM orders ORDER BY createdAt DESC LIMIT 10;

-- Belirli bir siparişi görüntüle
SELECT * FROM orders WHERE id = 1;

-- Sipariş sayısı
SELECT COUNT(*) FROM orders;

-- Çıkış
.quit
```

## 2. DB Browser for SQLite (GUI - Önerilen)

### Kurulum:
1. https://sqlitebrowser.org/ adresine gidin
2. DB Browser for SQLite'ı indirin ve kurun

### Kullanım:
1. DB Browser'ı açın
2. "Open Database" butonuna tıklayın
3. `data/orders.db` dosyasını seçin
4. "Browse Data" sekmesinden siparişleri görüntüleyin
5. "Execute SQL" sekmesinden SQL sorguları çalıştırın

## 3. Admin Paneli (Web Arayüzü)

Admin paneli zaten var! Sadece SQLite'a bağlanması gerekiyor.

**URL:** `http://localhost:3000/admin`

Admin panelinde:
- Tüm siparişleri görüntüleyebilirsiniz
- Sipariş durumlarını güncelleyebilirsiniz
- Siparişleri silebilirsiniz

## 4. API ile Erişim

### Tüm Siparişleri Getir:
```bash
curl http://localhost:5000/api/orders
```

### Tek Sipariş Getir:
```bash
curl http://localhost:5000/api/orders/1
```

## 5. Node.js Script ile

`view-orders.js` script'i oluşturabilirim, isterseniz söyleyin.

## 📊 Veritabanı Yapısı

**orders** tablosu kolonları:
- `id` - Sipariş ID (otomatik artan)
- `photo_filename` - Fotoğraf dosya adı
- `photo_base64` - Fotoğraf (base64)
- `size` - Boyut
- `quantity` - Adet
- `customer_email` - E-posta
- `customer_address` - Adres
- `price` - Fiyat
- `status` - Durum (Yeni, Baskıda, vs.)
- `createdAt` - Oluşturulma tarihi

## 🔍 Örnek SQL Sorguları

```sql
-- Bugünkü siparişler
SELECT * FROM orders WHERE DATE(createdAt) = DATE('now');

-- Toplam gelir
SELECT SUM(price) as toplam FROM orders;

-- Duruma göre sipariş sayısı
SELECT status, COUNT(*) as sayi FROM orders GROUP BY status;

-- En yüksek fiyatlı siparişler
SELECT * FROM orders ORDER BY price DESC LIMIT 5;
```























