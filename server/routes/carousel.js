import express from 'express';
import { connectDB } from '../config/database.js';
import CarouselSlide from '../models/CarouselSchema.js';
import { requireAdminRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * Ana sayfa carousel slaytları (Public)
 */
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const slides = await CarouselSlide.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json({
      success: true,
      slides: slides.map((s, i) => ({
        id: s._id.toString(),
        image: s.image,
        alt: s.alt || '',
        title: s.title || '',
        subtitle: s.subtitle || '',
        order: s.order ?? i
      }))
    });
  } catch (error) {
    console.error('Carousel getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Carousel yüklenemedi',
      message: error.message
    });
  }
});

/**
 * Tüm slaytlar (Admin)
 */
router.get('/admin/all', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const slides = await CarouselSlide.find({}).sort({ order: 1, createdAt: 1 }).lean();
    res.json({
      success: true,
      slides: slides.map(s => ({
        id: s._id.toString(),
        _id: s._id.toString(),
        image: s.image,
        alt: s.alt || '',
        title: s.title || '',
        subtitle: s.subtitle || '',
        order: s.order ?? 0,
        isActive: s.isActive !== false,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      }))
    });
  } catch (error) {
    console.error('Carousel admin list hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Carousel listelenemedi',
      message: error.message
    });
  }
});

/**
 * Yeni slayt ekle (Admin)
 */
router.post('/admin', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const { image, alt, title, subtitle, order } = req.body;
    if (!image || typeof image !== 'string' || !image.trim()) {
      return res.status(400).json({ success: false, error: 'Görsel URL zorunludur' });
    }
    const maxOrder = await CarouselSlide.findOne({}).sort({ order: -1 }).select('order').lean();
    const newOrder = order != null ? Number(order) : (maxOrder?.order ?? 0) + 1;
    const slide = await CarouselSlide.create({
      image: image.trim(),
      alt: (alt || '').trim(),
      title: (title || '').trim(),
      subtitle: (subtitle || '').trim(),
      order: newOrder
    });
    res.status(201).json({
      success: true,
      message: 'Slayt eklendi',
      slide: {
        id: slide._id.toString(),
        _id: slide._id.toString(),
        image: slide.image,
        alt: slide.alt,
        title: slide.title,
        subtitle: slide.subtitle,
        order: slide.order,
        isActive: slide.isActive,
        createdAt: slide.createdAt,
        updatedAt: slide.updatedAt
      }
    });
  } catch (error) {
    console.error('Carousel ekleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Slayt eklenemedi',
      message: error.message
    });
  }
});

/**
 * Slayt güncelle (Admin)
 */
router.put('/admin/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { image, alt, title, subtitle, order, isActive } = req.body;
    const update = {};
    if (image !== undefined) update.image = String(image).trim();
    if (alt !== undefined) update.alt = String(alt).trim();
    if (title !== undefined) update.title = String(title).trim();
    if (subtitle !== undefined) update.subtitle = String(subtitle).trim();
    if (order !== undefined) update.order = Number(order);
    if (isActive !== undefined) update.isActive = !!isActive;
    update.updatedAt = new Date();

    const slide = await CarouselSlide.findByIdAndUpdate(id, update, { new: true });
    if (!slide) {
      return res.status(404).json({ success: false, error: 'Slayt bulunamadı' });
    }
    res.json({
      success: true,
      message: 'Slayt güncellendi',
      slide: {
        id: slide._id.toString(),
        _id: slide._id.toString(),
        image: slide.image,
        alt: slide.alt,
        title: slide.title,
        subtitle: slide.subtitle,
        order: slide.order,
        isActive: slide.isActive,
        createdAt: slide.createdAt,
        updatedAt: slide.updatedAt
      }
    });
  } catch (error) {
    console.error('Carousel güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Slayt güncellenemedi',
      message: error.message
    });
  }
});

/**
 * Slayt sil (Admin)
 */
router.delete('/admin/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const deleted = await CarouselSlide.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Slayt bulunamadı' });
    }
    res.json({ success: true, message: 'Slayt silindi' });
  } catch (error) {
    console.error('Carousel silme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Slayt silinemedi',
      message: error.message
    });
  }
});

export default router;
