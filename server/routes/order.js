import express from 'express';
import { connectDB } from '../config/database.js';
import Order from '../models/OrderSchema.js';
import { requireAdminRole } from '../middleware/auth.js';
import { requireAuth, optionalAuth } from '../middleware/userAuth.js';
import { validateOrderData, sanitizeInput } from '../utils/validation.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEBUG_LOG_PATH = path.join(__dirname, '../../.cursor/debug.log');
const logDebug = (data) => { try { fs.appendFileSync(DEBUG_LOG_PATH, JSON.stringify({...data,timestamp:Date.now()})+'\n'); } catch(e) {} };

const router = express.Router();

// Toplu fiyat tablosu (minimum 15 adet, tekli fiyat yok)
const getBulkPrice = (size, quantity) => {
  // Toplu fiyat tablosu (15+ adet)
  const bulkPrices = {
    '10x15': {
      bulk: {
        15: 16,   // 15 adet: minimum fiyat
        25: 14,   // 25 adet: 349.90 TL / 25 = ~14 TL/adet
        35: 8,    // 35 adet: Pola kart referansı
        50: 7.5,  // 50+ adet ek indirim
        100: 7    // 100+ adet ek indirim
      }
    },
    '15x20': {
      bulk: {
        15: 19,   // 15 adet: minimum fiyat
        25: 16,
        35: 14,
        50: 13,
        100: 12
      }
    },
    '20x30': {
      bulk: {
        15: 26,   // 15 adet: minimum fiyat
        25: 22,
        35: 20,
        50: 19,
        100: 18
      }
    },
    '30x40': {
      bulk: {
        15: 36,   // 15 adet: minimum fiyat
        25: 32,
        35: 30,
        50: 29,
        100: 28
      }
    }
  };

  const sizeData = bulkPrices[size];
  if (!sizeData) return null;
  
  // Toplu fiyat kontrolü (15+ adet)
  if (quantity >= 100 && sizeData.bulk[100]) {
    return sizeData.bulk[100];
  } else if (quantity >= 50 && sizeData.bulk[50]) {
    return sizeData.bulk[50];
  } else if (quantity >= 35 && sizeData.bulk[35]) {
    return sizeData.bulk[35];
  } else if (quantity >= 25 && sizeData.bulk[25]) {
    return sizeData.bulk[25];
  } else if (quantity >= 15 && sizeData.bulk[15]) {
    return sizeData.bulk[15];
  }
  
  // 15'ten az adet için null (minimum 15 adet gerekli)
  return null;
};

// Sadece toplu fiyat hesaplama (minimum 15 adet, tekli fiyat yok)
const calculatePrice = (size, quantity, shippingType, customSize) => {
  // Minimum 15 adet kontrolü
  if (quantity < 15) {
    throw new Error('Minimum 15 adet seçmelisiniz');
  }

  // Boyut bazlı fiyat (Sadece toplu fiyatlar, minimum 15 adet)
  let basePrice = 0;
  if (size === 'custom' && customSize) {
    const area = customSize.width * customSize.height;
    basePrice = Math.ceil(area / 100) * 0.5; // cm² başına 0.5 TL
  } else {
    // Toplu fiyat tablosundan fiyat al (minimum 15 adet)
    const bulkPrice = getBulkPrice(size, quantity);
    if (bulkPrice) {
      basePrice = bulkPrice;
    } else {
      // Fallback: 15 adet fiyatı (minimum)
      const sizePrices = {
        '10x15': 16,
        '15x20': 19,
        '20x30': 26,
        '30x40': 36
      };
      basePrice = sizePrices[size] || 26;
    }
  }

  // Kargo fiyatı (Sosyopix: Standart 15 TL, Express 35 TL, 99 TL üzeri ücretsiz)
  const shippingPrices = {
    'standard': 15,  // Sosyopix: Standart kargo 15 TL
    'express': 35     // Sosyopix: Express kargo 35 TL
  };
  let shippingPrice = shippingPrices[shippingType] || 15;
  
  // 99 TL üzeri ücretsiz kargo (Sosyopix politikası)
  const subtotal = basePrice * quantity;
  if (subtotal >= 99) {
    shippingPrice = 0; // Ücretsiz kargo
  }

  // Toplam fiyat (sadece toplu fiyat, ek seçenek yok)
  const totalPrice = basePrice * quantity + shippingPrice;

  return Math.round(totalPrice * 100) / 100; // 2 ondalık basamak
};

