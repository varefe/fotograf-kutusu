import { verifyToken } from '../utils/jwt.js';
import User from '../models/UserSchema.js';

/**
 * Kullanıcı authentication middleware
 * JWT token kontrolü yapar
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Token'ı header'dan al
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
      return res.status(401).json({
        success: false,
        error: 'Geçersiz token',
        message: 'Token geçersiz veya süresi dolmuş'
      });
    }

    // Kullanıcıyı veritabanından bul
    const user = await User.findById(decoded.userId);
    
    if (!user) {
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
    
    next();
  } catch (error) {
    console.error('Authentication hatası:', error);
    return res.status(401).json({
      success: false,
      error: 'Yetkilendirme hatası',
      message: 'Kimlik doğrulama sırasında bir hata oluştu'
    });
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

