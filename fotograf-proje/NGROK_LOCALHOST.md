# Ngrok ile Localhost Backend (Geçici Çözüm)

## 🆓 Tamamen Ücretsiz - 5 Dakika

Localhost'ta backend çalıştırıp ngrok ile dışarıya açabilirsiniz.

### 1. Ngrok Kur

```bash
# macOS
brew install ngrok

# Veya direkt indir: https://ngrok.com/download
```

### 2. Ngrok'a Kaydol (Ücretsiz)

1. https://ngrok.com → Sign up (ücretsiz)
2. Auth token'ı al
3. Terminal'de:
```bash
ngrok config add-authtoken YOUR_TOKEN
```

### 3. Backend'i Başlat

```bash
cd "/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje"
npm run server
```

### 4. Ngrok Tunnel Aç

Yeni bir terminal'de:
```bash
ngrok http 5000
```

Ngrok bir URL verecek: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`

### 5. Frontend'i Güncelle

Ngrok URL'ini bana ver, frontend'i ona bağlayayım.

## ⚠️ Önemli Notlar

- **Geçici:** Ngrok URL'i her başlatmada değişir (ücretsiz planda)
- **Sınırlı:** Ücretsiz planda bazı limitler var
- **Test için:** Sadece test için kullanın, production için Render/Fly.io daha iyi

---

**Maliyet:** Tamamen ücretsiz
**Süre:** ~5 dakika
**Kullanım:** Test için ideal

