# 🔐 Şifre Değiştirme - Adım Adım

## varefe@icloud.com için yeni şifre: `Efe*193123`

### ⚠️ ÖNEMLİ: node_modules Bozuk

Terminal'de şu komutları **sırayla** çalıştırın:

```bash
# 1. Proje klasörüne gidin
cd "/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje"

# 2. node_modules'i silin (eğer hata verirse, Finder'dan manuel silin)
rm -rf node_modules

# 3. package-lock.json'ı silin
rm -f package-lock.json

# 4. Dependencies'i yeniden yükleyin
npm install

# 5. Şifreyi değiştirin
node server/scripts/changePassword.js varefe@icloud.com "Efe*193123"
```

### Alternatif: Finder ile Silme

Eğer terminal komutları çalışmazsa:

1. **Finder'ı açın**
2. Proje klasörüne gidin: `/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje`
3. `node_modules` klasörünü **çöp kutusuna sürükleyin**
4. `package-lock.json` dosyasını **çöp kutusuna sürükleyin**
5. Terminal'de `npm install` çalıştırın
6. `node server/scripts/changePassword.js varefe@icloud.com "Efe*193123"` çalıştırın

### En Kolay Yöntem: Siteden Şifre Sıfırlama

1. Backend'i başlatın (eğer çalışmıyorsa):
   ```bash
   npm start
   ```

2. Frontend'i başlatın (başka bir terminal'de):
   ```bash
   npm run dev
   ```

3. Tarayıcıda şu sayfaya gidin:
   ```
   http://localhost:3000/forgot-password
   ```

4. E-posta adresinizi girin: `varefe@icloud.com`

5. "Şifre Sıfırlama Bağlantısı Gönder" butonuna tıklayın

6. Development modunda token ekranda görünecek

7. Token'a tıklayarak `/reset-password` sayfasına gidin

8. Yeni şifreyi girin: `Efe*193123`

9. Şifre tekrar: `Efe*193123`

10. "Şifreyi Sıfırla" butonuna tıklayın

### API ile Şifre Sıfırlama

Eğer backend çalışıyorsa:

**1. Şifre sıfırlama isteği:**
```bash
curl -X POST http://localhost:5001/api/user/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "varefe@icloud.com"}'
```

**2. Response'dan token'ı alın ve şifre sıfırlayın:**
```bash
curl -X POST http://localhost:5001/api/user/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "BURAYA_TOKEN_GELECEK",
    "newPassword": "Efe*193123"
  }'
```

## ✅ Başarılı Olursa

Şifre başarıyla değiştirildikten sonra:
- Yeni şifre: `Efe*193123`
- Bu şifre ile giriş yapabilirsiniz
