import express from 'express';
import Order from '../models/Order.js';
import { getDB } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';
import { validateOrderData, sanitizeInput } from '../utils/validation.js';

const router = express.Router();

// Fiyat hesaplama fonksiyonu
const calculatePrice = (size, quantity, frameType, paperType, colorMode, shippingType, customSize) => {
  // Boyut bazlı fiyat
  let basePrice = 0;
  if (size === 'custom' && customSize) {
    const area = customSize.width * customSize.height;
    basePrice = Math.ceil(area / 100) * 0.5; // cm² başına 0.5 TL
  } else {
    const sizePrices = {
      '10x15': 15,
      '15x20': 18,
      '20x30': 25,
      '30x40': 35
    };
    basePrice = sizePrices[size] || 25;
  }

  // Çerçeve fiyatı
  const framePrices = {
    'none': 0,
    'standard': 10,
    'premium': 20
  };
  const framePrice = framePrices[frameType] || 10;

  // Kağıt fiyatı
  const paperPrices = {
    'glossy': 0,
    'matte': 2,
    'satin': 3
  };
  const paperPrice = paperPrices[paperType] || 0;

  // Renk modu fiyatı
  const colorPrices = {
    'color': 0,
    'blackwhite': -1,
    'sepia': 1
  };
  const colorPrice = colorPrices[colorMode] || 0;

  // Kargo fiyatı
  const shippingPrices = {
    'standard': 15,
    'express': 35
  };
  const shippingPrice = shippingPrices[shippingType] || 15;

  // Toplam fiyat
  let totalPrice = (basePrice + framePrice + paperPrice + colorPrice) * quantity + shippingPrice;

  // İndirimler
  if (quantity >= 10) {
    totalPrice *= 0.85; // %15 indirim
  } else if (quantity >= 5) {
    totalPrice *= 0.90; // %10 indirim
  } else if (quantity >= 3) {
    totalPrice *= 0.95; // %5 indirim
  }

  return Math.round(totalPrice * 100) / 100; // 2 ondalık basamak
};

// Sipariş oluştur
router.post('/', async (req, res) => {
  // SQLite bağlantısını kontrol et
  const db = getDB();
  if (!db) {
    return res.status(503).json({
      success: false,
      error: 'Veritabanı bağlantı hatası',
      message: 'Veritabanı bağlantısı kurulamadı.'
    });
  }

  try {
    const {
      photo,
      size,
      customSize,
      quantity,
      frameType,
      paperType,
      colorMode,
      shippingType,
      email,
      address,
      phone,
      firstName,
      lastName,
      notes
    } = req.body;

    // Temel validasyon
    if (!photo || !size || !email || !address) {
      return res.status(400).json({
        success: false,
        error: 'Eksik bilgi',
        message: 'Fotoğraf, boyut, e-posta ve adres zorunludur'
      });
    }

    // Güvenlik: Input sanitization
    const sanitizedData = {
      email: sanitizeInput(email.trim()),
      address: sanitizeInput(address.trim()),
      phone: phone ? sanitizeInput(phone.trim()) : '',
      firstName: firstName ? sanitizeInput(firstName.trim()) : 'Müşteri',
      lastName: lastName ? sanitizeInput(lastName.trim()) : 'Müşteri',
      notes: notes ? sanitizeInput(notes.trim()) : '',
      size: size.trim(),
      quantity: parseInt(quantity) || 1,
      frameType: frameType || 'standard',
      paperType: paperType || 'glossy',
      colorMode: colorMode || 'color',
      shippingType: shippingType || 'standard',
      customSize: size === 'custom' ? customSize : undefined,
      photo: {
        filename: photo.filename || photo.originalName || 'photo.jpg',
        originalName: photo.originalName || 'photo.jpg',
        base64: photo.base64,
        mimetype: photo.mimetype,
        size: photo.size
      }
    };

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
      sanitizedData.frameType,
      sanitizedData.paperType,
      sanitizedData.colorMode,
      sanitizedData.shippingType,
      sanitizedData.customSize
    );

    // Sipariş oluştur
    const orderData = {
      photo: sanitizedData.photo,
      size: sanitizedData.size,
      customSize: sanitizedData.customSize,
      quantity: sanitizedData.quantity,
      frameType: sanitizedData.frameType,
      paperType: sanitizedData.paperType,
      colorMode: sanitizedData.colorMode,
      shippingType: sanitizedData.shippingType,
      customerInfo: {
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        address: sanitizedData.address
      },
      price,
      status: sanitizedData.status || 'Yeni',
      paymentStatus: sanitizedData.paymentStatus || 'pending',
      notes: sanitizedData.notes
    };

    const savedOrder = Order.create(orderData);

    res.status(201).json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      order: savedOrder
    });
  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);
    
    // Güvenlik: Production'da hassas bilgi sızıntısını önle
    const errorResponse = {
      success: false,
      error: 'Sipariş oluşturulurken bir hata oluştu',
      message: 'Lütfen tekrar deneyin'
    };
    
    // Sadece development modunda detaylı hata göster
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error.message;
      errorResponse.stack = error.stack;
    }
    
    res.status(500).json(errorResponse);
  }
});

// Tüm siparişleri getir (SADECE ADMIN)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const orders = Order.findAll(true); // Admin için çözülmüş
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Siparişler getirilirken hata:', error);
    
    const errorResponse = {
      success: false,
      error: 'Siparişler getirilirken bir hata oluştu',
      message: 'Lütfen tekrar deneyin'
    };
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error.message;
    }
    
    res.status(500).json(errorResponse);
  }
});

// Tek sipariş getir (SADECE ADMIN)
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const order = Order.findById(req.params.id, true); // Admin için çözülmüş
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
    console.error('Sipariş getirilirken hata:', error);
    
    const errorResponse = {
      success: false,
      error: 'Sipariş getirilirken bir hata oluştu',
      message: 'Lütfen tekrar deneyin'
    };
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error.message;
    }
    
    res.status(500).json(errorResponse);
  }
});

// Tüm siparişleri sil (SADECE ADMIN)
router.delete('/all', requireAdmin, async (req, res) => {
  try {
    const deletedCount = Order.deleteAll();
    console.log(`🗑️ ${deletedCount} sipariş silindi`);
    res.json({
      success: true,
      message: `${deletedCount} sipariş başarıyla silindi`,
      deletedCount
    });
  } catch (error) {
    console.error('Siparişler silinirken hata:', error);
    
    const errorResponse = {
      success: false,
      error: 'Siparişler silinirken bir hata oluştu',
      message: 'Lütfen tekrar deneyin'
    };
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error.message;
    }
    
    res.status(500).json(errorResponse);
  }
});

export default router;