// Kullanıcının siparişlerini getir
router.get('/user', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Kullanıcı sipariş listeleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Siparişler getirilemedi',
      message: error.message
    });
  }
});

// Async wrapper to ensure errors are properly caught and forwarded
const asyncHandler = (fn) => {
  return async (req, res, next) => {
    // #region agent log
    logDebug({sessionId:'debug-session',runId:'run1',hypothesisId:'H3',location:'order.js:asyncHandler',message:'asyncHandler entry',data:{nextType:typeof next,nextIsFunction:typeof next==='function',method:req.method,path:req.path}});
    // #endregion
    console.log('🔍 [DEBUG] asyncHandler entry:', { nextType: typeof next, nextIsFunction: typeof next === 'function', method: req.method, path: req.path });
    // Ensure next is always a function
    if (typeof next !== 'function') {
      // #region agent log
      console.error('🔍 [DEBUG] next is not a function detected:', { nextType: typeof next, nextValue: next, method: req.method, path: req.path });
      // #endregion
      console.error('asyncHandler: next is not a function');
      return res.status(500).json({
        success: false,
        error: 'Sipariş oluşturulamadı',
        message: 'next is not a function'
      });
    }
    try {
      const result = await fn(req, res, next);
      // If fn returns a promise, wait for it; otherwise, it's already handled via next()
      return result;
    } catch (error) {
      // #region agent log
      logDebug({sessionId:'debug-session',runId:'run1',hypothesisId:'H3',location:'order.js:asyncHandler',message:'asyncHandler catch',data:{errorMessage:error?.message,nextType:typeof next,nextIsFunction:typeof next==='function'}});
      // #endregion
      console.error('🔍 [DEBUG] asyncHandler catch:', { errorMessage: error?.message, nextType: typeof next, nextIsFunction: typeof next === 'function' });
      // Forward error to Express error handler
      if (typeof next === 'function') {
        return next(error);
      } else {
        // #region agent log
        console.error('🔍 [DEBUG] next is not function in catch:', { errorMessage: error?.message });
        // #endregion
        return res.status(500).json({
          success: false,
          error: 'Sipariş oluşturulamadı',
          message: error.message || 'Middleware chain error'
        });
      }
    }
  };
};

