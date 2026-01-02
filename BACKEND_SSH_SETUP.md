# Backend SSH ile Kurulum Rehberi

## 🚀 cPanel Erişilemiyorsa SSH ile Backend Başlatma

### 1. SSH Bağlantısı

```bash
# SSH ile sunucuya bağlan
ssh pfotogex@fotografkutusu.com

# Veya IP adresi ile
ssh pfotogex@[SUNUCU_IP]
```

### 2. Backend Dosyalarını Kontrol Et

```bash
# Ana dizine git
cd ~

# Proje klasörünü bul
ls -la

# Backend dosyalarının olduğu klasöre git
cd fotograf-proje
# veya
cd public_html
# veya başka bir klasör adı
```

### 3. Node.js ve PM2 Kontrolü

```bash
# Node.js versiyonunu kontrol et
node --version

# PM2 kurulu mu?
pm2 --version

# Eğer PM2 yoksa:
npm install -g pm2
```

### 4. Backend'i Başlat

```bash
# Proje klasörüne git
cd ~/fotograf-proje  # veya doğru klasör adı

# Dependencies yükle (eğer yüklenmemişse)
npm install

# .env dosyasını kontrol et
cat .env

# Backend'i PM2 ile başlat
pm2 start server/server.js --name "fotograf-backend" --env production

# PM2'yi kaydet (sunucu yeniden başladığında otomatik başlasın)
pm2 save

# Durum kontrolü
pm2 status
pm2 logs fotograf-backend
```

### 5. Port Kontrolü

```bash
# Port 5000 kullanımda mı?
lsof -ti:5000

# Backend health check
curl http://localhost:5000/api/health
```

### 6. Firewall Kontrolü (Eğer Port 5000 Açıksa)

```bash
# Firewall durumunu kontrol et
sudo ufw status

# Port 5000'i aç (eğer gerekirse)
sudo ufw allow 5000/tcp
```

## 🔧 Alternatif: Backend'i Ayrı Port'ta Çalıştır

Eğer port 5000 kullanılamıyorsa:

```bash
# .env dosyasını düzenle
nano .env

# PORT değişkenini değiştir
PORT=3001  # veya başka bir port

# Backend'i yeniden başlat
pm2 restart fotograf-backend
```

## 📊 PM2 Komutları

```bash
# Durum kontrolü
pm2 status

# Logları görüntüle
pm2 logs fotograf-backend

# Yeniden başlat
pm2 restart fotograf-backend

# Durdur
pm2 stop fotograf-backend

# Sil
pm2 delete fotograf-backend

# Tüm logları temizle
pm2 flush
```

## 🆘 Sorun Giderme

### SSH Bağlantısı Kurulamıyor

1. **SSH erişimi aktif mi?**
   - Hosting sağlayıcınızdan SSH erişimini aktifleştirmeniz gerekebilir
   - cPanel'de "Terminal" veya "SSH Access" bölümünden aktifleştirin

2. **Port 22 açık mı?**
   ```bash
   # Farklı port deneyin
   ssh -p 2222 pfotogex@fotografkutusu.com
   ```

### Backend Başlamıyor

1. **Node.js versiyonu:**
   ```bash
   node --version  # v18+ olmalı
   ```

2. **Dependencies:**
   ```bash
   npm install
   ```

3. **.env dosyası:**
   ```bash
   cat .env  # Tüm değişkenler doğru mu?
   ```

4. **Port kullanımda:**
   ```bash
   lsof -ti:5000  # Başka bir process kullanıyor mu?
   ```

### Port 5000 Erişilemiyor

1. **Firewall:**
   ```bash
   sudo ufw allow 5000/tcp
   ```

2. **Alternatif port kullan:**
   - `.env` dosyasında `PORT=3001` yap
   - Frontend'de `src/config/api.js` dosyasını güncelle

## 📝 Hızlı Başlatma Script'i

SSH'de çalıştırın:

```bash
#!/bin/bash
cd ~/fotograf-proje
npm install
pm2 delete fotograf-backend 2>/dev/null
pm2 start server/server.js --name "fotograf-backend" --env production
pm2 save
pm2 status
```

---

**Not:** SSH erişimi yoksa, hosting sağlayıcınızdan SSH erişimini aktifleştirmeniz gerekir.

