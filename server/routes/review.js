import express from 'express';
import { connectDB } from '../config/database.js';
import Review from '../models/ReviewSchema.js';
import { requireAuth } from '../middleware/userAuth.js';
import { requireAdminRole } from '../middleware/auth.js';
import { sanitizeInput } from '../utils/validation.js';

const router = express.Router();

// Tüm onaylanmış yorumları getir (Public)
router.get('/', async (req, res) => {
  try {
    await connectDB();
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find({ isVisible: true, isApproved: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Review.countDocuments({ isVisible: true, isApproved: true });
    
    // Ortalama puanı hesapla
    const avgRating = await Review.aggregate([
      { $match: { isVisible: true, isApproved: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        averageRating: avgRating[0]?.avgRating || 0,
        totalReviews: avgRating[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Yorum listeleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Yorumlar getirilemedi',
      message: error.message
    });
  }
});

// Kullanıcının yorumunu oluştur
router.post('/', requireAuth, async (req, res) => {
  try {
    await connectDB();
    
    const { rating, comment, photos, orderId } = req.body;
    
    // Validasyon
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Puan 1-5 arasında olmalıdır'
      });
    }
    
    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Yorum en az 10 karakter olmalıdır'
      });
    }
    
    // Kullanıcının daha önce yorum yapıp yapmadığını kontrol et
    const existingReview = await Review.findOne({ userId: req.user.id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'Zaten bir yorum yaptınız. Yorumunuzu düzenleyebilirsiniz.'
      });
    }
    
    const review = new Review({
      userId: req.user.id,
      userName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Kullanıcı',
      userEmail: req.user.email,
      rating: parseInt(rating),
      comment: sanitizeInput(comment),
      photos: photos || [],
      orderId: orderId || null,
      isApproved: false,
      isVisible: false
    });
    
    await review.save();
    
    res.status(201).json({
      success: true,
      message: 'Yorumunuz başarıyla gönderildi. Admin onayından sonra yayınlanacaktır.',
      review
    });
  } catch (error) {
    console.error('Yorum oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Yorum oluşturulamadı',
      message: error.message
    });
  }
});

// Kullanıcının kendi yorumunu güncelle
router.put('/:id', requireAuth, async (req, res) => {
  try {
    await connectDB();
    
    const { rating, comment, photos } = req.body;
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Yorum bulunamadı'
      });
    }
    
    // Sadece kendi yorumunu güncelleyebilir
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Bu yorumu güncelleme yetkiniz yok'
      });
    }
    
    if (rating) review.rating = parseInt(rating);
    if (comment) review.comment = sanitizeInput(comment);
    if (photos) review.photos = photos;
    review.isApproved = false; // Güncelleme sonrası tekrar onay bekler
    review.isVisible = false;
    review.updatedAt = new Date();
    
    await review.save();
    
    res.json({
      success: true,
      message: 'Yorumunuz güncellendi. Admin onayından sonra yayınlanacaktır.',
      review
    });
  } catch (error) {
    console.error('Yorum güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Yorum güncellenemedi',
      message: error.message
    });
  }
});

// Kullanıcının kendi yorumunu sil
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await connectDB();
    
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Yorum bulunamadı'
      });
    }
    
    // Sadece kendi yorumunu silebilir
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Bu yorumu silme yetkiniz yok'
      });
    }
    
    await Review.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Yorumunuz silindi'
    });
  } catch (error) {
    console.error('Yorum silme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Yorum silinemedi',
      message: error.message
    });
  }
});

// Kullanıcının kendi yorumunu getir
router.get('/my', requireAuth, async (req, res) => {
  try {
    await connectDB();
    
    const review = await Review.findOne({ userId: req.user.id });
    
    res.json({
      success: true,
      review: review || null
    });
  } catch (error) {
    console.error('Yorum getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Yorum getirilemedi',
      message: error.message
    });
  }
});

// Admin: Tüm yorumları getir (onay bekleyenler dahil)
router.get('/admin/all', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = req.query.filter || 'all'; // all, pending, approved, rejected
    
    let query = {};
    if (filter === 'pending') {
      query = { isApproved: false };
    } else if (filter === 'approved') {
      query = { isApproved: true, isVisible: true };
    } else if (filter === 'rejected') {
      query = { isApproved: false, isVisible: false };
    }
    
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Review.countDocuments(query);
    
    res.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin yorum listeleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Yorumlar getirilemedi',
      message: error.message
    });
  }
});

// Admin: Yorumu onayla/reddet
router.patch('/admin/:id/approve', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    
    const { isApproved, isVisible } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: isApproved !== undefined ? isApproved : true,
        isVisible: isVisible !== undefined ? isVisible : (isApproved !== false),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Yorum bulunamadı'
      });
    }
    
    res.json({
      success: true,
      message: isApproved ? 'Yorum onaylandı ve yayınlandı' : 'Yorum reddedildi',
      review
    });
  } catch (error) {
    console.error('Yorum onaylama hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Yorum güncellenemedi',
      message: error.message
    });
  }
});

// Admin: Yorumu sil
router.delete('/admin/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    
    await Review.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Yorum silindi'
    });
  } catch (error) {
    console.error('Yorum silme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Yorum silinemedi',
      message: error.message
    });
  }
});

export default router;