// Sipariş oluştur (test modu için optionalAuth, production'da requireAuth)
// Wrap optionalAuth in asyncHandler to ensure proper async middleware handling
router.post('/', asyncHandler(optionalAuth), asyncHandler(async (req, res, next) => {
  // MongoDB bağlantısını kontrol et
  try {
    await connectDB();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Veritabanı bağlantı hatası',
      message: error.message
    });
  }

  try {
    // #region agent log
    logDebug({sessionId:'debug-session',runId:'run1',hypothesisId:'H1',location:'order.js:POST /api/orders',message:'Route handler entry',data:{hasBody:!!req.body,bodyKeys:req.body?Object.keys(req.body):[],paymentStatus:req.body?.paymentStatus,paymentStatusType:typeof req.body?.paymentStatus,hasUser:!!req.user,userId:req.user?.id||null}});
    // #endregion
    console.log('🔍 [DEBUG] POST /api/orders entry:', { 
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      paymentStatus: req.body?.paymentStatus,
      hasUser: !!req.user,
      userId: req.user?.id || null
    });
    
    const {
      photo,
      photos, // Yeni: Birden fazla fotoğraf desteği
      size,
      customSize,
      quantity,
      shippingType,
      customerInfo,
      email,
      address,
      phone,
      firstName,
      lastName,
      notes,
      paymentStatus,
      status,
      userId: requestUserId,
      price: requestPrice
    } = req.body;
    
    // TEST MODU KONTROLÜNÜ EN BAŞTA YAP (userId kontrolünden ÖNCE)
    // paymentStatus 'test' kabul edilmez; ödeme baypası kapalı
    const effectivePaymentStatus = (paymentStatus === 'test') ? 'pending' : (paymentStatus || 'pending');

    // Veri temizleme
    // Email ve address'i hem üst seviyede hem customerInfo içinde tut (validasyon için)
    // Email ve address'i sanitize etme - sadece trim yap (validasyon için format korunmalı)
    // String'e çevir ve trim yap
    const finalEmail = String(email || customerInfo?.email || '').trim();
    const finalAddress = String(address || customerInfo?.address || '').trim();
    const finalPhone = phone ? sanitizeInput(phone) : (customerInfo?.phone ? sanitizeInput(customerInfo.phone) : '');
    const finalFirstName = firstName ? sanitizeInput(firstName) : (customerInfo?.firstName ? sanitizeInput(customerInfo.firstName) : 'Müşteri');
    const finalLastName = lastName ? sanitizeInput(lastName) : (customerInfo?.lastName ? sanitizeInput(customerInfo.lastName) : 'Müşteri');
    
    console.log('📧 Email ve Address kontrolü:', {
      rawEmail: email,
      rawCustomerInfoEmail: customerInfo?.email,
      finalEmail: finalEmail,
      finalEmailLength: finalEmail.length,
      rawAddress: address,
      rawCustomerInfoAddress: customerInfo?.address,
      finalAddress: finalAddress,
      finalAddressLength: finalAddress.length
    });
    
    // Photo/Photos objesi sanitize edilmemeli (base64 string içeriyor)
    // Geriye uyumluluk: photo varsa photos array'ine çevir
    let photosArray = photos || [];
    if (photo && !photosArray.length) {
      // Eski format: photo varsa photos array'ine ekle
      photosArray = [photo];
    }
    
    const sanitizedData = {
      photo: photo || null, // Geriye uyumluluk için
      photos: photosArray, // Yeni: Birden fazla fotoğraf
      size: sanitizeInput(size),
      customSize: customSize ? {
        width: parseFloat(sanitizeInput(customSize.width)),
        height: parseFloat(sanitizeInput(customSize.height))
      } : undefined,
      quantity: parseInt(sanitizeInput(quantity)) || 15,
      shippingType: sanitizeInput(shippingType) || 'standard',
      email: finalEmail, // validateOrderData için gerekli
      address: finalAddress, // validateOrderData için gerekli
      phone: finalPhone,
      firstName: finalFirstName,
      lastName: finalLastName,
      customerInfo: {
        firstName: finalFirstName,
        lastName: finalLastName,
        email: finalEmail,
        phone: finalPhone,
        address: finalAddress
      },
      notes: notes ? sanitizeInput(notes) : '',
      paymentStatus: effectivePaymentStatus
    };

    // Minimum 15 adet kontrolü
    if (sanitizedData.quantity < 15) {
      return res.status(400).json({
        success: false,
        error: 'Minimum adet hatası',
        message: 'Minimum 15 adet seçmelisiniz (tekli fiyat yok)',
        details: { quantity: 'Minimum 15 adet gerekli' }
      });
    }

    // Validasyon
    const validation = validateOrderData(sanitizedData);
    if (!validation.isValid) {
      console.error('❌ Validasyon hataları:', validation.errors);
      return res.status(400).json({
        success: false,
        error: 'Validasyon hatası',
        message: 'Girilen bilgiler geçersiz',
        details: validation.errors
      });
    }

    // Fiyat hesapla (eğer request'te fiyat gönderilmişse onu kullan, yoksa hesapla)
    let price;
    if (requestPrice) {
      price = parseFloat(requestPrice);
    } else {
      price = calculatePrice(
        sanitizedData.size,
        sanitizedData.quantity,
        sanitizedData.shippingType,
        sanitizedData.customSize
      );
    }

    // Kullanıcı ID'sini al (optionalAuth ile gelen kullanıcı - giriş zorunlu)
    let userId = null;
    if (req.user && req.user.id) {
      const mongoose = (await import('mongoose')).default;
      if (mongoose.Types.ObjectId.isValid(req.user.id)) {
        userId = new mongoose.Types.ObjectId(req.user.id);
      } else {
        userId = req.user.id;
      }
    } else {
      return res.status(401).json({
        success: false,
        error: 'Yetkilendirme gerekli',
        message: 'Sipariş verebilmek için lütfen giriş yapın veya kayıt olun'
      });
    }

    const finalPaymentStatus = effectivePaymentStatus;
    const finalStatus = status || 'Yeni';

    // Aynı kullanıcının siparişlerini birbirine bağlamak için orderGroupId
    let orderGroupId = null;
    if (finalEmail) {
      // Aynı email ile son 30 gün içinde oluşturulmuş bir sipariş var mı?
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      let existingOrder = await Order.findOne({
        $or: [
          { userId: userId },
          { 'customerInfo.email': finalEmail }
        ],
        createdAt: { $gte: thirtyDaysAgo },
        orderGroupId: { $ne: null }
      }).sort({ createdAt: -1 }).lean();
      
      if (existingOrder && existingOrder.orderGroupId) {
        // Mevcut orderGroupId'yi kullan
        orderGroupId = existingOrder.orderGroupId;
        console.log('🔗 Mevcut orderGroupId kullanılıyor:', orderGroupId);
      } else {
        // Yeni orderGroupId oluştur (email + timestamp hash)
        const crypto = (await import('crypto')).default;
        const hash = crypto.createHash('md5').update(`${finalEmail}-${Date.now()}`).digest('hex');
        orderGroupId = `GROUP-${hash.substring(0, 12)}`;
        console.log('🆕 Yeni orderGroupId oluşturuldu:', orderGroupId);
      }
    }

    // Sipariş oluştur
    const orderData = {
      userId: userId, // Giriş yapmış kullanıcı veya request'ten gelen userId
      photo: sanitizedData.photo, // Geriye uyumluluk için
      photos: sanitizedData.photos, // Yeni: Birden fazla fotoğraf
      size: sanitizedData.size,
      customSize: sanitizedData.customSize,
      quantity: sanitizedData.quantity,
      frameType: 'none', // Varsayılan (artık kullanılmıyor)
      paperType: 'glossy', // Varsayılan (artık kullanılmıyor)
      colorMode: 'color', // Varsayılan (artık kullanılmıyor)
      shippingType: sanitizedData.shippingType,
      customerInfo: {
        firstName: sanitizedData.customerInfo.firstName,
        lastName: sanitizedData.customerInfo.lastName,
        email: sanitizedData.customerInfo.email,
        phone: sanitizedData.customerInfo.phone,
        address: sanitizedData.customerInfo.address
      },
      // Admin panelde ad/soyad/e-posta/telefon/adres her zaman görünsün (şifre çözülemese bile)
      customerInfoDisplay: {
        firstName: String(sanitizedData.customerInfo.firstName ?? '').trim(),
        lastName: String(sanitizedData.customerInfo.lastName ?? '').trim(),
        email: String(sanitizedData.customerInfo.email ?? '').trim(),
        phone: String(sanitizedData.customerInfo.phone ?? '').trim(),
        address: String(sanitizedData.customerInfo.address ?? '').trim()
      },
      price,
      status: finalStatus, // Request'ten gelen veya varsayılan 'Yeni'
      paymentStatus: finalPaymentStatus, // Request'ten gelen veya varsayılan 'pending'
      notes: sanitizedData.notes,
      orderGroupId: orderGroupId // Aynı kullanıcının siparişlerini birbirine bağla
    };

    // Veritabanı ve koleksiyon bilgilerini logla
    const mongoose = (await import('mongoose')).default;
    const dbName = mongoose.connection.db?.databaseName || 'Bilinmiyor';
    const collectionName = 'orders';
    
    console.log('📦 Yeni sipariş kaydediliyor:', {
      email: sanitizedData.customerInfo.email,
      paymentStatus: finalPaymentStatus,
      status: finalStatus,
      price: price,
      quantity: sanitizedData.quantity,
      userId: userId || 'Misafir',
      dbName,
      collectionName
    });

    const savedOrder = await Order.create(orderData);
    console.log('✅ Yeni sipariş kaydedildi:', {
      orderId: savedOrder._id,
      dbName,
      collectionName,
      savedAt: new Date().toISOString()
    });
    
    // Kaydedilen siparişin veritabanında olup olmadığını doğrula
    try {
      const verifyOrder = await Order.findById(savedOrder._id);
      if (verifyOrder) {
        console.log('✅ Sipariş veritabanında doğrulandı:', verifyOrder._id);
      } else {
        console.error('❌ KRİTİK: Sipariş kaydedildi ama veritabanında bulunamadı!');
      }
    } catch (verifyError) {
      console.error('❌ Sipariş doğrulama hatası:', verifyError);
    }

    res.status(201).json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      order: savedOrder
    });
  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);
    // Re-throw the error so asyncHandler can catch it and forward to Express error handler
    throw error;
  }
}));

