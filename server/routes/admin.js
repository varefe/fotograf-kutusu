import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import User from '../models/UserSchema.js';
import Order from '../models/OrderSchema.js'; // Model + formatOrder (şifre çözme)
import Gallery from '../models/GallerySchema.js';
import Category from '../models/CategorySchema.js';
import Review from '../models/ReviewSchema.js';
import Announcement from '../models/AnnouncementSchema.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireAuth } from '../middleware/userAuth.js';
import { verifyToken } from '../utils/jwt.js';

// Order modeli her route handler içinde mongoose.model('Order') ile alınıyor (request-time).
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
    await connectDB();
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
    const Order = mongoose.model('Order');

    // Toplam kullanıcı sayısı
    const totalUsers = await User.countDocuments({});
    
    // Toplam sipariş sayısı
    const allOrders = await Order.find({}).sort({ createdAt: -1 }).lean();
    const totalOrders = allOrders.length;
    
    // Ödenen siparişler
    const paidOrders = allOrders.filter(order => order.paymentStatus === 'paid').length;
    
    // Bekleyen siparişler
    const pendingOrders = allOrders.filter(order => order.paymentStatus === 'pending').length;
    
    // Toplam gelir (sadece ödenen siparişler)
    const paidOrdersList = allOrders.filter(order => order.paymentStatus === 'paid');
    const totalRevenue = paidOrdersList.reduce((sum, order) => {
      return sum + (parseFloat(order.price) || 0);
    }, 0);
    
    // Son 30 gün içindeki siparişler
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = allOrders.filter(order => {
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
    const Order = mongoose.model('Order');
    
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();
    
    // Her kullanıcının sipariş sayısını ekle
    const allOrders = await Order.find({}).lean();
    const usersWithOrders = users.map((user) => {
      const orderCount = allOrders.filter(order => {
        return order.userId && order.userId.toString() === user._id.toString();
      }).length;
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
 * Kullanıcının admin olup olmadığını kontrol et
 */
router.get('/users/check', requireAdminRole, async (req, res) => {
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
        id: user._id.toString(),
        _id: user._id.toString(),
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

/**
 * Kullanıcı detayı (Admin)
 */
router.get('/users/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const Order = mongoose.model('Order');
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }
    
    // Kullanıcının siparişlerini getir
    const userOrders = await Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();
    
    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        _id: user._id.toString(),
        orders: userOrders
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
    const deleted = await User.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }
    
    // Kullanıcının siparişlerini de sil (opsiyonel - isteğe bağlı)
    // const OrderModel = await getOrder();
    // await OrderModel.destroy({ where: { userId: req.params.id } });
    
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
 * Kullanıcı rolü güncelle (Admin) - Başka hesapları admin yapabilir
 */
router.patch('/users/:id/role', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz rol',
        message: 'role alanı "admin" veya "user" olmalıdır'
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    targetUser.role = role;
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: role === 'admin' ? 'Kullanıcı admin yapıldı' : 'Kullanıcı admin yetkisi kaldırıldı',
      user: {
        _id: targetUser._id.toString(),
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        role: targetUser.role
      }
    });
  } catch (error) {
    console.error('Rol güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Rol güncellenemedi',
      message: error.message
    });
  }
});

/**
 * Veritabanını temizle (Admin) - Tüm verileri sil
 * DİKKAT: Bu işlem geri alınamaz!
 */
