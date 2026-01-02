import express from 'express';
import Iyzipay from 'iyzipay';
import { connectDB } from '../config/database.js';
import dotenv from 'dotenv';
import https from 'https';

// .env dosyasını zorla yükle
dotenv.config();

const router = express.Router();

// Font dosyalarını proxy üzerinden servis et
router.get('/fonts/MarkPro/:filename', (req, res) => {
  const filename = req.params.filename;
  const fontUrl = `https://static.iyzipay.com/fonts/MarkPro/${filename}`;
  
  console.log(`🔍 Font proxy isteği: ${filename}`);
  
  // CORS header'larını ekle
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 saat
  
  // OPTIONS request için
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Font dosyasını proxy üzerinden indir ve gönder
  https.get(fontUrl, (proxyRes) => {
    console.log(`📥 Font proxy response: ${proxyRes.statusCode} for ${filename}`);
    
    if (proxyRes.statusCode === 200) {
      // Content-Type'ı doğru ayarla
      const contentType = proxyRes.headers['content-type'] || 
                        (filename.endsWith('.woff2') ? 'font/woff2' : 
                         filename.endsWith('.woff') ? 'font/woff' : 'application/octet-stream');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 yıl cache
      proxyRes.pipe(res);
    } else {
      console.warn(`⚠️ Font dosyası bulunamadı: ${filename} (${proxyRes.statusCode})`);
      // Boş bir font dosyası döndür (CORS hatasını önlemek için)
      res.setHeader('Content-Type', 'font/woff2');
      res.status(200).send('');
    }
  }).on('error', (err) => {
    console.error('❌ Font proxy hatası:', err.message);
    // Hata durumunda boş response döndür (CORS hatasını önlemek için)
    res.setHeader('Content-Type', 'font/woff2');
    res.status(200).send('');
  });
});

// Iyzipay yapılandırması
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZIPAY_API_KEY,
  secretKey: process.env.IYZIPAY_SECRET_KEY,
  uri: process.env.IYZIPAY_URI || 'https://api.iyzipay.com'
});

// Yapılandırma kontrolü logu
console.log('🚀 Iyzico Başlatıldı:', {
  uri: process.env.IYZIPAY_URI,
  keyExists: !!process.env.IYZIPAY_API_KEY,
  secretExists: !!process.env.IYZIPAY_SECRET_KEY
});

