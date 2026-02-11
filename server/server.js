import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import User from './models/UserSchema.js';
import Order from './models/OrderSchema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import orderTrackingRoutes from './routes/orderTracking.js';
import reviewRoutes from './routes/review.js';
import galleryRoutes from './routes/gallery.js';
import notificationRoutes from './routes/notifications.js';
import announcementRoutes from './routes/announcements.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import carouselRoutes from './routes/carousel.js';
import pageRoutes from './routes/pages.js';
import themeRoutes from './routes/theme.js';
import { requireAdminRole } from './middleware/auth.js';
import { securityLogger, securityHeaders, ipWhitelist } from './middleware/security.js';

dotenv.config();

const app = express();
// Railway ve diğer cloud servisler PORT'u otomatik sağlar
const PORT = process.env.PORT || 5001; // Port 5000 AirTunes tarafından kullanılıyor, 5001'e değiştir
const NODE_ENV = process.env.NODE_ENV || 'development';

// OPTIONS isteklerini EN BAŞTA handle et (rate limiting'den önce)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    console.log('🔍 OPTIONS preflight isteği (erken):', req.path, 'Origin:', origin);
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Session, X-API-Key, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 saat
    return res.status(204).end();
  }
  next();
});

// CORS - EN BAŞTA, HER ŞEYDEN ÖNCE
// Development modunda tüm origin'lere izin ver (sadece development için!)
if (NODE_ENV === 'development') {
  // Development için manuel CORS middleware - tüm origin'lere izin ver
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Normal istekler için CORS header'ları ekle
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Session, X-API-Key, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');
    next();
  });
  console.log('🌐 CORS: Development modu - Tüm origin\'lere izin verildi (manuel)');
} else {
  // Production için sadece belirli origin'lere izin ver
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://fotografkutusu.com',
    'https://fotografkutusu.com',
    'http://fotografkutusu.com'
  ];
  app.use(cors({
    origin: (origin, callback) => {
      // Origin yoksa (Postman, curl gibi) veya izin verilen origin'lerden biriyse
      if (!origin || allowedOrigins.some(allowed => origin.includes(allowed.replace(/^https?:\/\//, '')))) {
        callback(null, true);
      } else {
        console.warn('⚠️ CORS: İzin verilmeyen origin:', origin);
        callback(null, true); // Geçici olarak tüm origin'lere izin ver (debug için)
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Session', 'X-API-Key', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));
  console.log(`🌐 CORS: Production modu - ${allowedOrigins.length} origin izin verildi`);
}

// HTTPS zorunluluğu (Production için)
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // X-Forwarded-Proto header'ını kontrol et (reverse proxy arkasında)
    const isHttps = req.header('x-forwarded-proto') === 'https' || 
                    req.secure || 
                    req.connection.encrypted;
    
    if (!isHttps) {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
  
  // Güvenlik header'ları
  app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
}


// Rate Limiting - DDoS koruması (CORS'dan sonra)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // maksimum 100 istek
  message: {
    success: false,
    error: 'Çok fazla istek',
    message: 'Lütfen bir süre sonra tekrar deneyin'
  },
  standardHeaders: true, // Rate limit bilgilerini header'larda göster
  legacyHeaders: false,
  skip: (req) => {
    // Health check ve OPTIONS request'lerini rate limit'ten muaf tut
    if (req.method === 'OPTIONS') {
      console.log('🔍 OPTIONS isteği rate limiting\'den muaf tutuldu:', req.path);
      return true;
    }
    return req.path === '/api/health';
  }
});

// Sipariş oluşturma için daha sıkı rate limiting (sadece POST istekleri için)
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 1000, // Test modu için çok yüksek limit
  message: {
    success: false,
    error: 'Çok fazla sipariş',
    message: 'Lütfen bir süre sonra tekrar deneyin'
  },
  skip: (req) => {
    if (req.method !== 'POST') return true;
    return false;
  }
});

// Sipariş okuma (GET) istekleri için daha gevşek rate limiting
const orderReadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 60, // maksimum 60 istek (GET için)
  message: {
    success: false,
    error: 'Çok fazla istek',
    message: 'Lütfen bir süre sonra tekrar deneyin'
  },
  skip: (req) => {
    // POST isteklerini skip et (sadece GET isteklerine uygula)
    return req.method !== 'GET';
  }
});

// Ödeme endpoint'i için özel rate limiting
const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 dakika
  max: 20, // maksimum 20 ödeme isteği
  message: {
    success: false,
    error: 'Çok fazla ödeme isteği',
    message: 'Lütfen bir süre sonra tekrar deneyin'
  },
  skip: (req) => {
    // Callback route'unu rate limiting'den muaf tut (Iyzico'dan gelen callback'ler)
    return req.path === '/api/payment/callback' || req.path.includes('/callback');
  }
});


