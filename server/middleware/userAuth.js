import { verifyToken } from '../utils/jwt.js';
import User from '../models/UserSchema.js';
import { connectDB } from '../config/database.js';

/**
 * Kullanıcı authentication middleware
 * JWT token kontrolü yapar
 */
export const requireAuth = async (req, res, next) => {
  // #region agent log
  console.log('🔍 [DEBUG] requireAuth entry:', { nextType: typeof next, nextIsFunction: typeof next === 'function', method: req.method, path: req.path, hasAuthHeader: !!req.headers.authorization });
  // #endregion
  try {
    // Veritabanı bağlantısını kontrol et
    await connectDB();
    
    // Token'ı header'dan al
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // #region agent log
      console.log('🔍 [DEBUG] requireAuth no auth header:', { nextType: typeof next, nextIsFunction: typeof next === 'function' });
      // #endregion
      return res.status(401).json({
        success: false,
        error: 'Yetkilendirme gerekli',
        message: 'Giriş yapmanız gerekiyor'
      });
    }

    // Token'ı al
    const token = authHeader.split(' ')[1];
    
    // Token'ı doğrula
    const decoded = verifyToken(token);
    
    if (!decoded) {
      // #region agent log
      console.log('🔍 [DEBUG] requireAuth invalid token:', { nextType: typeof next, nextIsFunction: typeof next === 'function' });
      // #endregion
      return res.status(401).json({
        success: false,
        error: 'Geçersiz token',
        message: 'Token geçersiz veya süresi dolmuş'
      });
    }

    // Kullanıcıyı veritabanından bul
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      // #region agent log
      console.log('🔍 [DEBUG] requireAuth user not found:', { nextType: typeof next, nextIsFunction: typeof next === 'function' });
      // #endregion
      return res.status(401).json({
        success: false,
        error: 'Kullanıcı bulunamadı',
        message: 'Kullanıcı hesabı bulunamadı'
      });
    }

    // Kullanıcı bilgilerini request'e ekle
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };
    
    // #region agent log
    console.log('🔍 [DEBUG] requireAuth calling next:', { nextType: typeof next, nextIsFunction: typeof next === 'function', userId: req.user.id });
    // #endregion
    next();
  } catch (error) {
    // #region agent log
    console.error('🔍 [DEBUG] requireAuth catch:', { errorMessage: error?.message, nextType: typeof next, nextIsFunction: typeof next === 'function' });
    // #endregion
    console.error('Authentication hatası:', error);
    // Forward error to Express error handler if next is available and is a function
    if (typeof next === 'function') {
      return next(error);
    } else {
      return res.status(401).json({
        success: false,
        error: 'Yetkilendirme hatası',
        message: 'Kimlik doğrulama sırasında bir hata oluştu'
      });
    }
  }
};

/**
 * Opsiyonel authentication (token varsa kontrol et, yoksa devam et)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      
      if (decoded) {
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role
          };
        }
      }
    }
    
    next();
  } catch (error) {
    // Hata olsa bile devam et (opsiyonel auth)
    next();
  }
};

