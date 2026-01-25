import express from 'express';
import crypto from 'crypto';
import User from '../models/UserSchema.js';
import { connectDB } from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { requireAuth } from '../middleware/userAuth.js';
import { validateOrderData, sanitizeInput } from '../utils/validation.js';

const router = express.Router();

/**
 * Kullanıcı kayıt
 */
router.post('/register', async (req, res) => {
  try {
    await connectDB();

    const { email, password, firstName, lastName, phone, address } = req.body;

    // Validasyon
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Eksik bilgi',
        message: 'E-posta, şifre, ad ve soyad zorunludur'
      });
    }

    // Güçlü şifre kontrolü
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Şifre çok kısa',
        message: 'Şifre en az 8 karakter olmalıdır'
      });
    }

    // Şifre güçlülük kontrolü (büyük harf, küçük harf, rakam, özel karakter)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        error: 'Şifre yeterince güçlü değil',
        message: 'Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter (@$!%*?&) içermelidir'
      });
    }

    // Adres validasyonu (eğer girildiyse)
    if (address && address.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Adres çok kısa',
        message: 'Adres en az 10 karakter olmalıdır'
      });
    }

    // E-posta kontrolü
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'E-posta zaten kullanılıyor',
        message: 'Bu e-posta adresi ile zaten bir hesap mevcut'
      });
    }

    // Yeni kullanıcı oluştur
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      phone: phone ? sanitizeInput(phone) : '',
      address: address ? sanitizeInput(address) : ''
    });

    await user.save();

    // Token oluştur
    const token = generateToken(user._id, user.email, user.role);

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Kayıt hatası',
      message: error.message
    });
  }
});

/**
 * Kullanıcı giriş
 */
router.post('/login', async (req, res) => {
  try {
    await connectDB();

    const { email, password } = req.body;

    // Validasyon
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Eksik bilgi',
        message: 'E-posta ve şifre gereklidir'
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Giriş hatası',
        message: 'E-posta veya şifre hatalı'
      });
    }

    // Şifre kontrolü
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Giriş hatası',
        message: 'E-posta veya şifre hatalı'
      });
    }

    // Token oluştur
    const token = generateToken(user._id, user.email, user.role);

    res.json({
      success: true,
      message: 'Giriş başarılı',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Giriş hatası',
      message: error.message
    });
  }
});

/**
 * Admin giriş (özel endpoint)
 */
