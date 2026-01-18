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
 * Veritabanı durumunu kontrol et (Admin) - Debug için
 */
router.get('/debug/orders', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const Order = mongoose.models.Order || mongoose.model('Order');
    
    const totalCount = await Order.countDocuments({});
    const sampleOrder = await Order.findOne({}).lean();
    
    res.json({
      success: true,
      totalCount,
      hasOrders: totalCount > 0,
      sampleOrder: sampleOrder ? {
        _id: sampleOrder._id,
        createdAt: sampleOrder.createdAt,
        price: sampleOrder.price,
        status: sampleOrder.status
      } : null,
      collectionName: Order.collection.name,
      dbName: mongoose.connection.db.databaseName
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

/**
 * Tüm siparişleri getir (Admin) - Site açıldığından beri TÜM siparişler
 */
router.get('/orders', requireAdminRole, async (req, res) => {
  try {
    console.log('📥 Admin sipariş isteği alındı - TÜM siparişler isteniyor');
    await connectDB();
    console.log('✅ Veritabanı bağlantısı kontrol edildi');
    
    // Direkt MongoDB'den tüm siparişleri çek (HİÇBİR FİLTRE YOK - site açıldığından beri tüm siparişler)
    const Order = mongoose.models.Order || mongoose.model('Order');
    
    // Önce ham sayıyı kontrol et
    const totalCount = await Order.countDocuments({});
    console.log(`🔍 MongoDB'de toplam sipariş sayısı: ${totalCount}`);
    
    // TÜM siparişleri çek - HİÇBİR TARİH FİLTRESİ YOK
    const rawOrders = await Order.find({})
      .sort({ createdAt: -1 }) // En yeni önce
      .lean();
    
    console.log(`✅ MongoDB'den ${rawOrders.length} sipariş çekildi (TÜM siparişler, filtre yok)`);
    
    // Siparişleri formatla ve şifreleri çöz
    const formattedOrders = rawOrders.map((order) => {
      try {
        // Admin için şifreleri çöz
        const formatted = OrderModel.formatOrder(order, true);
        
        // Eksik alanları ekle
        return {
          ...formatted,
          id: formatted.id || formatted._id || order._id?.toString(),
          _id: formatted._id || order._id?.toString(),
          createdAt: order.createdAt || formatted.createdAt,
          updatedAt: order.updatedAt || formatted.updatedAt
        };
      } catch (formatError) {
        console.error(`❌ Sipariş formatlama hatası (ID: ${order._id}):`, formatError);
        // Hata durumunda en azından temel bilgileri döndür
        return {
          id: order._id?.toString(),
          _id: order._id?.toString(),
          price: order.price,
          status: order.status || 'Yeni',
          paymentStatus: order.paymentStatus || 'pending',
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          size: order.size,
          quantity: order.quantity || 1,
          customerInfo: {
            email: 'Format hatası',
            firstName: '',
            lastName: ''
          },
          error: 'Format hatası'
        };
      }
    });
    
    console.log(`✅ ${formattedOrders.length} sipariş formatlandı`);
    
    // İlk 3 siparişin detaylarını logla
    if (formattedOrders.length > 0) {
      console.log('📋 İlk 3 sipariş detayı:');
      formattedOrders.slice(0, 3).forEach((order, index) => {
        console.log(`  ${index + 1}. Sipariş:`, {
          id: order.id || order._id,
          customerEmail: order.customerInfo?.email || 'Email yok',
          price: order.price,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : 'Tarih yok'
        });
      });
    }
    
    const response = {
      success: true,
      orders: formattedOrders,
      total: formattedOrders.length,
      rawCount: totalCount
    };
    
    console.log(`📤 Response hazırlandı: ${response.total} sipariş gönderiliyor (Ham: ${totalCount})`);
    console.log(`📤 Response detayı:`, {
      success: response.success,
      ordersLength: response.orders.length,
      total: response.total,
      rawCount: response.rawCount,
      hasOrders: response.orders.length > 0
    });
    
    // Eğer sipariş yoksa, bunu açıkça logla
    if (totalCount === 0) {
      console.warn('⚠️ VERİTABANINDA HİÇ SİPARİŞ YOK!');
      console.warn('⚠️ MongoDB collection boş veya bağlantı sorunu olabilir');
    } else if (totalCount > 0 && formattedOrders.length === 0) {
      console.error('❌ KRİTİK: Veritabanında sipariş var ama formatlama başarısız!');
      console.error(`❌ Ham sipariş sayısı: ${totalCount}, Formatlanan: ${formattedOrders.length}`);
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Siparişleri getirme hatası:', error);
    console.error('❌ Hata detayı:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Siparişler getirilemedi',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;

