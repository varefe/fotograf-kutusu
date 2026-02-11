# Domain'e (fotografkutusu.com) Yükleme Rehberi

## Ön koşullar

- **Backend** Railway'de çalışıyor: `https://heartfelt-embrace-production-8a92.up.railway.app`
- **Frontend** sadece statik dosyalar; domain'deki hosting’e (cPanel/FTP) yüklenecek.

---

## Adım 1: Build al

Production API URL’i ile build al (domain’deki site bu backend’i kullanacak):

```bash
VITE_API_URL=https://heartfelt-embrace-production-8a92.up.railway.app npm run build:full
```

- `build:full` hem `dist/` oluşturur hem `.htaccess`’i `dist/` içine kopyalar.
- `dist/` yoksa veya eskiyse yükleme doğru çalışmaz.

---

## Adım 2: Yükleme yöntemi seç

### A) FTP ile (curl script)

1. Şifre özel karakter içeriyorsa (`}`, `$`, `!` vb.) script’te tırnakları kontrol et veya aşağıdaki gibi ortam değişkeni kullan:

```bash
export FTP_USER="pfotogex"
export FTP_PASS="SIFRENIZ"
export FTP_HOST="fotografkutusu.com"
./upload_curl.sh
```

2. Script’te şifre kullanacaksan: `upload_curl.sh` içinde `USER` ve `PASS` değişkenlerini düzenle, sonra:

```bash
chmod +x upload_curl.sh
./upload_curl.sh
```

### B) cPanel File Manager (manuel)

1. `VITE_API_URL=... npm run build:full` ile build al.
2. cPanel → **File Manager** → `public_html`.
3. `dist` içeriğini zip’le: `cd dist && zip -r ../domain-deploy.zip .`
4. cPanel’de **Upload** ile `domain-deploy.zip` yükle.
5. `public_html` içinde zip’e sağ tık → **Extract**; dosyalar köke çıksın (index.html `public_html` içinde olmalı).

### C) SFTP (FileZilla / Terminal)

- **Host:** fotografkutusu.com  
- **Port:** 22 (SFTP) veya hosting’in verdiği port  
- **Kullanıcı:** FTP kullanıcı adın  
- **Şifre:** FTP şifren  
- **Uzak klasör:** `public_html`  
- **Yükle:** `dist/` içindeki **tüm dosya ve klasörler** (index.html, assets/, .htaccess vb.) `public_html` içine.

---

## Sık karşılaşılan hatalar

| Hata / Durum | Çözüm |
|--------------|--------|
| `dist/ bulunamadı` | Önce `npm run build:full` çalıştır. |
| `Connection refused` / timeout | Hosting’de FTP/SFTP açık mı kontrol et; bazen port 21 kapalı olur, 22 (SFTP) veya 2082 (cPanel) dene. |
| `530 Login incorrect` | Kullanıcı adı/şifre yanlış; cPanel’deki FTP kullanıcısı ve şifresini kullan. |
| Şifrede `}`, `$`, `!` var | Script’te şifreyi tek tırnak içinde yaz veya `export FTP_PASS='...'` ile ver. |
| Sayfa açılıyor ama API çağrıları 404 | Build’i `VITE_API_URL=https://heartfelt-embrace-production-8a92.up.railway.app` ile aldığından emin ol; sonra tekrar yükle. |
| Beyaz sayfa / route’lar 404 | `.htaccess` mutlaka `public_html` içinde olmalı; `build:full` kullandıysan `dist/` ile birlikte gelir. |

---

## Kontrol listesi

- [ ] `npm run build:full` çalıştırıldı.
- [ ] `dist/index.html` ve `dist/assets/` var.
- [ ] `dist/.htaccess` var.
- [ ] FTP bilgileri doğru (cPanel’deki kullanıcı/şifre).
- [ ] Yükleme sonrası `https://fotografkutusu.com` açılıyor.
- [ ] Giriş / sipariş gibi işlemler çalışıyor (backend Railway’de).

Bu rehber, domain’e yükleyememe sorununu adım adım çözmek içindir. Belirli bir hata mesajı alıyorsan onu da not edersen daha net yönlendirme yapılabilir.
