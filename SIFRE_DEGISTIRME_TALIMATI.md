# 🔐 Şifre Değiştirme Talimatı

## varefe@icloud.com için şifre: `Efe*193123`

### Adım 1: node_modules'i Düzelt

Terminal'de şu komutları çalıştırın:

```bash
cd "/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje"
rm -rf node_modules package-lock.json
npm install
```

### Adım 2: Şifreyi Değiştir

Terminal'de şu komutu çalıştırın:

```bash
node server/scripts/changePassword.js varefe@icloud.com "Efe*193123"
```

### Alternatif: API ile Şifre Değiştirme

Eğer kullanıcı zaten giriş yapmışsa, API endpoint'i kullanabilirsiniz:

**Endpoint:**
```
PUT /api/user/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "mevcut_şifre",
  "newPassword": "Efe*193123"
}
```

### Alternatif: Şifre Sıfırlama

Eğer mevcut şifreyi bilmiyorsanız:

1. **Şifre sıfırlama isteği gönder:**
```
POST /api/user/forgot-password
Content-Type: application/json

{
  "email": "varefe@icloud.com"
}
```

2. **Gelen token ile şifre sıfırla:**
```
POST /api/user/reset-password
Content-Type: application/json

{
  "token": "gelen_token",
  "newPassword": "Efe*193123"
}
```

## ⚠️ Şifre Kuralları

Şifre `Efe*193123` şu kurallara uyuyor:
- ✅ En az 8 karakter (10 karakter)
- ✅ Büyük harf (E)
- ✅ Küçük harf (fe)
- ✅ Rakam (193123)
- ✅ Özel karakter (*)

## 📝 Not

Script çalıştıktan sonra:
- Kullanıcı yeni şifre ile giriş yapabilir
- Şifre otomatik olarak hashlenir ve güvenli şekilde saklanır
