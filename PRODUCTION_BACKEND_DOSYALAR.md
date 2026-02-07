# Production Backend — Dosyalar Oradan Alınsın

Backend production’a (Railway) aktarıldığında, sitenin tüm API istekleri ve verileri **production backend** üzerinden gider; yani dosyalar/veriler oradan alınır.

## 1. Backend’i production’a aktarma (Railway)

- Proje kökündeki **`server/`** klasörü ve **`package.json`** Railway’e deploy edilir.
- Railway’de:
  - **Root Directory:** Proje kökü (server’ın bir üstü) veya sadece backend ise `server` olarak ayarlanabilir; başlangıç komutu `node server/server.js` veya `npm start` olmalı.
  - **Environment Variables:** `env-production-template.txt` içindeki değişkenleri ekleyin. `BACKEND_URL` = Railway’in verdiği backend URL (örn. `https://xxx.up.railway.app`).

Deploy sonrası Railway size bir URL verir (örn. `https://heartfelt-embrace-production-8a92.up.railway.app`). Bu adres **production backend** adresinizdir.

## 2. Frontend’in production backend’i kullanması

- **Kod tarafı:** `src/config/api.js` içinde production ortamında (localhost değilken) API adresi otomatik olarak production backend URL’ine ayarlı. Yani frontend build’i production’da açıldığında tüm istekler (sipariş, ödeme, kullanıcı, galeri vb.) **production backend’e** gider; veriler/dosyalar oradan alınır.
- **İsteğe bağlı:** Backend URL’ini build sırasında kendiniz vermek isterseniz:
  - Build komutundan önce:  
    `VITE_API_URL=https://SIZIN-RAILWAY-BACKEND-URL.up.railway.app`
  - Örnek:  
    `VITE_API_URL=https://heartfelt-embrace-production-8a92.up.railway.app npm run build`  
  Böylece build’e giren tek API adresi bu URL olur; canlı sitede tüm veriler yine production backend’den alınır.

## 3. Özet

| Nerede        | Ne yapılır |
|---------------|------------|
| **Railway**   | Backend (server) deploy edilir; `BACKEND_URL` = Railway backend URL. |
| **Frontend**  | Production’da açıldığında `api.js` sayesinde API adresi = production backend; **tüm dosyalar/veriler oradan alınır.** |
| **Build**     | İsterseniz `VITE_API_URL` ile aynı backend URL’i sabitlenir. |

Sonuç: Backend dosyalarını production’a (Railway) aktardığınızda, frontend production’da çalışırken tüm API ve veri istekleri production backend’e gider; yani **dosyalar/veriler production’dan alınır.**