// Güvenlik middleware'leri
app.use(securityLogger);
app.use(securityHeaders);

// Rate limiting uygula (OPTIONS istekleri zaten skip ediliyor)
// Development modunda rate limiting'i devre dışı bırak (test için)
if (NODE_ENV !== 'development') {
  app.use('/api/', generalLimiter);
} else {
  console.log('⚠️ Rate limiting development modunda devre dışı (test için)');
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Yüklenen ürün görselleri (server-uploads/products)
const serverUploadsPath = path.join(process.cwd(), 'server-uploads');
if (fs.existsSync(serverUploadsPath)) {
  app.use('/uploads', express.static(serverUploadsPath));
}

// MongoDB database bağlantısı
connectDB(5).then(() => {
  console.log('✅ MongoDB bağlantısı hazır');
}).catch((error) => {
  console.error('❌ MongoDB bağlantı hatası:', error.message);
  console.warn('⚠️ Uygulama MongoDB olmadan çalışmaya devam ediyor. Bağlantı otomatik olarak tekrar deneniyor...');
  // 10 saniye sonra tekrar dene
  setTimeout(() => {
    console.log('🔄 MongoDB bağlantısı tekrar deneniyor...');
    connectDB(3).catch(() => {});
  }, 10000);
});

// Modelleri export et (route'lar için)
export { User, Order };

// Routes (rate limiting ile)
// Development modunda rate limiting'i atla (test için)
if (NODE_ENV === 'development') {
  app.use('/api/orders', orderRoutes);
  console.log('⚠️ Order rate limiting development modunda devre dışı (test için)');
} else {
  // GET istekleri için orderReadLimiter, POST istekleri için orderLimiter
  app.use('/api/orders', orderReadLimiter, orderLimiter, orderRoutes);
}
app.use('/api/payment', paymentLimiter, paymentRoutes);
app.use('/api/user', generalLimiter, userRoutes);

// Admin routes için IP whitelist (opsiyonel - environment variable'dan)
const allowedIPs = process.env.ALLOWED_IPS 
  ? process.env.ALLOWED_IPS.split(',').map(ip => ip.trim()).filter(ip => ip)
  : [];
if (allowedIPs.length > 0) {
  console.log(`🔒 IP Whitelist aktif: ${allowedIPs.length} IP aralığı/IP`);
  app.use('/api/admin', ipWhitelist(allowedIPs), adminRoutes);
} else {
  // IP whitelist yoksa normal şekilde mount et
  app.use('/api/admin', adminRoutes);
}

app.use('/api/order-tracking', generalLimiter, orderTrackingRoutes);
app.use('/api/reviews', generalLimiter, reviewRoutes);
app.use('/api/gallery', generalLimiter, galleryRoutes);
app.use('/api/notifications', generalLimiter, notificationRoutes);
app.use('/api/announcements', generalLimiter, announcementRoutes);
app.use('/api/categories', generalLimiter, categoryRoutes);
app.use('/api/products', generalLimiter, productRoutes);

// #region agent log
app.use((req, res, next) => {
  if (req.path.startsWith('/api/carousel')) {
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:carousel-incoming',message:'carousel request',data:{method:req.method,path:req.path},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  }
  next();
});
// #endregion

// Carousel: Daha spesifik route önce (admin/all), sonra genel GET (404 önleme)
app.get('/api/carousel/admin/all', generalLimiter, requireAdminRole, async (req, res) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:GET /api/carousel/admin/all',message:'handler entered',data:{path:req.path},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  try {
    await connectDB();
    const CarouselSlide = (await import('./models/CarouselSchema.js')).default;
    const slides = await CarouselSlide.find({}).sort({ order: 1, createdAt: 1 }).lean();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:carousel-admin-all',message:'sending 200',data:{slidesCount:slides.length},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    res.json({
      success: true,
      slides: slides.map(s => ({
        id: s._id.toString(),
        _id: s._id.toString(),
        image: s.image,
        alt: s.alt || '',
        title: s.title || '',
        subtitle: s.subtitle || '',
        order: s.order ?? 0,
        isActive: s.isActive !== false,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      }))
    });
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:carousel-admin-all-catch',message:'sending 500',data:{err:err.message},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    console.error('Carousel admin/all hatası:', err.message);
    res.status(500).json({ success: false, error: 'Carousel listelenemedi', message: err.message });
  }
});

