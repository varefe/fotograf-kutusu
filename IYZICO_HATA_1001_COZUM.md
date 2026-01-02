# iyzico ErrorCode 1001 Çözümü

## Hata
```
error: 'api bilgileri bulunamadı'
errorCode: '1001'
```

## Sorun
iyzico API key'leri yanlış, geçersiz veya URI ile uyumsuz.

## Çözüm Adımları

### 1. API Key'leri Kontrol Edin

Backend log'larında şunu görmelisiniz:
```
🔑 iyzico Yapılandırması: {
  apiKey: 'TZY4COlRiQ...',
  secretKey: 'VAR',
  uri: 'https://sandbox-api.iyzipay.com'
}
```

**Eğer "YOK!" görüyorsanız:**
- `.env` dosyasını kontrol edin
- Backend sunucusunu yeniden başlatın

### 2. Key ve URI Uyumunu Kontrol Edin

**Sandbox (Test) Ortamı:**
- URI: `https://sandbox-api.iyzipay.com`
- API Key: Sandbox key'leri genellikle "sandbox-" ile başlar
- Secret Key: Sandbox secret key

**Production (Canlı) Ortamı:**
- URI: `https://api.iyzipay.com`
- API Key: Production key'leri (genellikle "sandbox-" içermez)
- Secret Key: Production secret key

### 3. Şu Anki Durumunuz

`.env` dosyanızda:
```
IYZIPAY_API_KEY=TZY4COlRiQDLL7ERFUK5FzGW3rNBDLio
IYZIPAY_SECRET_KEY=Eu1eRgVCgE3EKU90DpoKZdgiRNsIDZXN
IYZIPAY_URI=https://sandbox-api.iyzipay.com
```

**Sorun:** API key'ler production key'leri gibi görünüyor ama sandbox URI kullanılıyor.

### 4. Çözüm

**Seçenek 1: Sandbox Key'leri Kullanın**
```env
IYZIPAY_API_KEY=sandbox-api-key-buraya
IYZIPAY_SECRET_KEY=sandbox-secret-key-buraya
IYZIPAY_URI=https://sandbox-api.iyzipay.com
```

**Seçenek 2: Production Key'leri ile Production URI Kullanın**
```env
IYZIPAY_API_KEY=TZY4COlRiQDLL7ERFUK5FzGW3rNBDLio
IYZIPAY_SECRET_KEY=Eu1eRgVCgE3EKU90DpoKZdgiRNsIDZXN
IYZIPAY_URI=https://api.iyzipay.com
```

### 5. iyzico Dashboard Kontrolü

1. [iyzico Dashboard](https://merchant.iyzipay.com/)'a giriş yapın
2. API Bilgileri bölümüne gidin
3. Key'lerin aktif olduğundan emin olun
4. Sandbox/Production ortamını kontrol edin

### 6. Test

Backend sunucusunu yeniden başlatın:
```bash
npm run dev:server
```

Backend log'larında şunları kontrol edin:
- `🔑 iyzico Yapılandırması:` - Key'ler yükleniyor mu?
- `🔍 Iyzipay Response:` - iyzico'dan ne dönüyor?

## Hala Sorun Varsa

1. iyzico destek ekibiyle iletişime geçin
2. Key'lerin aktif olduğundan emin olun
3. Hesap kısıtlamalarını kontrol edin


