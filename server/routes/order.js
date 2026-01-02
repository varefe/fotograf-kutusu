import express from 'express';
import Order from '../models/Order.js';
import { connectDB } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireAuth, optionalAuth } from '../middleware/userAuth.js';
import { validateOrderData, sanitizeInput } from '../utils/validation.js';

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
    const orders = await Order.findByUserId(req.user.id, false); // Admin değil
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

// Sipariş oluştur (opsiyonel auth - giriş yapmış kullanıcılar için)
router.post('/', optionalAuth, async (req, res) => {
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
    const {
      photo,
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
      notes
    } = req.body;

    // Veri temizleme
    const sanitizedData = {
      photo: photo ? sanitizeInput(photo) : null,
      size: sanitizeInput(size),
      customSize: customSize ? {
        width: parseFloat(sanitizeInput(customSize.width)),
        height: parseFloat(sanitizeInput(customSize.height))
      } : undefined,
      quantity: parseInt(sanitizeInput(quantity)) || 15,
      shippingType: sanitizeInput(shippingType) || 'standard',
      customerInfo: {
        firstName: firstName ? sanitizeInput(firstName) : 'Müşteri',
        lastName: lastName ? sanitizeInput(lastName) : 'Müşteri',
        email: email ? sanitizeInput(email) : (customerInfo?.email ? sanitizeInput(customerInfo.email) : ''),
        phone: phone ? sanitizeInput(phone) : (customerInfo?.phone ? sanitizeInput(customerInfo.phone) : ''),
        address: address ? sanitizeInput(address) : (customerInfo?.address ? sanitizeInput(customerInfo.address) : '')
      },
      notes: notes ? sanitizeInput(notes) : ''
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

    // Detaylı validasyon
    const validation = validateOrderData(sanitizedData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validasyon hatası',
        message: 'Girilen bilgiler geçersiz',
        details: validation.errors
      });
    }

    // Fiyat hesapla
    const price = calculatePrice(
      sanitizedData.size,
      sanitizedData.quantity,
      sanitizedData.shippingType,
      sanitizedData.customSize
    );

    // Kullanıcı ID'sini al (opsiyonel - giriş yapmış kullanıcılar için)
    let userId = null;
    if (req.user && req.user.id) {
      userId = req.user.id;
    }

    // Sipariş oluştur
    const orderData = {
      userId: userId, // Giriş yapmış kullanıcı için
      photo: sanitizedData.photo,
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
      price,
      status: 'Yeni',
      paymentStatus: 'pending',
      notes: sanitizedData.notes
    };

    const savedOrder = await Order.create(orderData);

    res.status(201).json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      order: savedOrder
    });
  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Sipariş oluşturulamadı',
      message: error.message
    });
  }
});

// Tüm siparişleri getir (Admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const orders = await Order.findAll();
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
router.get('/:id', requireAdmin, async (req, res) => {
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
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const { status } = req.body;
    const updatedOrder = await Order.updateStatus(req.params.id, status);
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        error: 'Sipariş bulunamadı'
      });
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

// Sipariş sil (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const deleted = await Order.delete(req.params.id);
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
router.delete('/', requireAdmin, async (req, res) => {
  try {
    await connectDB();
    await Order.deleteAll();
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