// Tüm siparişleri getir (Admin)
router.get('/', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    const formattedOrders = orders.map(order => {
      return Order.formatOrder ? Order.formatOrder(order, true) : order; // Admin için decrypt
    });
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Sipariş listeleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Siparişler getirilemedi',
      message: error.message
    });
  }
});

// Tek sipariş getir (Admin)
router.get('/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Sipariş bulunamadı'
      });
    }
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Sipariş getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Sipariş getirilemedi',
      message: error.message
    });
  }
});

// Sipariş durumu güncelle (Admin)
router.patch('/:id/status', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const { status, trackingNumber, shippingCompany } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Sipariş bulunamadı'
      });
    }

    const oldStatus = order.status;
    const updateData = {
      updatedAt: new Date()
    };
    
    if (status) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (shippingCompany !== undefined) updateData.shippingCompany = shippingCompany;
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Bildirim gönder (durum değiştiyse ve kullanıcı varsa)
    if (status && status !== oldStatus && order.userId) {
      try {
        const { sendOrderStatusNotification, sendOrderShippedNotification, sendOrderDeliveredNotification } = await import('../utils/notificationService.js');
        
        if (status === 'Kargoya Verildi' && trackingNumber) {
          await sendOrderShippedNotification(
            order.userId.toString(),
            order._id.toString(),
            trackingNumber,
            shippingCompany
          );
        } else if (status === 'Teslim Edildi') {
          await sendOrderDeliveredNotification(
            order.userId.toString(),
            order._id.toString()
          );
        } else {
          await sendOrderStatusNotification(
            order.userId.toString(),
            order._id.toString(),
            status,
            { price: order.price }
          );
        }
      } catch (notifError) {
        console.error('Bildirim gönderme hatası (sipariş güncelleme devam ediyor):', notifError);
        // Bildirim hatası sipariş güncellemesini engellemez
      }
    }

    res.json({
      success: true,
      message: 'Sipariş durumu güncellendi',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Sipariş güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Sipariş güncellenemedi',
      message: error.message
    });
  }
});

