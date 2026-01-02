import express from 'express';
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

