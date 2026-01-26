# 🔒 IP Whitelist Kurulum Rehberi

## 📋 Verilen IP Aralıkları

```
74.220.51.0/24
74.220.59.0/24
```

Bu IP aralıkları admin paneli için whitelist'e eklendi.

## ✅ Yapılan Değişiklikler

1. **`server/middleware/security.js`** güncellendi:
   - CIDR notasyonu desteği eklendi (örn: 74.220.51.0/24)
   - X-Forwarded-For header desteği eklendi (reverse proxy için)
   - IPv6 desteği eklendi

2. **`server/server.js`** güncellendi:
   - Admin route'ları için IP whitelist desteği eklendi
   - Environment variable'dan IP'ler okunuyor

## 🚀 Kurulum

### 1. Environment Variable Ekle

`.env` dosyasına veya production environment variables'a ekleyin:

```env
ALLOWED_IPS=74.220.51.0/24,74.220.59.0/24
```

### 2. Tek IP Ekleme

Eğer tek IP eklemek isterseniz:

```env
ALLOWED_IPS=74.220.51.0/24,74.220.59.0/24,192.168.1.100
```

### 3. Production'da (Railway/Render/Fly.io)

**Railway:**
1. Settings → Variables
2. `ALLOWED_IPS` ekle
3. Değer: `74.220.51.0/24,74.220.59.0/24`

**Render:**
1. Settings → Environment
2. `ALLOWED_IPS` ekle
3. Değer: `74.220.51.0/24,74.220.59.0/24`

**Fly.io:**
```bash
fly secrets set ALLOWED_IPS="74.220.51.0/24,74.220.59.0/24"
```

## 🔍 Nasıl Çalışır?

1. **IP Whitelist Aktif:**
   - Sadece belirtilen IP aralıklarından gelen istekler `/api/admin` endpoint'lerine erişebilir
   - Diğer IP'lerden gelen istekler `403 Forbidden` alır

2. **IP Whitelist Yok:**
   - `ALLOWED_IPS` environment variable'ı yoksa veya boşsa
   - Tüm IP'lerden erişim serbest (normal çalışma)

3. **CIDR Notasyonu:**
   - `74.220.51.0/24` = 74.220.51.0 - 74.220.51.255 arasındaki tüm IP'ler
   - `74.220.59.0/24` = 74.220.59.0 - 74.220.59.255 arasındaki tüm IP'ler

## 🧪 Test

### 1. Whitelist Aktif mi Kontrol Et

Backend loglarında şunu görmelisiniz:
```
🔒 IP Whitelist aktif: 2 IP aralığı/IP
```

### 2. İzin Verilen IP'den Test

```bash
# İzin verilen IP aralığından (örn: 74.220.51.100)
curl -X GET https://your-backend.com/api/admin/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Beklenen:** Normal response (200 OK)

### 3. İzin Verilmeyen IP'den Test

```bash
# İzin verilmeyen IP'den (örn: 192.168.1.1)
curl -X GET https://your-backend.com/api/admin/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Beklenen:** 
```json
{
  "success": false,
  "error": "Erişim reddedildi",
  "message": "IP adresiniz izin verilen listede değil"
}
```

## 📝 Notlar

- **Sadece Admin Route'ları:** IP whitelist sadece `/api/admin/*` endpoint'leri için aktif
- **Diğer Route'lar:** `/api/user`, `/api/orders`, `/api/payment` normal çalışmaya devam eder
- **Development:** Localhost'ta test ederken IP whitelist devre dışı olabilir (environment variable yoksa)
- **Reverse Proxy:** X-Forwarded-For header'ı destekleniyor (nginx, cloudflare vb.)

## 🆘 Sorun Giderme

### IP Whitelist Çalışmıyor

1. **Environment Variable Kontrol:**
   ```bash
   echo $ALLOWED_IPS
   ```

2. **Backend Logları Kontrol:**
   - `🔒 IP Whitelist aktif: X IP aralığı/IP` mesajını görmelisiniz
   - Eğer görmüyorsanız, environment variable yüklenmemiş olabilir

3. **IP Format Kontrol:**
   - CIDR formatı: `74.220.51.0/24`
   - Tek IP: `192.168.1.100`
   - Virgülle ayrılmış: `74.220.51.0/24,74.220.59.0/24`

### Tüm İstekler Reddediliyor

1. **Environment Variable'ı Kaldırın:**
   - `ALLOWED_IPS` değişkenini silin veya boş bırakın
   - Backend'i yeniden başlatın

2. **Localhost Test:**
   - Localhost'ta test ederken `127.0.0.1` ekleyin:
   ```env
   ALLOWED_IPS=74.220.51.0/24,74.220.59.0/24,127.0.0.1
   ```

### Reverse Proxy Arkasında

Eğer nginx veya başka bir reverse proxy kullanıyorsanız:

1. **X-Forwarded-For Header'ı:** Otomatik olarak destekleniyor
2. **Real IP:** `req.ip` veya `req.headers['x-forwarded-for']` kullanılıyor

## ✅ Tamamlandı!

IP whitelist kurulumu tamamlandı. Admin paneli sadece belirtilen IP aralıklarından erişilebilir.
