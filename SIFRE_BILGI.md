# 🔐 Şifre Bilgisi

## ⚠️ ÖNEMLİ: Şifreler Geri Çözülemez

Şifreler güvenlik nedeniyle **bcrypt** ile hash'lenmiş olarak saklanır. Veritabanında sadece hash'lenmiş şifre var, orijinal şifre yok. Bu nedenle mevcut şifreyi göremiyoruz.

## 📧 varefe@icloud.com için Yeni Şifre

**Yeni şifre:** `Efe*193123`

Bu şifre şu kurallara uyuyor:
- ✅ En az 8 karakter (10 karakter)
- ✅ Büyük harf (E)
- ✅ Küçük harf (fe)
- ✅ Rakam (193123)
- ✅ Özel karakter (*)

## 🔧 Şifreyi Ayarlama Yöntemleri

### Yöntem 1: Siteden Şifre Sıfırlama (Önerilen)

1. **Şifremi Unuttum sayfasına gidin:**
   - URL: `http://localhost:3000/forgot-password`
   - Veya site üzerinden "Şifremi Unuttum" linkine tıklayın

2. **E-posta adresinizi girin:**
   - `varefe@icloud.com`

3. **Token alın:**
   - Development modunda token ekranda görünecek
   - Production'da e-posta ile gönderilecek

4. **Yeni şifreyi belirleyin:**
   - Token ile `/reset-password` sayfasına gidin
   - Yeni şifre: `Efe*193123`

### Yöntem 2: Script ile Direkt Ayarlama

**Adım 1: node_modules'i düzelt**
```bash
cd "/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje"
rm -rf node_modules package-lock.json
npm install
```

**Adım 2: Şifreyi değiştir**
```bash
node server/scripts/changePassword.js varefe@icloud.com "Efe*193123"
```

### Yöntem 3: API ile Şifre Sıfırlama

**1. Şifre sıfırlama isteği:**
```bash
curl -X POST http://localhost:5001/api/user/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "varefe@icloud.com"}'
```

**2. Gelen token ile şifre sıfırla:**
```bash
curl -X POST http://localhost:5001/api/user/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "GELEN_TOKEN",
    "newPassword": "Efe*193123"
  }'
```

## 📝 Not

- Mevcut şifreyi göremiyoruz (güvenlik nedeniyle)
- Şifreyi sıfırlamak için yukarıdaki yöntemlerden birini kullanın
- Yeni şifre: `Efe*193123`