router.post('/database/clear', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const Order = mongoose.model('Order');
    
    const { confirm } = req.body;
    
    if (confirm !== 'TEMIZLE') {
      return res.status(400).json({
        success: false,
        error: 'Onay gerekli',
        message: 'Veritabanını temizlemek için body\'de { "confirm": "TEMIZLE" } göndermelisiniz'
      });
    }
    
    // İstatistikleri al
    const orderCount = await Order.countDocuments({});
    const userCount = await User.countDocuments({});
    const galleryCount = await Gallery.countDocuments({});
    const categoryCount = await Category.countDocuments({});
    const reviewCount = await Review.countDocuments({});
    const announcementCount = await Announcement.countDocuments({});
    
    const stats = {
      orders: orderCount,
      users: userCount,
      galleries: galleryCount,
      categories: categoryCount,
      reviews: reviewCount,
      announcements: announcementCount
    };
    
    // Tüm koleksiyonları temizle
    const deletedOrders = await Order.deleteMany({});
    const deletedUsers = await User.deleteMany({});
    const deletedGalleries = await Gallery.deleteMany({});
    const deletedCategories = await Category.deleteMany({});
    const deletedReviews = await Review.deleteMany({});
    const deletedAnnouncements = await Announcement.deleteMany({});
    
    res.status(200).json({
      success: true,
      message: 'Veritabanı başarıyla temizlendi',
      deleted: {
        orders: deletedOrders.deletedCount,
        users: deletedUsers.deletedCount,
        galleries: deletedGalleries.deletedCount,
        categories: deletedCategories.deletedCount,
        reviews: deletedReviews.deletedCount,
        announcements: deletedAnnouncements.deletedCount
      },
      before: stats
    });
  } catch (error) {
    console.error('Veritabanı temizleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Veritabanı temizlenemedi',
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
    const mongoose = (await import('mongoose')).default;
    const Order = mongoose.model('Order');
    
    const dbName = mongoose.connection.db?.databaseName || 'Bilinmiyor';
    const collectionName = 'orders';
    const totalCount = await Order.countDocuments({});
    const sampleOrder = await Order.findOne({}).lean();
    
    // Tüm koleksiyonları listele
    const allCollections = await mongoose.connection.db?.listCollections().toArray() || [];
    
    res.json({
      success: true,
      totalCount,
      hasOrders: totalCount > 0,
      sampleOrder: sampleOrder ? {
        id: sampleOrder._id.toString(),
        _id: sampleOrder._id.toString(),
        createdAt: sampleOrder.createdAt,
        price: sampleOrder.price,
        status: sampleOrder.status,
        paymentStatus: sampleOrder.paymentStatus
      } : null,
      collectionName,
      dbName,
      connectionState: mongoose.connection.readyState,
      allCollections: allCollections.map(c => ({ name: c.name, type: c.type }))
    });
  } catch (error) {
    console.error('❌ Debug endpoint hatası:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    
    // Veritabanı ve koleksiyon bilgilerini logla
    const dbName = mongoose.connection.db?.databaseName || 'Bilinmiyor';
    const collectionName = 'orders';
    console.log(`🔍 Veritabanı bilgileri:`, {
      dbName,
      collectionName,
      connectionState: mongoose.connection.readyState,
      readyStateText: mongoose.connection.readyState === 1 ? 'Bağlı' : 'Bağlı değil'
    });
    
    // Önce ham sayıyı kontrol et (Order = Mongoose model from OrderSchema)
    const totalCount = await Order.countDocuments({});
    console.log(`🔍 MongoDB'de toplam sipariş sayısı: ${totalCount} (Koleksiyon: ${collectionName}, DB: ${dbName})`);
    
    // TÜM siparişleri çek - HİÇBİR TARİH FİLTRESİ YOK (ESKİ VE YENİ TÜM SİPARİŞLER)
    const rawOrders = await Order.find({})
      .sort({ createdAt: -1 }) // En yeni önce
      .lean();
    
    console.log(`✅ MongoDB'den ${rawOrders.length} sipariş çekildi (TÜM siparişler, filtre yok - ESKİ VE YENİ)`);
    
    // Eğer sipariş varsa, tarih aralığını logla
    if (rawOrders.length > 0) {
      const sortedByDate = [...rawOrders].sort((a, b) => {
        const aDate = new Date(a.createdAt);
        const bDate = new Date(b.createdAt);
        return aDate - bDate;
      });
      const oldestOrder = sortedByDate[0];
      const newestOrder = sortedByDate[sortedByDate.length - 1];
      console.log(`📅 Sipariş tarih aralığı:`, {
        enEski: oldestOrder.createdAt ? new Date(oldestOrder.createdAt).toISOString() : 'Tarih yok',
        enYeni: newestOrder.createdAt ? new Date(newestOrder.createdAt).toISOString() : 'Tarih yok',
        toplamSiparis: rawOrders.length
      });
    }
    
    // Siparişleri formatla ve şifreleri çöz (Order.formatOrder = decryptSensitiveFields for admin)
    const formattedOrders = rawOrders.map((order) => {
      try {
        const formatted = Order.formatOrder ? Order.formatOrder(order, true) : order;
        
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
        // Hata durumunda en azından temel bilgileri döndür (şifreli customerInfo gösterme)
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
            lastName: '',
            phone: '',
            address: ''
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
      console.warn('⚠️ PostgreSQL tablo boş veya bağlantı sorunu olabilir');
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

/**
 * Sipariş durumu güncelle (Admin) - GET /api/admin/orders ile aynı auth kullanır
 */
router.patch('/orders/:id/status', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const OrderModel = mongoose.models.Order || Order;
    const { status, trackingNumber, shippingCompany } = req.body;
    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Sipariş bulunamadı' });
    }
    const oldStatus = order.status;
    const updateData = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (shippingCompany !== undefined) updateData.shippingCompany = shippingCompany;
    const updatedOrder = await OrderModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (status && status !== oldStatus && order.userId) {
      try {
        const { sendOrderStatusNotification, sendOrderShippedNotification, sendOrderDeliveredNotification } = await import('../utils/notificationService.js');
        if (status === 'Kargoya Verildi' && trackingNumber) {
          await sendOrderShippedNotification(order.userId.toString(), order._id.toString(), trackingNumber, shippingCompany);
        } else if (status === 'Teslim Edildi') {
          await sendOrderDeliveredNotification(order.userId.toString(), order._id.toString());
        } else {
          await sendOrderStatusNotification(order.userId.toString(), order._id.toString(), status, { price: order.price });
        }
      } catch (notifError) {
        console.error('Bildirim gönderme hatası:', notifError);
      }
    }
    res.json({ success: true, message: 'Sipariş durumu güncellendi', order: updatedOrder });
  } catch (error) {
    console.error('Sipariş durumu güncelleme hatası:', error);
    res.status(500).json({ success: false, error: 'Sipariş güncellenemedi', message: error.message });
  }
});

/**
 * Iyzico'dan sipariş bilgilerini al ve veritabanına ekle (Admin) - Manuel sipariş ekleme
 */
router.post('/orders/manual', requireAdminRole, async (req, res) => {
  try {
    console.log('📥 Manuel sipariş ekleme isteği alındı');
    await connectDB();
    
    const {
      email,
      firstName,
      lastName,
      phone,
      address,
      size,
      quantity,
      shippingType,
      price,
      paymentStatus,
      status,
      notes,
      createdAt
    } = req.body;

    // Zorunlu alanları kontrol et
    if (!email || !address || !size || !quantity || !price) {
      return res.status(400).json({
        success: false,
        error: 'Eksik bilgi',
        message: 'Email, adres, boyut, adet ve fiyat zorunludur'
      });
    }

    // Sipariş oluştur
    const orderData = {
      userId: null, // Misafir siparişi
      photo: {
        filename: 'manual-order.jpg',
        originalName: 'manual-order.jpg',
        base64: null,
        mimetype: 'image/jpeg',
        size: 0
      },
      photos: [],
      size: size,
      customSize: undefined,
      quantity: parseInt(quantity) || 15,
      frameType: 'none',
      paperType: 'glossy',
      colorMode: 'color',
      shippingType: shippingType || 'standard',
      customerInfo: {
        firstName: firstName || 'Müşteri',
        lastName: lastName || 'Müşteri',
        email: email,
        phone: phone || '',
        address: address
      },
      price: parseFloat(price),
      status: status || 'Yeni',
      paymentStatus: paymentStatus || 'paid',
      notes: notes || 'Manuel olarak eklenen sipariş',
      createdAt: createdAt ? new Date(createdAt) : new Date(),
      updatedAt: new Date()
    };

    console.log('📦 Manuel sipariş kaydediliyor:', {
      email: orderData.customerInfo.email,
      price: orderData.price,
      paymentStatus: orderData.paymentStatus,
      status: orderData.status
    });

    const Order = mongoose.model('Order');
    const savedOrder = await Order.create(orderData);

    console.log('✅ Manuel sipariş başarıyla kaydedildi:', savedOrder._id);

    res.status(201).json({
      success: true,
      message: 'Sipariş başarıyla eklendi',
      order: {
        ...savedOrder.toObject(),
        _id: savedOrder._id.toString(),
        id: savedOrder._id.toString()
      }
    });
  } catch (error) {
    console.error('❌ Manuel sipariş ekleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Sipariş eklenemedi',
      message: error.message
    });
  }
});

/**
 * Iyzico'dan sipariş bilgilerini çek ve veritabanına ekle (Admin)
 */
router.post('/orders/sync-from-iyzico', requireAdminRole, async (req, res) => {
  try {
    console.log('📥 Iyzico sipariş senkronizasyonu başlatılıyor...');
    await connectDB();
    const Order = mongoose.model('Order');
    
    const { paymentId, conversationId } = req.body;
    
    if (!paymentId && !conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Eksik bilgi',
        message: 'paymentId veya conversationId gereklidir'
      });
    }

    // Iyzico API'den sipariş bilgilerini çek
    const Iyzipay = (await import('iyzipay')).default;
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY,
      secretKey: process.env.IYZICO_SECRET_KEY,
      uri: process.env.IYZICO_URI || 'https://api.iyzipay.com'
    });

    let paymentResult = null;

    // Payment ID ile ödeme bilgilerini çek
    if (paymentId) {
      await new Promise((resolve, reject) => {
        iyzipay.payment.retrieve({ paymentId }, (err, result) => {
          if (err) {
            console.error('❌ Iyzico payment retrieve hatası:', err);
            reject(err);
            return;
          }
          paymentResult = result;
          resolve(result);
        });
      });
    } else if (conversationId) {
      // Conversation ID ile ödeme bilgilerini çek
      await new Promise((resolve, reject) => {
        iyzipay.paymentSearch.create({
          conversationId: conversationId
        }, (err, result) => {
          if (err) {
            console.error('❌ Iyzico payment search hatası:', err);
            reject(err);
            return;
          }
          paymentResult = result;
          resolve(result);
        });
      });
    }

    if (!paymentResult || paymentResult.status !== 'success') {
      return res.status(404).json({
        success: false,
        error: 'Sipariş bulunamadı',
        message: 'Iyzico\'da bu ödeme bulunamadı veya başarısız'
      });
    }

    console.log('✅ Iyzico\'dan sipariş bilgileri alındı:', {
      paymentId: paymentResult.paymentId,
      conversationId: paymentResult.conversationId,
      status: paymentResult.paymentStatus,
      price: paymentResult.paidPrice
    });

    // ConversationId'den orderId'yi çıkar
    const orderIdMatch = paymentResult.conversationId?.match(/ORDER-(\d+)/);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;

    // Sipariş zaten veritabanında var mı kontrol et
    let existingOrder = null;
    
    if (orderId) {
      // orderId ile ara (localStorage'daki timestamp ID)
      existingOrder = await Order.findById(orderId);
      if (!existingOrder && paymentResult.buyer?.email) {
        // Email ile de ara
        const ordersByEmail = await Order.find({
          'customerInfo.email': paymentResult.buyer.email
        }).lean();
        if (ordersByEmail.length > 0) {
          existingOrder = ordersByEmail[0];
        }
      }
    }

    // Eğer sipariş yoksa, Iyzico bilgilerinden oluştur
    if (!existingOrder) {
      const orderData = {
        userId: null, // Misafir siparişi
        photo: {
          filename: 'iyzico-sync.jpg',
          originalName: 'iyzico-sync.jpg',
          base64: null,
          mimetype: 'image/jpeg',
          size: 0
        },
        photos: [],
        size: '10x15', // Varsayılan (Iyzico'da detay yok)
        customSize: undefined,
        quantity: 15, // Varsayılan
        frameType: 'none',
        paperType: 'glossy',
        colorMode: 'color',
        shippingType: 'standard',
        customerInfo: {
          firstName: paymentResult.buyer?.name || 'Müşteri',
          lastName: paymentResult.buyer?.surname || 'Müşteri',
          email: paymentResult.buyer?.email || 'email@example.com',
          phone: paymentResult.buyer?.gsmNumber || '',
          address: paymentResult.buyer?.registrationAddress || paymentResult.shippingAddress?.address || 'Adres bilgisi yok'
        },
        price: parseFloat(paymentResult.paidPrice || paymentResult.price || 0),
        status: paymentResult.paymentStatus === 'SUCCESS' ? 'Ödeme Alındı' : 'Bekliyor',
        paymentStatus: paymentResult.paymentStatus === 'SUCCESS' ? 'paid' : 'pending',
        notes: `Iyzico'dan senkronize edildi. Payment ID: ${paymentResult.paymentId}`,
        createdAt: paymentResult.createdDate ? new Date(paymentResult.createdDate) : new Date(),
        updatedAt: new Date()
      };

      console.log('📦 Iyzico\'dan sipariş oluşturuluyor:', {
        email: orderData.customerInfo.email,
        price: orderData.price,
        paymentStatus: orderData.paymentStatus
      });

      const savedOrder = await Order.create(orderData);

      console.log('✅ Iyzico siparişi veritabanına eklendi:', savedOrder._id);

      return res.status(201).json({
        success: true,
        message: 'Sipariş Iyzico\'dan başarıyla eklendi',
        order: {
          ...savedOrder.toObject(),
          _id: savedOrder._id.toString(),
          id: savedOrder._id.toString()
        },
        iyzicoData: {
          paymentId: paymentResult.paymentId,
          conversationId: paymentResult.conversationId,
          status: paymentResult.paymentStatus,
          price: paymentResult.paidPrice
        }
      });
    } else {
      // Sipariş varsa, ödeme durumunu güncelle
      const existingNotes = existingOrder.notes || '';
      await Order.findByIdAndUpdate(
        existingOrder._id,
        {
          paymentStatus: paymentResult.paymentStatus === 'SUCCESS' ? 'paid' : existingOrder.paymentStatus,
          status: paymentResult.paymentStatus === 'SUCCESS' ? 'Ödeme Alındı' : existingOrder.status,
          notes: existingNotes ? `${existingNotes}\nIyzico senkronizasyonu: ${new Date().toISOString()}` : `Iyzico senkronizasyonu: ${new Date().toISOString()}`,
          updatedAt: new Date()
        },
        { new: true }
      );

      const updatedOrder = await Order.findById(existingOrder._id);

      return res.status(200).json({
        success: true,
        message: 'Sipariş güncellendi',
        order: updatedOrder,
        iyzicoData: {
          paymentId: paymentResult.paymentId,
          conversationId: paymentResult.conversationId,
          status: paymentResult.paymentStatus,
          price: paymentResult.paidPrice
        }
      });
    }
  } catch (error) {
    console.error('❌ Iyzico sipariş senkronizasyonu hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Sipariş senkronize edilemedi',
      message: error.message
    });
  }
});

