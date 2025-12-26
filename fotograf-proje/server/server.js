import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import { securityLogger, securityHeaders } from './middleware/security.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS - EN BAŞTA, HER ŞEYDEN ÖNCE
// Development modunda tüm origin'lere izin ver (sadece development için!)
if (NODE_ENV === 'development') {
  app.use(cors({
    origin: true, // Tüm origin'lere izin ver
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
  const allowedOrigins = [process.env.FRONTEND_URL || 'https://fotografkutusu.com'];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy tarafından izin verilmiyor'));
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
  }
});


// Güvenlik middleware'leri
app.use(securityLogger);
app.use(securityHeaders);

// Rate limiting uygula
app.use('/api/', generalLimiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// SQLite database bağlantısı
try {
  connectDB();
  console.log('✅ Veritabanı hazır');
} catch (error) {
  console.error('❌ Veritabanı bağlantı hatası:', error.message);
}

// Routes (rate limiting ile)
app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/payment', paymentLimiter, paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
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