// Sipariş ödeme durumu güncelle (Kullanıcı - kendi siparişini güncelleyebilir)
router.patch('/:id/payment-status', optionalAuth, async (req, res) => {
  try {
    await connectDB();
    const { paymentStatus, status } = req.body;
    const orderId = req.params.id;
    
    // Siparişi bul
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Sipariş bulunamadı'
      });
    }
    
    // Kullanıcı kontrolü: Sadece kendi siparişini güncelleyebilir veya admin olabilir
    if (req.user) {
      const isOwner = order.userId && order.userId.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Bu siparişi güncelleme yetkiniz yok'
        });
      }
    }
    
    // Sipariş durumunu güncelle
    order.paymentStatus = paymentStatus || order.paymentStatus;
    order.status = status || order.status;
    await order.save();
    const updatedOrder = await Order.findById(orderId);
    
    res.json({
      success: true,
      message: 'Sipariş durumu güncellendi',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Sipariş durumu güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Sipariş güncellenemedi',
      message: error.message
    });
  }
});

// Sipariş güncelle (fotoğrafları ekle)
router.patch('/:id', optionalAuth, asyncHandler(async (req, res) => {
  try {
    // #region agent log
    logDebug({sessionId:'debug-session',runId:'run1',hypothesisId:'H1',location:'order.js:PATCH /:id',message:'PATCH endpoint called',data:{orderId:req.params.id,hasPhotos:!!req.body.photos,photosCount:req.body.photos?.length,hasPhoto:!!req.body.photo}});
    // #endregion
    await connectDB();
    const orderId = req.params.id;
    const { photos, photo, ...updateData } = req.body;
    
    // #region agent log
    logDebug({sessionId:'debug-session',runId:'run1',hypothesisId:'H1',location:'order.js:PATCH /:id',message:'Extracted photos data',data:{photosArrayLength:photos?.length,hasPhoto:!!photo}});
    // #endregion
    
    // Siparişi bul - MongoDB
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Sipariş bulunamadı'
      });
    }
    
    // Kullanıcı kontrolü: Sadece kendi siparişini güncelleyebilir veya admin olabilir
    if (req.user) {
      const isOwner = order.userId && order.userId.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Bu siparişi güncelleme yetkiniz yok'
        });
      }
    }
    
    // Fotoğrafları ekle
    if (photos && Array.isArray(photos)) {
      // #region agent log
      logDebug({sessionId:'debug-session',runId:'run1',hypothesisId:'H1',location:'order.js:PATCH /:id',message:'Adding photos array',data:{photosCount:photos.length,firstPhotoHasBase64:!!photos[0]?.base64}});
      // #endregion
      order.photos = photos;
      if (photos.length > 0) {
        order.photo = photo || photos[0];
      }
    } else if (photo) {
      // #region agent log
      logDebug({sessionId:'debug-session',runId:'run1',hypothesisId:'H1',location:'order.js:PATCH /:id',message:'Adding single photo',data:{hasBase64:!!photo.base64}});
      // #endregion
      order.photo = photo;
      order.photos = [photo];
    }
    
    // Diğer alanları güncelle
    if (updateData.notes) order.notes = updateData.notes;
    if (updateData.paymentStatus) order.paymentStatus = updateData.paymentStatus;
    if (updateData.status) order.status = updateData.status;
    
    // #region agent log
    logDebug({sessionId:'debug-session',runId:'run1',hypothesisId:'H1',location:'order.js:PATCH /:id',message:'Updating order',data:{updateFieldsPhotosCount:order.photos?.length,hasPhoto:!!order.photo}});
    // #endregion
    
    // Siparişi güncelle (MongoDB)
    await order.save();
    const updatedOrder = await Order.findById(orderId);
    
    // #region agent log
    logDebug({sessionId:'debug-session',runId:'run1',hypothesisId:'H1',location:'order.js:PATCH /:id',message:'Order updated',data:{updatedOrderPhotosCount:updatedOrder?.photos?.length,hasPhoto:!!updatedOrder?.photo}});
    // #endregion
    
    res.json({
      success: true,
      message: 'Sipariş güncellendi',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Sipariş güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Sipariş güncellenemedi',
      message: error.message
    });
  }
}));

// Sipariş sil (Admin)
router.delete('/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Sipariş bulunamadı'
      });
    }
    res.json({
      success: true,
      message: 'Sipariş silindi'
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

// Tüm siparişleri sil (Admin)
router.delete('/', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    await Order.deleteMany({});
    res.json({
      success: true,
      message: 'Tüm siparişler silindi'
    });
  } catch (error) {
    console.error('Sipariş silme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Siparişler silinemedi',
      message: error.message
    });
  }
});

export default router;
