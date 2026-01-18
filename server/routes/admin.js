import express from 'express';
import User from '../models/UserSchema.js';
import OrderModel from '../models/Order.js';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireAuth } from '../middleware/userAuth.js';
import { verifyToken } from '../utils/jwt.js';

const router = express.Router();

// Admin kontrolü - JWT token ile
const requireAdminRole = async (req, res, next) => {
  try {
    // Token'ı header'dan al
    const authHeader = req.headers.authorization;
    
    console.log('🔍 requireAdminRole - Auth Header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ requireAdminRole - No Bearer token');
      return res.status(401).json({
        success: false,
        error: 'Yetkilendirme gerekli',
        message: 'Giriş yapmanız gerekiyor'
      });
    }

    // Token'ı doğrula ve kullanıcıyı al
    const token = authHeader.split(' ')[1];
    console.log('🔍 requireAdminRole - Token received, length:', token?.length);
    
    const decoded = verifyToken(token);
    console.log('🔍 requireAdminRole - Decoded:', decoded ? 'Valid' : 'Invalid');
    
    if (!decoded) {
      console.log('❌ requireAdminRole - Token invalid');
      return res.status(401).json({
        success: false,
        error: 'Geçersiz token',
        message: 'Token geçersiz veya süresi dolmuş'
      });
    }

    console.log('🔍 requireAdminRole - User ID from token:', decoded.userId);

    // Kullanıcıyı veritabanından bul
    const user = await User.findById(decoded.userId);
    console.log('🔍 requireAdminRole - User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ requireAdminRole - User not found in DB');
      return res.status(401).json({
        success: false,
        error: 'Kullanıcı bulunamadı',
        message: 'Kullanıcı hesabı bulunamadı'
      });
    }

    console.log('🔍 requireAdminRole - User role:', user.role);

    // Admin kontrolü
    if (user.role !== 'admin') {
      console.log('❌ requireAdminRole - User is not admin');
      return res.status(403).json({
        success: false,
        error: 'Yetkisiz erişim',
        message: 'Bu işlem için admin yetkisi gereklidir'
      });
    }

    console.log('✅ requireAdminRole - Admin access granted');

    // Kullanıcı bilgilerini request'e ekle
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('❌ Admin role kontrolü hatası:', error);
    return res.status(401).json({
      success: false,
      error: 'Yetkilendirme hatası',
      message: error.message
    });
  }
};

/**
 * Admin Dashboard - İstatistikler
 */
router.get('/stats', requireAdminRole, async (req, res) => {
  try {
    await connectDB();

    // Toplam kullanıcı sayısı
    const totalUsers = await User.countDocuments();
    
    // Toplam sipariş sayısı - OrderModel kullan
    const allOrdersForCount = await OrderModel.findAll(true);
    const totalOrders = allOrdersForCount.length;
    
    // Ödenen siparişler
    const paidOrders = allOrdersForCount.filter(order => order.paymentStatus === 'paid').length;
    
    // Bekleyen siparişler
    const pendingOrders = allOrdersForCount.filter(order => order.paymentStatus === 'pending').length;
    
    // Toplam gelir (sadece ödenen siparişler)
    // allOrdersForCount zaten tüm siparişleri içeriyor, tekrar çağırmaya gerek yok
    const paidOrdersList = allOrdersForCount.filter(order => order.paymentStatus === 'paid');
    const totalRevenue = paidOrdersList.reduce((sum, order) => sum + (order.price || 0), 0);
    
    // Son 30 gün içindeki siparişler
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = allOrdersForCount.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= thirtyDaysAgo;
    }).length;
    
    // Son 30 gün içindeki yeni kullanıcılar
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        paidOrders,
        pendingOrders,
        totalRevenue,
        recentOrders,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Admin istatistik hatası:', error);
    res.status(500).json({
      success: false,
      error: 'İstatistikler getirilemedi',
      message: error.message
    });
  }
});

/**
 * Tüm kullanıcıları getir (Admin)
 */
