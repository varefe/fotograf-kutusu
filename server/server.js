import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import adminUserRoutes from './routes/adminUser.js';
import { securityLogger, securityHeaders } from './middleware/security.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// OPTIONS (preflight) request'leri için özel handler - CORS'dan ÖNCE
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Session, X-API-Key, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});

// CORS - EN BAŞTA, HER ŞEYDEN ÖNCE
// Development modunda tüm origin'lere izin ver (sadece development için!)
if (NODE_ENV === 'development') {
  app.use(cors({
    origin: (origin, callback) => {
      // Development'ta tüm origin'lere izin ver
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Session', 'X-API-Key', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));
  console.log('🌐 CORS: Development modu - Tüm origin\'lere izin verildi');
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
    return req.path === '/api/health' || req.method === 'OPTIONS';
  }
});

// Sipariş oluşturma için daha sıkı rate limiting
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10, // maksimum 10 sipariş
  message: {
    success: false,
    error: 'Çok fazla sipariş',
    message: 'Lütfen bir süre sonra tekrar deneyin'
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

// Rate limiting uygula
app.use('/api/', generalLimiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB database bağlantısı
connectDB().then(() => {
  console.log('✅ Veritabanı hazır');
}).catch((error) => {
  console.error('❌ Veritabanı bağlantı hatası:', error.message);
});

// Routes (rate limiting ile)
app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/payment', paymentLimiter, paymentRoutes);
app.use('/api/user', generalLimiter, userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/users', adminUserRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
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
  res.status(500).json({ 
    error: 'Bir hata oluştu', 
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
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

