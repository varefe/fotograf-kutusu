# Admin Giriş Sistemi

## Varsayılan Giriş Bilgileri

**Kullanıcı Adı:** `admin`  
**Şifre:** `admin123`

⚠️ **ÖNEMLİ:** Production ortamında mutlaka şifreyi değiştirin!

## Şifre Değiştirme

### Yöntem 1: Environment Variables (Önerilen)

1. Proje kök dizininde `.env` dosyası oluşturun (yoksa)
2. Şu satırları ekleyin:

```env
VITE_ADMIN_USERNAME=your_username
VITE_ADMIN_PASSWORD=your_secure_password
```

3. Projeyi yeniden build edin:
```bash
npm run build:full
```

### Yöntem 2: Kod İçinde Değiştirme

`src/pages/AdminLogin.jsx` dosyasında şu satırları bulun:

```javascript
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
```

`'admin'` ve `'admin123'` değerlerini istediğiniz kullanıcı adı ve şifre ile değiştirin.

## Giriş Sayfası

Admin paneline erişmek için:
- URL: `/admin/login`
- Veya direkt `/admin` adresine gittiğinizde otomatik olarak login sayfasına yönlendirilirsiniz

## Güvenlik Özellikleri

1. **Session Storage:** Giriş bilgileri tarayıcı session'ında saklanır
2. **Otomatik Çıkış:** 8 saat sonra otomatik olarak çıkış yapılır
3. **Sayfa Yenileme:** Sayfa yenilendiğinde giriş durumu korunur
4. **Çıkış Butonu:** Admin panelinde "Çıkış Yap" butonu ile manuel çıkış yapabilirsiniz

## Notlar

- `.env` dosyasını `.gitignore`'a ekleyin (zaten ekli)
- Production'da mutlaka güçlü bir şifre kullanın
- Şifreyi düzenli olarak değiştirin
- Giriş bilgilerini kimseyle paylaşmayın
