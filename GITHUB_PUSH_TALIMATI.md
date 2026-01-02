# GitHub'a Push Talimatı

## 🚀 Adım Adım

### 1. GitHub'da Yeni Repository Oluştur

1. https://github.com adresine git
2. Sağ üstte **"+"** → **"New repository"**
3. Repository adı: `fotograf-proje` (veya istediğin isim)
4. **Public** veya **Private** seç
5. **"Create repository"** tıkla

### 2. Repository URL'ini Kopyala

GitHub'da oluşturduğun repository'nin sayfasında:
- **"Code"** butonuna tıkla
- URL'i kopyala: `https://github.com/KULLANICIADI/fotograf-proje.git`

### 3. Terminal'de Push Et

```bash
cd "/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje"

# Remote ekle (URL'i kendi repository URL'inle değiştir)
git remote add origin https://github.com/KULLANICIADI/fotograf-proje.git

# Push et
git push -u origin main
```

### 4. GitHub Kullanıcı Adı/Şifre İsterse

Eğer GitHub kullanıcı adı/şifre isterse:
- Kullanıcı adını gir
- Şifre yerine **Personal Access Token** kullan (GitHub Settings → Developer settings → Personal access tokens)

## ✅ Tamamlandı!

Repository GitHub'da görünür olacak. Render.com'da bu repository'yi seçebilirsin.

---

**Not:** Eğer repository zaten varsa, sadece `git remote add origin` ve `git push` komutlarını çalıştır.

