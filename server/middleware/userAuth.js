import { verifyToken } from '../utils/jwt.js';
import { connectDB } from '../config/database.js';
import User from '../models/UserSchema.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEBUG_LOG_PATH = path.join(__dirname, '../../.cursor/debug.log');
const logDebug = (data) => { try { fs.appendFileSync(DEBUG_LOG_PATH, JSON.stringify({...data,timestamp:Date.now()})+'\n'); } catch(e) {} };

/**
 * Kullanıcı authentication middleware
 * JWT token kontrolü yapar
 */
export const requireAuth = async (req, res, next) => {
  // #region agent log
  console.log('🔍 [DEBUG] requireAuth entry:', { nextType: typeof next, nextIsFunction: typeof next === 'function', method: req.method, path: req.path, hasAuthHeader: !!req.headers.authorization });
  // #endregion
  try {
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

    // Veritabanı bağlantısını kontrol et
    await connectDB();
    
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
    
    // #region agent log
    logDebug({sessionId:'debug-session',runId:'run1',hypothesisId:'H2',location:'userAuth.js:optionalAuth',message:'optionalAuth entry',data:{method:req.method,path:req.path,hasAuthHeader:!!authHeader}});
    // #endregion
    console.log('🔍 [DEBUG] optionalAuth entry:', { 
      method: req.method, 
      path: req.path, 
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 20) || 'none'
    });
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      
      // #region agent log
      console.log('🔍 [DEBUG] optionalAuth token check:', { 
        hasToken: !!token,
        tokenLength: token?.length || 0,
        decoded: !!decoded,
        decodedUserId: decoded?.userId || null
      });
      // #endregion
      
      if (decoded) {
        await connectDB();
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role
          };
          // #region agent log
          console.log('🔍 [DEBUG] optionalAuth user set:', { userId: req.user.id });
          // #endregion
        }
      }
    } else {
      // #region agent log
      logDebug({sessionId:'debug-session',runId:'run1',hypothesisId:'H2',location:'userAuth.js:optionalAuth',message:'No auth header, continuing',data:{}});
      // #endregion
      console.log('🔍 [DEBUG] optionalAuth no auth header, continuing');
    }
    
    // #region agent log
    logDebug({sessionId:'debug-session',runId:'run1',hypothesisId:'H2',location:'userAuth.js:optionalAuth',message:'Calling next',data:{hasUser:!!req.user,userId:req.user?.id||null}});
    // #endregion
    console.log('🔍 [DEBUG] optionalAuth calling next:', { 
      hasUser: !!req.user,
      userId: req.user?.id || null
    });
    next();
  } catch (error) {
    // #region agent log
    console.error('🔍 [DEBUG] optionalAuth catch:', { errorMessage: error?.message });
    // #endregion
    // Hata olsa bile devam et (opsiyonel auth)
    next();
  }
};