router.post('/admin/login', async (req, res) => {
  try {
    await connectDB();

    const { username, password, adminCode } = req.body;

    // Validasyon
    if (!username || !password || !adminCode) {
      return res.status(400).json({
        success: false,
        error: 'Eksik bilgi',
        message: 'Kullanıcı adı, şifre ve admin kodu gereklidir'
      });
    }

    // Admin bilgilerini environment variable'dan al
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'efe';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '193123';
    const ADMIN_CODE = process.env.ADMIN_CODE || ' ADMIN2024SECRET';

    // Admin bilgilerini kontrol et
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD || adminCode !== ADMIN_CODE) {
      return res.status(401).json({
        success: false,
        error: 'Giriş hatası',
        message: 'Kullanıcı adı, şifre veya admin kodu hatalı'
      });
    }

    // Admin kullanıcısını bul veya oluştur
    // Admin email'i environment variable'dan al veya varsayılan kullan
    const adminEmail = process.env.ADMIN_EMAIL || `${ADMIN_USERNAME}@admin.local`;
    
    let adminUser = await User.findOne({ email: adminEmail.toLowerCase() });
    
    if (!adminUser) {
      // Admin kullanıcısı yoksa oluştur
      adminUser = new User({
        email: adminEmail.toLowerCase(),
        password: password, // Şifre hash'lenecek (pre-save hook)
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Admin kullanıcısı oluşturuldu:', adminEmail);
    } else {
      // Admin kullanıcısı varsa, şifresini kontrol et
      const isPasswordValid = await adminUser.comparePassword(password);
      if (!isPasswordValid) {
        // Şifre yanlışsa güncelle
        adminUser.password = password; // Pre-save hook hash'leyecek
        await adminUser.save();
        console.log('✅ Admin şifresi güncellendi');
      }
      
      // Admin rolünü kontrol et
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('✅ Admin rolü güncellendi');
      }
    }

    // Token oluştur
    const token = generateToken(adminUser._id, adminUser.email, adminUser.role);

    res.json({
      success: true,
      message: 'Admin girişi başarılı',
      token,
      user: {
        id: adminUser._id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        phone: adminUser.phone,
        address: adminUser.address,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Admin giriş hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Admin giriş hatası',
      message: error.message
    });
  }
});

/**
 * Kullanıcı profil bilgileri
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    await connectDB();

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Profil getirme hatası',
      message: error.message
    });
  }
});

/**
 * Kullanıcı profil güncelleme
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    await connectDB();

    const { firstName, lastName, phone, address } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    // Adres validasyonu (eğer girildiyse)
    if (address !== undefined && address.trim().length > 0 && address.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Adres çok kısa',
        message: 'Adres en az 10 karakter olmalıdır'
      });
    }

    // Güncelleme
    if (firstName) user.firstName = sanitizeInput(firstName);
    if (lastName) user.lastName = sanitizeInput(lastName);
    if (phone !== undefined) user.phone = sanitizeInput(phone);
    if (address !== undefined) user.address = sanitizeInput(address);

    await user.save();

    res.json({
      success: true,
      message: 'Profil güncellendi',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Profil güncelleme hatası',
      message: error.message
    });
  }
});

/**
 * Şifre sıfırlama isteği gönder
 */
router.post('/forgot-password', async (req, res) => {
  try {
    await connectDB();

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'E-posta gereklidir',
        message: 'Lütfen e-posta adresinizi giriniz'
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Güvenlik için: Kullanıcı yoksa bile başarılı mesajı döndür
    if (!user) {
      return res.json({
        success: true,
        message: 'Eğer bu e-posta adresi ile kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderildi'
      });
    }

    // Reset token oluştur
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 saat geçerli

    // Token'ı veritabanına kaydet
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Geliştirme ortamı için token'ı response'da döndür
    // Production'da bu kaldırılmalı ve e-posta gönderilmeli
    console.log(`🔑 Şifre sıfırlama token'ı (${user.email}): ${resetToken}`);

    res.json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı oluşturuldu',
      // Geliştirme için token'ı döndür (production'da kaldırılmalı)
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
      resetUrl: `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`
    });
  } catch (error) {
    console.error('Şifre sıfırlama isteği hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Şifre sıfırlama isteği gönderilemedi',
      message: error.message
    });
  }
});

/**
 * Şifre sıfırlama (token ile)
 */
router.post('/reset-password', async (req, res) => {
  try {
    await connectDB();

    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Eksik bilgi',
        message: 'Token ve yeni şifre gereklidir'
      });
    }

    // Şifre validasyonu
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Şifre çok kısa',
        message: 'Şifre en az 8 karakter olmalıdır'
      });
    }

    // Şifre güçlülük kontrolü
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'Şifre yeterince güçlü değil',
        message: 'Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter (@$!%*?&) içermelidir'
      });
    }

    // Token ile kullanıcıyı bul
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() } // Token süresi dolmamış olmalı
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz token',
        message: 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş'
      });
    }

    // Yeni şifreyi kaydet
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: 'Şifre başarıyla sıfırlandı'
    });
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Şifre sıfırlanamadı',
      message: error.message
    });
  }
});

/**
 * Şifre değiştirme
 */
router.put('/change-password', requireAuth, async (req, res) => {
  try {
    await connectDB();

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Eksik bilgi',
        message: 'Mevcut şifre ve yeni şifre gereklidir'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Şifre çok kısa',
        message: 'Yeni şifre en az 8 karakter olmalıdır'
      });
    }

    // Şifre güçlülük kontrolü (büyük harf, küçük harf, rakam, özel karakter)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'Şifre yeterince güçlü değil',
        message: 'Yeni şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter (@$!%*?&) içermelidir'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    // Mevcut şifre kontrolü
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Şifre hatalı',
        message: 'Mevcut şifre yanlış'
      });
    }

    // Yeni şifreyi kaydet (pre-save hook otomatik hashleyecek)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Şifre değiştirme hatası',
      message: error.message
    });
  }
});

export default router;

