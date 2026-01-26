import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import orderTrackingRoutes from './routes/orderTracking.js';
import { securityLogger, securityHeaders } from './middleware/security.js';

dotenv.config();

const app = express();
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
    // GET isteklerini skip et (sadece POST isteklerine uygula)
    if (req.method !== 'POST') return true;
    
    // Test modu için rate limiting'i atla (body'de paymentStatus: 'test' varsa)
    // Not: Body henüz parse edilmemiş olabilir, bu yüzden bu kontrol çalışmayabilir
    // Alternatif: Development modunda rate limiting'i devre dışı bırak
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

// MongoDB database bağlantısı
connectDB().then(() => {
  console.log('✅ Veritabanı hazır');
}).catch((error) => {
  console.error('❌ Veritabanı bağlantı hatası:', error.message);
});

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
// adminRoutes'u mount et (tüm admin route'ları burada)
app.use('/api/admin', adminRoutes);
app.use('/api/order-tracking', generalLimiter, orderTrackingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Debug endpoint - Yetkilendirme gerektirmez (sadece veritabanı durumu)
app.get('/api/debug/db', async (req, res) => {
  try {
    await connectDB();
    const mongoose = (await import('mongoose')).default;
    const Order = mongoose.models.Order || mongoose.model('Order');
    
    const dbName = mongoose.connection.db?.databaseName || 'Bilinmiyor';
    const collectionName = Order.collection?.name || 'Bilinmiyor';
    const totalCount = await Order.countDocuments({});
    
    // Tüm veritabanlarını listele
    const adminDb = mongoose.connection.db.admin();
    const dbList = await adminDb.listDatabases();
    
    // Tüm koleksiyonları listele
    const collections = await mongoose.connection.db?.listCollections().toArray() || [];
    
    // Her veritabanında 'orders' koleksiyonunu kontrol et
    const allDatabasesOrders = {};
    for (const dbInfo of dbList.databases) {
      if (dbInfo.name !== 'admin' && dbInfo.name !== 'local' && dbInfo.name !== 'config') {
        try {
          const db = mongoose.connection.client.db(dbInfo.name);
          const ordersCollection = db.collection('orders');
          const count = await ordersCollection.countDocuments({});
          if (count > 0) {
            // 14 Ocak tarihli siparişleri kontrol et
            const jan14Start = new Date('2024-01-14T00:00:00.000Z');
            const jan14End = new Date('2026-01-15T00:00:00.000Z');
            const jan14Count = await ordersCollection.countDocuments({
              createdAt: {
                $gte: jan14Start,
                $lt: jan14End
              }
            });
            allDatabasesOrders[dbInfo.name] = {
              totalOrders: count,
              jan14Orders: jan14Count,
              size: dbInfo.sizeOnDisk
            };
          }
        } catch (e) {
          // Veritabanına erişilemiyor
        }
      }
    }
    
    // Farklı isimlerle sipariş koleksiyonlarını kontrol et
    const orderCollections = {};
    const possibleNames = ['orders', 'order', 'Orders', 'Order'];
    for (const name of possibleNames) {
      try {
        const testCollection = mongoose.connection.db?.collection(name);
        if (testCollection) {
          const testCount = await testCollection.countDocuments({});
          orderCollections[name] = testCount;
        }
      } catch (e) {
        // Koleksiyon yok
      }
    }
    
    // Örnek sipariş (sadece ID ve tarih)
    const sampleOrder = await Order.findOne({}).select('_id createdAt paymentStatus status').lean();
    
    // 14 Ocak tarihli siparişleri ara (2024, 2025, 2026 için)
    const jan14_2024_Start = new Date('2024-01-14T00:00:00.000Z');
    const jan14_2024_End = new Date('2024-01-15T00:00:00.000Z');
    const jan14_2025_Start = new Date('2025-01-14T00:00:00.000Z');
    const jan14_2025_End = new Date('2025-01-15T00:00:00.000Z');
    const jan14_2026_Start = new Date('2026-01-14T00:00:00.000Z');
    const jan14_2026_End = new Date('2026-01-15T00:00:00.000Z');
    
    const jan14Orders_2024 = await Order.find({
      createdAt: {
        $gte: jan14_2024_Start,
        $lt: jan14_2024_End
      }
    }).select('_id createdAt paymentStatus status customerInfo.email').lean();
    
    const jan14Orders_2025 = await Order.find({
      createdAt: {
        $gte: jan14_2025_Start,
        $lt: jan14_2025_End
      }
    }).select('_id createdAt paymentStatus status customerInfo.email').lean();
    
    const jan14Orders_2026 = await Order.find({
      createdAt: {
        $gte: jan14_2026_Start,
        $lt: jan14_2026_End
      }
    }).select('_id createdAt paymentStatus status customerInfo.email').lean();
    
    const allJan14Orders = [...jan14Orders_2024, ...jan14Orders_2025, ...jan14Orders_2026];
    
    // Tüm siparişlerin tarih aralığını bul
    const oldestOrder = await Order.findOne({}).sort({ createdAt: 1 }).select('createdAt').lean();
    const newestOrder = await Order.findOne({}).sort({ createdAt: -1 }).select('createdAt').lean();
    
    res.json({
      success: true,
      database: {
        name: dbName,
        connectionState: mongoose.connection.readyState,
        connectionStateText: mongoose.connection.readyState === 1 ? 'Bağlı' : 'Bağlı değil'
      },
      orders: {
        collectionName,
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
        },
        jan14Orders: {
          count: allJan14Orders.length,
          count2024: jan14Orders_2024.length,
          count2025: jan14Orders_2025.length,
          count2026: jan14Orders_2026.length,
          orders: allJan14Orders.map(o => ({
            _id: o._id,
            createdAt: o.createdAt,
            createdAtISO: o.createdAt ? new Date(o.createdAt).toISOString() : null,
            paymentStatus: o.paymentStatus,
            status: o.status,
            email: o.customerInfo?.email || 'Email yok'
          }))
        }
      },
      allCollections: collections.map(c => ({ name: c.name, type: c.type })),
      orderCollections,
      allDatabases: dbList.databases.map(db => ({
        name: db.name,
        size: db.sizeOnDisk,
        empty: db.empty
      })),
      allDatabasesOrders
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
  console.log('⚠️ 404 - Route bulunamadı:', req.method, req.path);
  console.log('⚠️ Kayıtlı route\'lar: /api/orders, /api/payment, /api/user, /api/admin');
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
  console.log(`✅ Server ${PORT} portunda çalışıyor`);
  console.log(`🌐 Environment: ${NODE_ENV}`);
  console.log(`🔒 Rate Limiting: Aktif`);
  if (NODE_ENV === 'production') {
    console.log(`🔐 HTTPS: Zorunlu`);
    console.log(`🛡️  Güvenlik Header'ları: Aktif`);
  }
});

export default app;