/**
 * Iyzico'dan otomatik olarak TÜM payment ID'leri çek ve veritabanına ekle (Admin)
 * Iyzico Reporting API kullanarak belirli bir tarih aralığındaki tüm ödemeleri çeker
 */
router.post('/orders/sync-all-from-iyzico', requireAdminRole, async (req, res) => {
  try {
    console.log('📥 Iyzico\'dan otomatik olarak TÜM siparişler çekiliyor...');
    await connectPostgres();
    const OrderModel = await getOrder();
    
    const { days = 90 } = req.body; // Son kaç günün ödemeleri çekilecek (varsayılan: 90 gün)
    
    // Tarih aralığı hesapla
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    console.log('📅 Tarih aralığı:', {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      days: days
    });

    // Iyzico API
    const Iyzipay = (await import('iyzipay')).default;
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY,
      secretKey: process.env.IYZICO_SECRET_KEY,
      uri: process.env.IYZICO_URI || 'https://api.iyzipay.com'
    });

    const syncedOrders = [];
    const skippedOrders = [];
    const errors = [];
    let allPaymentIds = [];
    
    // Iyzico Reporting API ile ödemeleri çek
    // Iyzico API'sinde tüm ödemeleri listelemek için Reporting API kullanılır
    console.log('🔍 Iyzico Reporting API\'den ödemeler çekiliyor...');
    
    try {
      // Iyzico Reporting API - Transaction List
      // Not: Iyzico API dokümantasyonuna göre, reporting API ile transaction listesi alınabilir
      const reportingRequest = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: `SYNC-ALL-${Date.now()}`,
        transactionDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD formatı
        page: 1
      };

      // Iyzico Reporting API'yi dene
      // Not: Iyzico API'si genellikle tüm ödemeleri otomatik listelemeyi desteklemez
      // Alternatif: Belirli conversationId pattern'leri ile arama yap
      
      // En pratik yöntem: Iyzico panelinden export edilen payment ID'leri kullanmak
      // Ancak API üzerinden de deneyebiliriz
      
      // Iyzico Reporting API ile transaction listesi çekmeyi dene
      // Iyzico API'sinde reporting API genellikle transaction listesi döndürür
      console.log('🔍 Iyzico Reporting API ile transaction listesi çekiliyor...');
      
      try {
        // Iyzico Reporting API - Transaction List
        // Tarih formatı: YYYY-MM-DD
        const transactionDate = startDate.toISOString().split('T')[0];
        
        let reportingResult = null;
        
        await new Promise((resolve) => {
          // Iyzico Reporting API'yi dene
          // Not: Iyzico API dokümantasyonuna göre reporting API endpoint'i farklı olabilir
          // Bu yüzden önce payment search ile deneyelim
          
          // Alternatif: Payment Search ile boş arama yap (tüm ödemeleri getirmeyi dener)
          iyzipay.paymentSearch.create({
            locale: Iyzipay.LOCALE.TR,
            conversationId: 'SYNC-ALL-ORDERS',
            page: 1,
            pageSize: 100
          }, (err, result) => {
            if (err) {
              console.warn('⚠️ Payment Search başarısız:', err.message);
              resolve(null);
              return;
            }
            reportingResult = result;
            resolve(result);
          });
        });
        
        if (reportingResult && reportingResult.status === 'success') {
          if (reportingResult.items && reportingResult.items.length > 0) {
            console.log(`✅ Iyzico'dan ${reportingResult.items.length} ödeme bulundu`);
            
            for (const payment of reportingResult.items) {
              if (payment.paymentId) {
                allPaymentIds.push(payment.paymentId);
              }
            }
          } else {
            console.log('ℹ️ Payment Search sonuç vermedi, alternatif yöntem deneniyor...');
          }
        }
      } catch (error) {
        console.warn('⚠️ Iyzico Reporting API hatası:', error.message);
      }
      
      // Eğer hiç payment ID bulunamadıysa, kullanıcıya bilgi ver
      if (allPaymentIds.length === 0) {
        console.log('⚠️ Iyzico API\'si tüm ödemeleri otomatik listelemeyi desteklemiyor.');
        console.log('💡 Alternatif: Iyzico panelinden payment ID\'leri export edip /orders/sync-batch-from-iyzico endpoint\'ini kullanın.');
      } else {
        console.log(`📊 Toplam ${allPaymentIds.length} payment ID bulundu`);
      }
      
      // Bulunan payment ID'leri işle
      if (allPaymentIds.length > 0) {
        console.log('🔄 Bulunan payment ID\'ler işleniyor...');
        
        // Her payment ID için detaylı bilgi çek ve sipariş oluştur
        for (const paymentId of allPaymentIds) {
          try {
            let paymentDetail = null;
            
            await new Promise((resolve) => {
              iyzipay.payment.retrieve({ paymentId }, (err, result) => {
                if (err) {
                  errors.push({ paymentId, error: err.message });
                  resolve(null);
                  return;
                }
                paymentDetail = result;
                resolve(result);
              });
            });
            
            if (!paymentDetail || paymentDetail.status !== 'success' || paymentDetail.paymentStatus !== 'SUCCESS') {
              continue;
            }
            
            // ConversationId'den orderId'yi çıkar
            const orderIdMatch = paymentDetail.conversationId?.match(/ORDER-(\d+)/);
            const orderId = orderIdMatch ? orderIdMatch[1] : null;
            
            // Sipariş zaten var mı kontrol et
            let existingOrder = null;
            
            if (orderId) {
              existingOrder = await OrderModel.findByPk(orderId);
              if (!existingOrder && paymentDetail.buyer?.email) {
                const ordersByEmail = await OrderModel.findAll({
                  where: {
                    [Op.or]: [
                      Sequelize.literal(`customer_info->>'email' = '${paymentDetail.buyer.email}'`)
                    ]
                  }
                });
                if (ordersByEmail.length > 0) {
                  existingOrder = ordersByEmail[0];
                }
              }
            }
            
            // Sipariş yoksa oluştur
            if (!existingOrder) {
              const orderData = {
                userId: null,
                photo: {
                  filename: 'iyzico-sync.jpg',
                  originalName: 'iyzico-sync.jpg',
                  base64: null,
                  mimetype: 'image/jpeg',
                  size: 0
                },
                photos: [],
                size: '10x15',
                customSize: undefined,
                quantity: 15,
                frameType: 'none',
                paperType: 'glossy',
                colorMode: 'color',
                shippingType: 'standard',
                customerInfo: {
                  firstName: paymentDetail.buyer?.name || 'Müşteri',
                  lastName: paymentDetail.buyer?.surname || 'Müşteri',
                  email: paymentDetail.buyer?.email || 'email@example.com',
                  phone: paymentDetail.buyer?.gsmNumber || '',
                  address: paymentDetail.buyer?.registrationAddress || paymentDetail.shippingAddress?.address || 'Adres bilgisi yok'
                },
                price: parseFloat(paymentDetail.paidPrice || paymentDetail.price || 0),
                status: 'Ödeme Alındı',
                paymentStatus: 'paid',
                notes: `Iyzico'dan otomatik senkronize edildi. Payment ID: ${paymentDetail.paymentId}`,
                createdAt: paymentDetail.createdDate ? new Date(paymentDetail.createdDate) : new Date(),
                updatedAt: new Date()
              };
              
              const savedOrder = await OrderModel.create(orderData);
              const savedOrderData = savedOrder.toJSON ? savedOrder.toJSON() : savedOrder;
              syncedOrders.push({
                paymentId: paymentDetail.paymentId,
                orderId: savedOrderData.id || savedOrderData._id,
                email: orderData.customerInfo.email,
                price: orderData.price
              });
              
              console.log(`✅ Sipariş eklendi: ${savedOrderData.id} (Payment: ${paymentDetail.paymentId})`);
            } else {
              const existingOrderData = existingOrder.toJSON ? existingOrder.toJSON() : existingOrder;
              console.log(`ℹ️ Sipariş zaten var: ${existingOrderData.id}`);
            }
          } catch (error) {
            console.error(`❌ Payment ${paymentId} işlenirken hata:`, error);
            errors.push({ paymentId, error: error.message });
          }
        }
      }
      
      return res.status(200).json({
        success: true,
        message: `Iyzico senkronizasyonu tamamlandı`,
        summary: {
          paymentIdsFound: allPaymentIds.length,
          synced: syncedOrders.length,
          errors: errors.length
        },
        syncedOrders: syncedOrders,
        errors: errors.length > 0 ? errors : undefined,
        note: allPaymentIds.length === 0 ? 'Iyzico API\'si tüm ödemeleri otomatik listelemeyi desteklemiyor. Iyzico panelinden payment ID\'lerini export edip /orders/sync-batch-from-iyzico endpoint\'ini kullanın.' : undefined
      });
      
    } catch (error) {
      console.error('❌ Iyzico API hatası:', error);
      return res.status(500).json({
        success: false,
        error: 'Iyzico API\'den ödemeler çekilemedi',
        message: error.message,
        note: 'Iyzico API\'si tüm ödemeleri otomatik listelemeyi desteklemiyor. Manuel payment ID listesi gerekli.'
      });
    }
  } catch (error) {
    console.error('❌ Iyzico otomatik senkronizasyon hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Siparişler senkronize edilemedi',
      message: error.message
    });
  }
});

