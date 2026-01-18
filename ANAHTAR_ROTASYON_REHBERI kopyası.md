# Şifreleme Anahtarı Rotasyon Rehberi

## 🔄 Anahtar Rotasyonu Nedir?

Şifreleme anahtarını düzenli olarak değiştirmek ve eski anahtarla şifrelenmiş verileri yeni anahtarla yeniden şifrelemek işlemidir.

### Neden Önemli?

1. **Güvenlik:** Eski anahtar sızdırılmışsa, yeni anahtarla veriler güvende kalır
2. **Best Practice:** Düzenli anahtar rotasyonu güvenlik standartları gereğidir
3. **Compliance:** KVKK ve GDPR gibi düzenlemeler düzenli rotasyon önerir

## 🚀 Kullanım

### Otomatik Rotasyon (Önerilen)

```bash
npm run rotate-key
```

Bu komut:
1. ✅ Yeni bir şifreleme anahtarı oluşturur
2. ✅ Tüm şifrelenmiş verileri eski anahtarla çözer
3. ✅ Yeni anahtarla tekrar şifreler
4. ✅ `.env` dosyasını günceller
5. ✅ Veritabanını günceller

### Manuel Çalıştırma

```bash
node server/scripts/rotate-encryption-key.js --auto
```

### İnteraktif Mod (Onay İsteyen)

```bash
node server/scripts/rotate-encryption-key.js
```

## 📋 Rotasyon Süreci

### 1. Hazırlık

- ✅ Veritabanı yedeği alın
- ✅ `.env` dosyası yedeği alın
- ✅ Server'ı durdurun (opsiyonel ama önerilir)

### 2. Rotasyonu Çalıştır

```bash
npm run rotate-key
```

### 3. Sonuçları Kontrol Et

Script şunları gösterecek:
- ✅ İşlenen sipariş sayısı
- ✅ Başarılı/başarısız işlemler
- ✅ Hata varsa hangi siparişlerde

### 4. Server'ı Yeniden Başlat

```bash
npm run server
```

## ⚠️ Önemli Notlar

### 1. Yedekleme

**Rotasyon öncesi mutlaka yedek alın:**
```bash
# Veritabanı yedeği
cp data/orders.db data/orders.db.backup

# .env yedeği
cp .env .env.backup
```

### 2. Eski Anahtarı Saklayın

Eski anahtarı silmeyin! Gerekirse eski verileri çözmek için gerekebilir.

### 3. Server Yeniden Başlatma

Rotasyon sonrası server'ı mutlaka yeniden başlatın, yoksa eski anahtar kullanılmaya devam eder.

### 4. Hata Durumunda

Eğer rotasyon sırasında hata olursa:
1. Yedekten geri yükleyin
2. Hataları kontrol edin
3. Tekrar deneyin

## 📅 Rotasyon Takvimi

### Önerilen Sıklık

- **Development:** İhtiyaç olduğunda
- **Staging:** Ayda bir
- **Production:** 3-6 ayda bir

### Otomatik Rotasyon (Cron Job)

Production'da otomatik rotasyon için cron job ekleyebilirsiniz:

```bash
# Her 3 ayda bir (1 Ocak, 1 Nisan, 1 Temmuz, 1 Ekim)
0 2 1 */3 * cd /path/to/project && npm run rotate-key
```

## 🔍 Rotasyon Sonrası Kontrol

### 1. Veritabanı Kontrolü

```sql
-- Şifrelenmiş sipariş sayısı
SELECT COUNT(*) FROM orders WHERE isEncrypted = 1;

-- Örnek veri kontrolü
SELECT id, customer_email FROM orders LIMIT 1;
-- Email şifrelenmiş görünmeli (uzun base64 string)
```

### 2. API Kontrolü

```bash
# Admin ile siparişleri çek
curl -u efe:193123 http://localhost:5000/api/orders

# Veriler çözülmüş görünmeli
```

### 3. Log Kontrolü

Server loglarında hata olmamalı:
```bash
npm run server
# Hata mesajı olmamalı
```

## 🛠️ Sorun Giderme

### Problem: "Çözme hatası" alıyorum

**Çözüm:**
- Eski anahtar doğru mu kontrol edin
- `.env` dosyasındaki `ENCRYPTION_KEY` doğru mu?
- Veritabanı bozulmuş olabilir, yedekten geri yükleyin

### Problem: "Şifreleme hatası" alıyorum

**Çözüm:**
- Yeni anahtar geçerli formatta mı? (base64)
- Disk alanı yeterli mi?
- Veritabanı yazma izinleri var mı?

### Problem: Bazı siparişler başarısız

**Çözüm:**
- Hangi siparişlerde hata var? (log'da gösterilir)
- Bu siparişlerin verileri bozulmuş olabilir
- Manuel olarak kontrol edin

## 📊 Rotasyon İstatistikleri

Script çalıştığında şunları gösterir:

```
📊 Rotasyon Sonuçları:
   ✅ Başarılı: 150
   ❌ Başarısız: 2
   ⚠️  Başarısız sipariş ID'leri: 45, 78
```

## 🔐 Güvenlik İpuçları

1. **Rotasyon Öncesi:**
   - Yedek alın
   - Server'ı durdurun
   - Maintenance mode açın (opsiyonel)

2. **Rotasyon Sırasında:**
   - Script'i kesmeyin
   - Server'ı kullanmayın
   - Log'ları takip edin

3. **Rotasyon Sonrası:**
   - Server'ı yeniden başlatın
   - Test edin
   - Eski anahtarı güvenli saklayın

## 📝 Örnek Kullanım Senaryosu

### Senaryo: 3 Aylık Rotasyon

```bash
# 1. Yedek al
cp data/orders.db data/orders.db.backup.$(date +%Y%m%d)
cp .env .env.backup.$(date +%Y%m%d)

# 2. Server'ı durdur
# (PM2, systemd, vb. ile)

# 3. Rotasyonu çalıştır
npm run rotate-key

# 4. Sonuçları kontrol et
# Script çıktısını incele

# 5. Server'ı başlat
npm run server

# 6. Test et
curl -u efe:193123 http://localhost:5000/api/orders

# 7. Eski yedekleri arşivle (30 gün sonra)
```

## ✅ Kontrol Listesi

Rotasyon öncesi:
- [ ] Veritabanı yedeği alındı
- [ ] .env yedeği alındı
- [ ] Server durduruldu (opsiyonel)
- [ ] Disk alanı yeterli

Rotasyon sırasında:
- [ ] Script çalışıyor
- [ ] Hata yok
- [ ] Log'lar takip ediliyor

Rotasyon sonrası:
- [ ] Server yeniden başlatıldı
- [ ] Veriler doğru çözülüyor
- [ ] API çalışıyor
- [ ] Eski anahtar saklandı

## 🎯 Sonuç

Düzenli anahtar rotasyonu güvenliğin önemli bir parçasıdır. Bu script ile rotasyonu kolayca yapabilirsiniz.

**Önemli:** İlk rotasyonu test ortamında deneyin!

---

**Script Konumu:** `server/scripts/rotate-encryption-key.js`  
**Kullanım:** `npm run rotate-key`
