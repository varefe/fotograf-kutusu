/**
 * Admin Authentication Middleware
 * API endpoint'lerine admin kontrolü ekler
 */

// Admin kullanıcı adı ve şifre (environment variable'dan)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'efe';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '193123';

/**
 * Basit admin authentication kontrolü
 * Production'da JWT veya daha güvenli bir yöntem kullanılmalı
 */
export const requireAdmin = (req, res, next) => {
  try {
    // Authorization header'dan bilgileri al
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({
        success: false,
        error: 'Yetkilendirme gerekli',
        message: 'Admin yetkisi gereklidir'
      });
    }
    
    // Basic Auth decode et
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');
    
    // Kullanıcı adı ve şifre kontrolü
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Admin yetkisi var, devam et
      req.admin = true;
      next();
    } else {
      return res.status(403).json({
        success: false,
        error: 'Yetkisiz erişim',
        message: 'Geçersiz kullanıcı adı veya şifre'
      });
    }
  } catch (error) {
    console.error('Admin authentication hatası:', error);
    return res.status(401).json({
      success: false,
      error: 'Yetkilendirme hatası',
      message: 'Kimlik doğrulama sırasında bir hata oluştu'
    });
  }
};

/**
 * Session-based admin kontrolü (alternatif yöntem)
 * Frontend'den session token gönderilir
 */
export const requireAdminSession = (req, res, next) => {
  try {
    // Session token'ı header'dan al
    const sessionToken = req.headers['x-admin-session'];
    
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Yetkilendirme gerekli',
        message: 'Admin oturumu gerekli'
      });
    }
    
    // Session token'ı kontrol et (basit kontrol)
    // Production'da JWT veya Redis kullanılmalı
    const expectedToken = process.env.ADMIN_SESSION_TOKEN || 'admin-session-token';
    
    if (sessionToken === expectedToken) {
      req.admin = true;
      next();
    } else {
      return res.status(403).json({
        success: false,
        error: 'Yetkisiz erişim',
        message: 'Geçersiz oturum'
      });
    }
  } catch (error) {
    console.error('Admin session kontrolü hatası:', error);
    return res.status(401).json({
      success: false,
      error: 'Yetkilendirme hatası',
      message: 'Oturum kontrolü sırasında bir hata oluştu'
    });
  }
};

/**
 * API Key kontrolü (alternatif yöntem)
 */
export const requireApiKey = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const expectedApiKey = process.env.ADMIN_API_KEY || 'admin-api-key-2024';
    
    if (!apiKey || apiKey !== expectedApiKey) {
      return res.status(401).json({
        success: false,
        error: 'Geçersiz API Key',
        message: 'API erişimi için geçerli bir API key gereklidir'
      });
    }
    
    req.admin = true;
    next();
  } catch (error) {
    console.error('API Key kontrolü hatası:', error);
    return res.status(401).json({
      success: false,
      error: 'API Key hatası',
      message: 'API key kontrolü sırasında bir hata oluştu'
    });
  }
};
