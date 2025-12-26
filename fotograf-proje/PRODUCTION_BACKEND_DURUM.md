# Production Backend Durum Raporu

## ✅ Localhost Durumu

- ✅ Backend localhost'ta çalışıyor
- ✅ Port 5000'de erişilebilir
- ✅ Health check başarılı: `{"status":"OK","message":"Server is running"}`

## ❌ Production Durumu

- ❌ Backend production'da çalışmıyor
- ❌ `/api/health` endpoint'i HTML döndürüyor (backend yok)
- ❌ SSH erişimi yok (Port 22 kapalı)
- ❌ cPanel erişimi yok

## 🔧 Yapılması Gerekenler

### 1. Hosting Sağlayıcısıyla İletişim

Hosting sağlayıcınızla iletişime geçip şunları isteyin:

1. **cPanel Erişimi:**
   - cPanel şifresini sıfırlatın
   - cPanel URL'ini kontrol edin

2. **SSH Erişimi:**
   - SSH portunu (22) açtırın
   - SSH kullanıcı adı ve şifresini kontrol edin

3. **Backend Port:**
   - Port 5000'i açtırın (veya başka bir port)
   - Firewall ayarlarını kontrol edin

### 2. Backend'i Başlatma (Erişim Sağlandığında)

SSH ile bağlandıktan sonra:

```bash
# SSH ile bağlan
ssh pfotogex@fotografkutusu.com

# Proje klasörüne git
cd ~/fotograf-proje  # veya doğru klasör adı

# Dependencies yükle (eğer yüklenmemişse)
npm install

# PM2 ile başlat
pm2 start server/server.js --name "fotograf-backend" --env production
pm2 save

# Durum kontrolü
pm2 status
pm2 logs fotograf-backend

# Health check
curl http://localhost:5000/api/health
```

### 3. Alternatif: Backend'i Ayrı Subdomain'de Çalıştır

cPanel erişimi sağlandığında:

1. `api.fotografkutusu.com` subdomain'i oluşturun
2. Backend dosyalarını oraya yükleyin
3. Backend'i orada başlatın
4. `src/config/api.js` dosyasını güncelleyin:
   ```javascript
   return 'https://api.fotografkutusu.com'
   ```

## 📊 Test

### Localhost Test

```bash
# Backend çalışıyor mu?
curl http://localhost:5000/api/health

# Beklenen yanıt:
# {"status":"OK","message":"Server is running"}
```

### Production Test

```bash
# Backend çalışıyor mu?
curl https://fotografkutusu.com/api/health

# Şu an HTML döndürüyor (backend yok)
# Backend başlatıldıktan sonra JSON döndürmeli
```

## 🆘 Sorun Giderme

### Backend Başlamıyor

1. Node.js versiyonunu kontrol edin
2. Dependencies yüklü mü?
3. `.env` dosyası doğru mu?
4. Port 5000 kullanımda mı?

### Port 5000 Erişilemiyor

1. Firewall'da port 5000 açık mı?
2. Alternatif port kullanın (3001, 8080, vb.)
3. Backend'i subdomain'de çalıştırın

---

**Son Güncelleme:** $(date)
**Durum:** Production'da backend başlatılması gerekiyor, ancak SSH/cPanel erişimi yok.

