import express from 'express';
import User from '../models/UserSchema.js';
import { connectDB } from '../config/database.js';
import { requireAuth } from '../middleware/userAuth.js';

const router = express.Router();

/**
 * Kullanıcının admin olup olmadığını kontrol et
 */
router.get('/check', requireAuth, async (req, res) => {
  try {
    await connectDB();
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      isAdmin: user.role === 'admin',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin kontrol hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Admin kontrolü yapılamadı',
      message: error.message
    });
  }
});

export default router;

