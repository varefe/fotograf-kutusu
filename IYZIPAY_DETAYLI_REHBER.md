# Iyzipay Ödeme Entegrasyonu - Detaylı Rehber

## 📋 Gerekli Bilgiler ve Nereden Alınır

### 1. Iyzipay Hesabı Oluşturma

**Adımlar:**
1. [Iyzipay Resmi Sitesi](https://www.iyzipay.com/) adresine gidin
2. "Kayıt Ol" butonuna tıklayın
3. İş bilgilerinizi doldurun:
   - Şirket adı
   - Vergi numarası
   - İletişim bilgileri
   - Banka hesap bilgileri (para çekme için)

### 2. API Bilgilerini Alma

**Iyzipay Dashboard'dan:**
1. Iyzipay'a giriş yapın
2. Sol menüden **"Ayarlar"** > **"API Bilgileri"** seçin
3. Şu bilgileri alacaksınız:
   - **API Key** (Public Key)
   - **Secret Key** (Private Key)
   - **Base URL** (Sandbox veya Production)

**Önemli:**
- **Sandbox (Test):** `https://sandbox-api.iyzipay.com`
- **Production (Canlı):** `https://api.iyzipay.com`

### 3. Test Ortamı (Sandbox) Bilgileri

Test için Iyzipay hesabınızda sandbox API bilgileri otomatik oluşturulur:
- Sandbox API Key: `sandbox-xxxxx` formatında
- Sandbox Secret Key: `sandbox-xxxxx` formatında

### 4. Production (Canlı) Ortamı

Canlı ortam için:
1. Iyzipay hesabınızda **"Canlı Ortam"** seçeneğini aktif edin
2. Gerekli belgeleri yükleyin (şirket belgeleri, imza sirküleri vb.)
3. Iyzipay onayı bekleyin (genellikle 1-3 iş günü)
4. Onaylandıktan sonra Production API bilgilerinizi alın

## 🔧 Projeye Entegrasyon

### Adım 1: .env Dosyasını Güncelle

Proje kök dizinindeki `.env` dosyasına ekleyin:

```env
# Iyzipay Ayarları (Test için)
IYZIPAY_API_KEY=sandbox-xxxxxxxxxxxxx
IYZIPAY_SECRET_KEY=sandbox-xxxxxxxxxxxxx
IYZIPAY_URI=https://sandbox-api.iyzipay.com

# Frontend URL (Callback için)
FRONTEND_URL=https://fotografkutusu.com

# Server Port
PORT=5000
NODE_ENV=production
```

**Production için:**
```env
IYZIPAY_API_KEY=production-xxxxxxxxxxxxx
IYZIPAY_SECRET_KEY=production-xxxxxxxxxxxxx
IYZIPAY_URI=https://api.iyzipay.com
FRONTEND_URL=https://fotografkutusu.com
```

### Adım 2: Backend Server'ı Başlat

```bash
npm run server
```

veya development için:
```bash
npm run dev:server
```

### Adım 3: Test Et

1. Sipariş formunu doldurun
2. Ödeme sayfasına yönlendirileceksiniz
3. Test kartı ile ödeme yapın

## 🧪 Test Kartları (Sandbox)

### Başarılı Ödeme:
- **Kart No:** `5528 7900 0000 0000`
- **Son Kullanma:** `12/25` (gelecek bir tarih)
- **CVV:** `123`
- **3D Secure Şifre:** `123456`
- **Kart Sahibi:** Herhangi bir isim

### Başarısız Ödeme:
- **Kart No:** `5528 7900 0000 0001`
- **Son Kullanma:** `12/25`
- **CVV:** `123`

### Yetersiz Bakiye:
- **Kart No:** `5528 7900 0000 0002`
- **Son Kullanma:** `12/25`
- **CVV:** `123`

## 📍 Iyzipay Bilgilerini Nereden Alırsınız?

### 1. Iyzipay Dashboard
- URL: https://merchant.iyzipay.com
- Giriş yaptıktan sonra: **Ayarlar** > **API Bilgileri**

### 2. E-posta
- Hesap oluşturduktan sonra API bilgileri e-posta ile gönderilir
- Sandbox bilgileri hemen, Production bilgileri onay sonrası

### 3. Destek
- Iyzipay destek ekibi: support@iyzipay.com
- Telefon: 0850 532 0 532

## 🔐 Güvenlik Notları

1. **Asla API bilgilerini frontend'de kullanmayın**
   - API Key ve Secret Key sadece backend'de olmalı
   - `.env` dosyası `.gitignore`'da (zaten ekli)

2. **HTTPS kullanın**
   - Production'da mutlaka SSL sertifikası olmalı
   - Iyzipay HTTPS gerektirir

3. **Webhook kullanın** (önerilen)
   - Ödeme durumunu webhook ile doğrulayın
   - Daha güvenli ve güvenilir

## 💰 Komisyon ve Ücretler

- **Kurulum ücreti:** Yok
- **Aylık ücret:** Yok
- **Komisyon:** İşlem başına %2.9 + 0.25 TL (kredi kartı)
- **Para çekme:** Ücretsiz (ayda 1 kez)

## 📞 Destek ve Yardım

- **Iyzipay Destek:** support@iyzipay.com
- **Teknik Dokümantasyon:** https://dev.iyzipay.com
- **Test Kartları:** https://dev.iyzipay.com/tr/test-kartlari

## ✅ Kontrol Listesi

- [ ] Iyzipay hesabı oluşturuldu
- [ ] Sandbox API bilgileri alındı
- [ ] `.env` dosyası güncellendi
- [ ] Backend server çalışıyor
- [ ] Test kartı ile ödeme test edildi
- [ ] Production hesabı onaylandı (canlı için)
- [ ] Production API bilgileri `.env`'e eklendi
- [ ] SSL sertifikası aktif (production için)
- [ ] Callback URL doğru çalışıyor

## 🚀 Hızlı Başlangıç

1. **Iyzipay'a kayıt ol:** https://www.iyzipay.com/
2. **Sandbox API bilgilerini al:** Dashboard > Ayarlar > API Bilgileri
3. **`.env` dosyasını güncelle:**
   ```env
   IYZIPAY_API_KEY=sandbox-xxx
   IYZIPAY_SECRET_KEY=sandbox-xxx
   IYZIPAY_URI=https://sandbox-api.iyzipay.com
   FRONTEND_URL=https://fotografkutusu.com
   ```
4. **Backend server'ı başlat:** `npm run server`
5. **Test et:** Test kartı ile ödeme yap

## 📝 Notlar

- Sandbox ortamında gerçek para çekilmez
- Production'a geçmeden önce mutlaka test edin
- Callback URL'i Iyzipay dashboard'da ayarlayın
- Webhook URL'i de ayarlayın (önerilen)