router.get('/users', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    
    const users = await User.find({})
      .select('-password') // Şifreyi gösterme
      .sort({ createdAt: -1 }) // En yeni önce
      .lean();
    
    // Her kullanıcının sipariş sayısını ekle
    const allOrdersForUserCount = await OrderModel.findAll(true);
    const usersWithOrders = users.map((user) => {
      const orderCount = allOrdersForUserCount.filter(order => 
        order.userId && order.userId.toString() === user._id.toString()
      ).length;
      return {
        ...user,
        orderCount
      };
    });

    res.status(200).json({
      success: true,
      users: usersWithOrders,
      total: usersWithOrders.length
    });
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Kullanıcılar getirilemedi',
      message: error.message
    });
  }
});

/**
 * Kullanıcı detayı (Admin)
 */
router.get('/users/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }
    
    // Kullanıcının siparişlerini getir
    const orders = await OrderModel.findByUserId(user._id.toString(), true); // Admin için şifreleri çöz
    
    res.status(200).json({
      success: true,
      user: {
        ...user,
        orders
      }
    });
  } catch (error) {
    console.error('Kullanıcı detay hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Kullanıcı detayı getirilemedi',
      message: error.message
    });
  }
});

/**
 * Kullanıcı sil (Admin)
 */
router.delete('/users/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }
    
    // Kullanıcının siparişlerini de sil (opsiyonel - isteğe bağlı)
    // await Order.deleteMany({ userId: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Kullanıcı silinemedi',
      message: error.message
    });
  }
});

/**
 * Tüm siparişleri getir (Admin) - Tüm siparişler (eski ve yeni)
 */
router.get('/orders', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    
    // Direkt MongoDB'den ham veriyi al (formatOrder olmadan)
    const mongoose = await import('mongoose');
    const OrderCollection = mongoose.default.connection.collection('orders');
    const rawOrders = await OrderCollection.find({}).sort({ createdAt: -1 }).toArray();
    console.log(`🔍 MongoDB'den ${rawOrders.length} ham sipariş alındı`);
    
    // Tarih aralığını kontrol et
    if (rawOrders.length > 0) {
      const dates = rawOrders.map(o => o.createdAt ? new Date(o.createdAt) : null).filter(d => d);
      const oldestDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
      const newestDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;
      console.log(`📅 Sipariş tarih aralığı: ${oldestDate?.toISOString()} - ${newestDate?.toISOString()}`);
      console.log(`📊 Toplam ${rawOrders.length} sipariş, ${dates.length} tanesinde tarih var`);
      
      // İlk 5 siparişin detaylarını göster
      console.log('🔍 İlk 5 ham sipariş örneği:', rawOrders.slice(0, 5).map(o => ({
        _id: o._id,
        createdAt: o.createdAt,
        isEncrypted: o.isEncrypted,
        hasCustomerInfo: !!o.customerInfo
      })));
    }
    
    // Tüm siparişleri formatla (formatOrder ile)
    const orders = await OrderModel.findAll(true);
    
    console.log(`✅ Admin siparişleri getirildi: ${orders.length} sipariş formatlandı (${rawOrders.length} ham sipariş)`);
    
    // Eğer formatlanan sipariş sayısı ham sipariş sayısından azsa, sorun var
    if (orders.length < rawOrders.length) {
      console.warn(`⚠️ UYARI: ${rawOrders.length - orders.length} sipariş formatlanırken kayboldu!`);
    }
    
    // Siparişlerin tarihlerini kontrol et
    if (orders.length > 0) {
      const sampleDates = orders.slice(0, 10).map(o => ({
        id: o.id || o._id,
        createdAt: o.createdAt,
        dateStr: o.createdAt ? new Date(o.createdAt).toISOString() : 'Tarih yok',
        hasCustomerInfo: !!o.customerInfo,
        customerEmail: o.customerInfo?.email || 'Yok'
      }));
      console.log('🔍 Örnek sipariş tarihleri (ilk 10):', JSON.stringify(sampleDates, null, 2));
    }
    
    res.status(200).json({
      success: true,
      orders,
      total: orders.length,
      rawTotal: rawOrders.length // Debug için
    });
  } catch (error) {
    console.error('❌ Siparişleri getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Siparişler getirilemedi',
      message: error.message
    });
  }
});

export default router;

