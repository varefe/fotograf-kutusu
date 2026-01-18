# 🎯 Render.com Dashboard - Görüntülü Talimat

## 📸 Adım Adım (Ekran Görüntüsü Olmadan)

### 1. Render.com Dashboard'a Git

1. https://render.com → Giriş yap
2. Dashboard'da **"fotograf-backend"** projesine tıkla

### 2. Settings Sekmesine Git

Sol menüden **"Settings"** sekmesine tıkla

### 3. General Bölümünde Root Directory'yi Bul

Aşağı kaydır, **"General"** bölümünü bul:

```
┌─────────────────────────────────────┐
│ General                            │
├─────────────────────────────────────┤
│ Name: fotograf-backend             │
│ Region: Frankfurt                  │
│ Branch: main                       │
│                                     │
│ Root Directory: [src]  ← BURASI!   │
│                                     │
│ Build Command: npm install          │
│ Start Command: node server/server.js│
└─────────────────────────────────────┘
```

### 4. Root Directory'yi Düzelt

**"Root Directory"** kutusunda `src` yazıyor olmalı.

**YAPILACAK:**
1. `src` yazısını **TAMAMEN SİL**
2. Kutu **BOŞ** kalmalı
3. Hiçbir şey yazma

### 5. Kaydet

1. Sayfanın altında **"Save Changes"** butonuna tıkla
2. Değişiklikler kaydedilecek

### 6. Deploy Et

1. Üst menüden **"Manual Deploy"** butonuna tıkla
2. **"Deploy latest commit"** seçeneğine tıkla
3. Deploy başlayacak

## ✅ Kontrol

Deploy başladığında **"Logs"** sekmesine git. Şunu görmelisin:

```
==> Running build command 'npm install'...
==> Installing dependencies...
```

Eğer hala `/opt/render/project/src/package.json` görüyorsan, Root Directory hala `src` demektir. Tekrar kontrol et.

## 🆘 Hala Çalışmıyorsa

1. **Settings** → **General** → **Root Directory** kutusuna tıkla
2. İçindeki her şeyi sil (Backspace veya Delete)
3. Kutu tamamen boş olmalı
4. **Save Changes** tıkla
5. Tekrar deploy et

---

**ÖNEMLİ:** Root Directory kutusu **TAMAMEN BOŞ** olmalı. `src`, `.`, `/` gibi hiçbir şey yazmamalı.