router.post('/create', async (req, res) => {
  try {
    const { orderId, orderData } = req.body;

    if (!orderId || !orderData) {
      return res.status(400).json({ success: false, error: 'Sipariş bilgileri eksik' });
    }

    const price = parseFloat(orderData.price).toFixed(2);
    
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: `ORDER-${orderId}`,
      price: price,
      paidPrice: price,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: `BASKET-${orderId}`,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${process.env.FRONTEND_URL || 'https://fotografkutusu.com'}/api/payment/callback`,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: 'BY' + Date.now(),
        name: orderData.customerInfo?.firstName || 'Musteri',
        surname: orderData.customerInfo?.lastName || 'Musteri',
        gsmNumber: orderData.customerInfo?.phone || '+905000000000',
        email: orderData.customerInfo?.email || 'test@test.com',
        identityNumber: '11111111111',
        lastLoginDate: '2023-01-01 00:00:00',
        registrationDate: '2023-01-01 00:00:00',
        registrationAddress: orderData.customerInfo?.address || 'Istanbul',
        ip: req.ip || '127.0.0.1',
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34000'
      },
      shippingAddress: {
        contactName: (orderData.customerInfo?.firstName + ' ' + orderData.customerInfo?.lastName) || 'Musteri',
        city: 'Istanbul',
        country: 'Turkey',
        address: orderData.customerInfo?.address || 'Istanbul',
        zipCode: '34000'
      },
      billingAddress: {
        contactName: (orderData.customerInfo?.firstName + ' ' + orderData.customerInfo?.lastName) || 'Musteri',
        city: 'Istanbul',
        country: 'Turkey',
        address: orderData.customerInfo?.address || 'Istanbul',
        zipCode: '34000'
      },
      basketItems: [
        {
          id: 'ITEM-' + orderId,
          name: 'Fotograf Baski Hizmeti',
          category1: 'Gorsel Sanatlar',
          itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
          price: price
        }
      ]
    };

    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
      if (err) {
        console.error('❌ Iyzico Connection Error:', err);
        return res.status(500).json({ success: false, error: 'Iyzico baglanti hatasi' });
      }
      
      if (result.status === 'success') {
        // Font URL'lerini kendi sunucudan servis edecek şekilde değiştir
        let checkoutFormContent = result.checkoutFormContent;
        
        // Development veya production için doğru URL'i belirle
        let baseUrl = process.env.FRONTEND_URL || 'https://fotografkutusu.com';
        
        // Request'in geldiği origin'i kontrol et
        const origin = req.headers.origin || req.headers.referer || '';
        const host = req.headers.host || '';
        
        // Production domain kontrolü
        if (origin && (origin.includes('fotografkutusu.com') || origin.includes('https://'))) {
          // Production domain'den geliyorsa, origin'i kullan
          baseUrl = origin.replace(/\/$/, '');
        } else if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
          // Production host'undan geliyorsa, host'u kullan
          const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
          baseUrl = `${protocol}://${host}`;
        } else if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
          // Development'tan geliyorsa
          baseUrl = origin.replace(/\/$/, '') || 'http://localhost:3000';
        }
        
        // Base URL'i temizle ve font proxy URL'ini oluştur
        baseUrl = baseUrl.replace(/\/$/, ''); // Trailing slash'i kaldır
        const fontProxyUrl = `${baseUrl}/api/payment/fonts/MarkPro`;
        
        console.log('🌐 Production URL tespiti:', {
          origin,
          host,
          baseUrl,
          fontProxyUrl,
          frontendUrl: process.env.FRONTEND_URL
        });
        
        console.log('🔍 Font URL değiştirme başlatılıyor...');
        console.log('📍 Base URL:', baseUrl);
        console.log('📍 Font Proxy URL:', fontProxyUrl);
        console.log('📄 Checkout form içeriği uzunluğu:', checkoutFormContent.length);
        console.log('🔍 İçerikte "static.iyzipay.com" var mı?', checkoutFormContent.includes('static.iyzipay.com'));
        console.log('🔍 İçerikte "fonts/MarkPro" var mı?', checkoutFormContent.includes('fonts/MarkPro'));
        
        // İlk 1000 karakteri logla (debug için)
        if (checkoutFormContent.length > 0) {
          const preview = checkoutFormContent.substring(0, 1000);
          console.log('📋 İçerik önizleme (ilk 1000 karakter):', preview);
        }
        
        // Tüm olası formatları yakala - çok daha agresif regex
        const fontUrlPatterns = [
          // Standart URL formatları
          /https?:\/\/static\.iyzipay\.com\/fonts\/MarkPro\/([^"'\s\)<>]+)/gi,
          // CSS url() formatları
          /url\(['"]?https?:\/\/static\.iyzipay\.com\/fonts\/MarkPro\/([^"'\s\)]+)['"]?\)/gi,
          // src attribute formatları
          /src=['"]https?:\/\/static\.iyzipay\.com\/fonts\/MarkPro\/([^"']+)['"]/gi,
          // href attribute formatları
          /href=['"]https?:\/\/static\.iyzipay\.com\/fonts\/MarkPro\/([^"']+)['"]/gi,
        ];
        
        let replacementCount = 0;
        fontUrlPatterns.forEach((pattern, index) => {
          const matches = checkoutFormContent.match(pattern);
          if (matches) {
            console.log(`✅ Pattern ${index + 1} eşleşme bulundu:`, matches.length, 'adet');
            replacementCount += matches.length;
          }
          
          checkoutFormContent = checkoutFormContent.replace(pattern, (match, filename) => {
            if (match.includes('url(')) {
              return `url('${fontProxyUrl}/${filename}')`;
            } else if (match.includes('src=') || match.includes('href=')) {
              return match.replace(/https?:\/\/static\.iyzipay\.com\/fonts\/MarkPro\/[^"']+/, `${fontProxyUrl}/${filename}`);
            } else {
              return `${fontProxyUrl}/${filename}`;
            }
          });
        });
        
        console.log(`✅ Toplam ${replacementCount} font URL'i değiştirildi`);
        
        // Son kontrol - hala static.iyzipay.com var mı?
        if (checkoutFormContent.includes('static.iyzipay.com/fonts')) {
          console.warn('⚠️ Hala static.iyzipay.com font URL\'leri bulundu!');
          // Son bir deneme - her şeyi değiştir (daha agresif)
          checkoutFormContent = checkoutFormContent.replace(
            /static\.iyzipay\.com\/fonts\/MarkPro\/([^"'\s\)<>]+)/gi,
            `${baseUrl}/api/payment/fonts/MarkPro/$1`
          );
          
          // Eğer hala varsa, CSS içindeki @font-face kurallarını da değiştir
          checkoutFormContent = checkoutFormContent.replace(
            /@font-face\s*\{[^}]*url\(['"]?https?:\/\/static\.iyzipay\.com\/fonts\/MarkPro\/([^"'\s\)]+)['"]?\)[^}]*\}/gi,
            (match, filename) => {
              return match.replace(
                /https?:\/\/static\.iyzipay\.com\/fonts\/MarkPro\/[^"'\s\)]+/gi,
                `${baseUrl}/api/payment/fonts/MarkPro/${filename}`
              );
            }
          );
        }
        
        // İçeriğe font yükleme engelleme script'i ekle
        const fontBlockScript = `
          <script>
            (function() {
              // Font yüklemelerini engelle
              const originalFetch = window.fetch;
              window.fetch = function(...args) {
                if (args[0] && args[0].includes && args[0].includes('static.iyzipay.com/fonts')) {
                  console.log('🚫 Font yükleme engellendi:', args[0]);
                  return Promise.reject(new Error('Font loading blocked'));
                }
                return originalFetch.apply(this, args);
              };
              
              // Link tag'lerindeki font yüklemelerini engelle
              const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                  mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                      if (node.tagName === 'LINK' && node.href && node.href.includes('static.iyzipay.com/fonts')) {
                        console.log('🚫 Font link engellendi:', node.href);
                        node.remove();
                      }
                    }
                  });
                });
              });
              
              observer.observe(document.head, { childList: true, subtree: true });
              observer.observe(document.body, { childList: true, subtree: true });
            })();
          </script>
        `;
        
        // Script'i checkout form içeriğine ekle
        if (checkoutFormContent.includes('</head>')) {
          checkoutFormContent = checkoutFormContent.replace('</head>', fontBlockScript + '</head>');
        } else if (checkoutFormContent.includes('<body')) {
          checkoutFormContent = checkoutFormContent.replace('<body', fontBlockScript + '<body');
        } else {
          checkoutFormContent = fontBlockScript + checkoutFormContent;
        }
        
        console.log('✅ Checkout form içeriği hazırlandı');
        
        res.json({
          success: true,
          checkoutFormContent: checkoutFormContent,
          token: result.token
        });
      } else {
        console.error('❌ Iyzico Logic Error:', result.errorMessage);
        res.status(400).json({ success: false, error: result.errorMessage, errorCode: result.errorCode });
      }
    });
  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({ success: false, error: 'Sunucu hatasi' });
  }
});

router.post('/callback', async (req, res) => {
  const { token } = req.body;
  res.redirect(`${process.env.FRONTEND_URL || 'https://fotografkutusu.com'}/payment/success?token=${token}`);
});

export default router;