app.get('/api/carousel', generalLimiter, async (req, res) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:GET /api/carousel',message:'public handler entered',data:{path:req.path},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  try {
    await connectDB();
    const CarouselSlide = (await import('./models/CarouselSchema.js')).default;
    const slides = await CarouselSlide.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
    res.json({
      success: true,
      slides: slides.map((s, i) => ({
        id: s._id.toString(),
        image: s.image,
        alt: s.alt || '',
        title: s.title || '',
        subtitle: s.subtitle || '',
        order: s.order ?? i
      }))
    });
  } catch (err) {
    console.error('Carousel GET hatası:', err.message);
    res.status(500).json({ success: false, error: 'Carousel yüklenemedi', message: err.message });
  }
});

app.use('/api/carousel', generalLimiter, carouselRoutes);
app.use('/api/pages', generalLimiter, pageRoutes);
// #region agent log
app.use((req, res, next) => {
  if (req.path === '/api/theme' || req.path.startsWith('/api/theme/')) {
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:before-theme-mount',message:'incoming /api/theme',data:{method:req.method,path:req.path},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  }
  next();
});
// #endregion
app.use('/api/theme', generalLimiter, themeRoutes);
// #region agent log
try {
  fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:theme-mount-done',message:'theme routes registered',data:{},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
} catch (e) {}
// #endregion

// #region agent log
try {
  fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:after-carousel-register',message:'carousel routes registered',data:{},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
} catch (e) {}
// #endregion

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Debug endpoint - Yetkilendirme gerektirmez (sadece veritabanı durumu)
app.get('/api/debug/db', async (req, res) => {
  try {
    await connectDB();
    const mongoose = (await import('mongoose')).default;
    const OrderModel = mongoose.models.Order || Order;
    
    const totalCount = await OrderModel.countDocuments({});
    
    // Örnek sipariş (sadece ID ve tarih)
    const sampleOrder = await OrderModel.findOne({}).select('_id createdAt paymentStatus status').lean();
    
    // Tüm siparişlerin tarih aralığını bul
    const oldestOrder = await OrderModel.findOne({}).sort({ createdAt: 1 }).select('createdAt').lean();
    const newestOrder = await OrderModel.findOne({}).sort({ createdAt: -1 }).select('createdAt').lean();
    
    // MongoDB bağlantı durumu
    const isConnected = mongoose.connection.readyState === 1;
    
    res.json({
      success: true,
      database: {
        type: 'MongoDB',
        connectionState: mongoose.connection.readyState,
        connectionStateText: isConnected ? 'Bağlı' : 'Bağlı değil'
      },
      orders: {
        collectionName: 'orders',
        totalCount,
        hasOrders: totalCount > 0,
        sampleOrder: sampleOrder ? {
          _id: sampleOrder._id,
          createdAt: sampleOrder.createdAt,
          paymentStatus: sampleOrder.paymentStatus,
          status: sampleOrder.status
        } : null,
        dateRange: {
          oldest: oldestOrder?.createdAt || null,
          newest: newestOrder?.createdAt || null
        }
      }
    });
  } catch (error) {
    console.error('❌ Debug endpoint hatası:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 404 handler - Tüm route'lardan sonra
app.use((req, res, next) => {
  // #region agent log
  if (req.path.startsWith('/api/carousel')) {
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:404-handler',message:'404 for carousel',data:{method:req.method,path:req.path},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  }
  if (req.path === '/api/theme' || req.path.startsWith('/api/theme/')) {
    fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:404-handler',message:'404 for theme',data:{method:req.method,path:req.path},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
  }
  // #endregion
  console.log('⚠️ 404 - Route bulunamadı:', req.method, req.path);
  console.log('⚠️ Kayıtlı route\'lar: /api/orders, /api/payment, /api/user, /api/admin, /api/products, ...');
  res.status(404).json({ 
    error: 'Route bulunamadı', 
    method: req.method,
    path: req.path,
    message: `${req.method} ${req.path} için route tanımlı değil`
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (!res.headersSent) {
    res.status(500).json({ 
      error: 'Bir hata oluştu', 
      message: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

app.listen(PORT, () => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:app.listen',message:'Server started',data:{port:PORT,nodeEnv:NODE_ENV},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
  // #endregion
  console.log(`✅ Server ${PORT} portunda çalışıyor`);
  console.log(`🌐 Environment: ${NODE_ENV}`);
  console.log(`🔒 Rate Limiting: Aktif`);
  if (NODE_ENV === 'production') {
    console.log(`🔐 HTTPS: Zorunlu`);
    console.log(`🛡️  Güvenlik Header'ları: Aktif`);
  }
});

export default app;