/**
 * Iyzico'dan Payment ID listesi ile siparişleri çek ve veritabanına ekle (Admin)
 * Iyzico panelinden export edilen Payment ID'leri kullanır
 */
router.post('/orders/sync-batch-from-iyzico', requireAdminRole, async (req, res) => {
  try {
    console.log('📥 Iyzico\'dan toplu sipariş senkronizasyonu başlatılıyor...');
    await connectDB();
    const Order = mongoose.model('Order');
    
    const { paymentIds } = req.body; // Array of payment IDs
    
    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Eksik bilgi',
        message: 'paymentIds array gereklidir (örn: ["12345678", "87654321"])'
      });
    }

    console.log(`📋 ${paymentIds.length} payment ID işlenecek`);

    // Iyzico API
    const Iyzipay = (await import('iyzipay')).default;
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY,
      secretKey: process.env.IYZICO_SECRET_KEY,
      uri: process.env.IYZICO_URI || 'https://api.iyzipay.com'
    });

    const syncedOrders = [];
    const skippedOrders = [];
    const errors = [];
    
    // Her payment ID için işlem yap
    for (const paymentId of paymentIds) {
      try {
        console.log(`🔍 Payment ID işleniyor: ${paymentId}`);
        
        // Payment detayını çek
        let paymentDetail = null;
        
        await new Promise((resolve) => {
          iyzipay.payment.retrieve({ paymentId: paymentId.trim() }, (err, result) => {
            if (err) {
              console.error(`❌ Payment ${paymentId} alınamadı:`, err.message);
              errors.push({
                paymentId: paymentId,
                error: err.message || 'Payment bulunamadı'
              });
              resolve(null);
              return;
            }
            paymentDetail = result;
            resolve(result);
          });
        });

        if (!paymentDetail || paymentDetail.status !== 'success') {
          console.warn(`⚠️ Payment ${paymentId} başarısız veya bulunamadı`);
          continue;
        }

        // Sadece başarılı ödemeleri işle
        if (paymentDetail.paymentStatus !== 'SUCCESS') {
          console.log(`⏭️ Payment ${paymentId} başarısız/iptal, atlanıyor`);
          skippedOrders.push({
            paymentId: paymentId,
            status: paymentDetail.paymentStatus
          });
          continue;
        }

        // ConversationId'den orderId'yi çıkar
        const orderIdMatch = paymentDetail.conversationId?.match(/ORDER-(\d+)/);
        const orderId = orderIdMatch ? orderIdMatch[1] : null;

        // Sipariş zaten var mı kontrol et
        let existingOrder = null;
        
        if (orderId) {
          existingOrder = await Order.findById(orderId);
          if (!existingOrder && paymentDetail.buyer?.email) {
            const ordersByEmail = await Order.find({
              'customerInfo.email': paymentDetail.buyer.email
            }).lean();
            if (ordersByEmail.length > 0) {
              existingOrder = ordersByEmail[0];
            }
          }
        } else {
          // OrderId yoksa email ile kontrol et
          if (paymentDetail.buyer?.email) {
            const emailOrders = await Order.find({
              'customerInfo.email': paymentDetail.buyer.email,
              price: parseFloat(paymentDetail.paidPrice || paymentDetail.price || 0),
              createdAt: {
                $gte: new Date(new Date(paymentDetail.createdDate).getTime() - 24 * 60 * 60 * 1000),
                $lte: new Date(new Date(paymentDetail.createdDate).getTime() + 24 * 60 * 60 * 1000)
              }
            }).lean();
            if (emailOrders.length > 0) {
              existingOrder = emailOrders[0];
            }
          }
        }

        // Sipariş yoksa oluştur
        if (!existingOrder) {
          const orderData = {
            userId: null,
            photo: {
              filename: 'iyzico-sync.jpg',
              originalName: 'iyzico-sync.jpg',
              base64: null,
              mimetype: 'image/jpeg',
              size: 0
            },
            photos: [],
            size: '10x15', // Varsayılan (Iyzico'da detay yok)
            customSize: undefined,
            quantity: 15, // Varsayılan
            frameType: 'none',
            paperType: 'glossy',
            colorMode: 'color',
            shippingType: 'standard',
            customerInfo: {
              firstName: paymentDetail.buyer?.name || 'Müşteri',
              lastName: paymentDetail.buyer?.surname || 'Müşteri',
              email: paymentDetail.buyer?.email || 'email@example.com',
              phone: paymentDetail.buyer?.gsmNumber || '',
              address: paymentDetail.buyer?.registrationAddress || paymentDetail.shippingAddress?.address || 'Adres bilgisi yok'
            },
            price: parseFloat(paymentDetail.paidPrice || paymentDetail.price || 0),
            status: 'Ödeme Alındı',
            paymentStatus: 'paid',
            notes: `Iyzico'dan toplu senkronize edildi. Payment ID: ${paymentDetail.paymentId}, Conversation ID: ${paymentDetail.conversationId}`,
            createdAt: paymentDetail.createdDate ? new Date(paymentDetail.createdDate) : new Date(),
            updatedAt: new Date()
          };

          const savedOrder = await Order.create(orderData);
          syncedOrders.push({
            paymentId: paymentDetail.paymentId,
            orderId: savedOrder._id.toString(),
            email: orderData.customerInfo.email,
            price: orderData.price,
            createdAt: orderData.createdAt
          });
          
          console.log(`✅ Sipariş eklendi: ${savedOrder._id} (Payment: ${paymentDetail.paymentId}, Email: ${orderData.customerInfo.email})`);
        } else {
          // Sipariş varsa güncelle
          const existingNotes = existingOrder.notes || '';
          await Order.findByIdAndUpdate(
            existingOrder._id,
            {
              paymentStatus: 'paid',
              status: 'Ödeme Alındı',
              notes: existingNotes ? `${existingNotes}\nIyzico toplu senkronizasyon: ${new Date().toISOString()}` : `Iyzico toplu senkronizasyon: ${new Date().toISOString()}`,
              updatedAt: new Date()
            },
            { new: true }
          );
          
          console.log(`🔄 Sipariş güncellendi: ${existingOrder._id}`);
          syncedOrders.push({
            paymentId: paymentDetail.paymentId,
            orderId: existingOrder._id.toString(),
            email: paymentDetail.buyer?.email,
            price: paymentDetail.paidPrice,
            action: 'updated'
          });
        }
      } catch (error) {
        console.error(`❌ Payment ${paymentId} işlenirken hata:`, error);
        errors.push({
          paymentId: paymentId,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Toplu senkronizasyon tamamlandı`,
      summary: {
        total: paymentIds.length,
        synced: syncedOrders.length,
        skipped: skippedOrders.length,
        errors: errors.length
      },
      syncedOrders: syncedOrders,
      skippedOrders: skippedOrders.length > 0 ? skippedOrders : undefined,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('❌ Iyzico toplu senkronizasyon hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Siparişler senkronize edilemedi',
      message: error.message
    });
  }
});

/**
 * Sipariş sil (Admin)
 */
router.delete('/orders/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const Order = mongoose.model('Order');
    const deleted = await Order.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Sipariş bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Sipariş başarıyla silindi'
    });
  } catch (error) {
    console.error('Sipariş silme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Sipariş silinemedi',
      message: error.message
    });
  }
});

export default router;

