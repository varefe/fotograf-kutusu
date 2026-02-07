import express from 'express';
import { connectDB } from '../config/database.js';
import Category from '../models/CategorySchema.js';
import { requireAdminRole } from '../middleware/auth.js';
import { sanitizeInput } from '../utils/validation.js';

const router = express.Router();

/**
 * Tüm kategorileri getir (Public - galeri/ürün formu için)
 */
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const categories = await Category.find({})
      .sort({ order: 1, name: 1 })
      .lean();
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Kategori listeleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Kategoriler getirilemedi',
      message: error.message
    });
  }
});

/**
 * Admin: Tüm kategorileri getir
 */
router.get('/admin/all', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const categories = await Category.find({})
      .sort({ order: 1, name: 1 })
      .lean();
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Admin kategori listeleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Kategoriler getirilemedi',
      message: error.message
    });
  }
});

/**
 * Admin: Yeni kategori ekle
 */
router.post('/admin', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const { name, slug, order } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Kategori adı zorunludur'
      });
    }

    const slugValue = slug && slug.trim()
      ? slug.trim().toLowerCase().replace(/\s+/g, '-')
      : name.trim().toLowerCase().replace(/\s+/g, '-');

    const category = new Category({
      name: sanitizeInput(name.trim()),
      slug: slugValue,
      order: parseInt(order, 10) || 0
    });
    await category.save();

    res.status(201).json({
      success: true,
      message: 'Kategori eklendi',
      category: {
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        order: category.order
      }
    });
  } catch (error) {
    console.error('Kategori ekleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Kategori eklenemedi',
      message: error.message
    });
  }
});

/**
 * Admin: Kategori güncelle
 */
router.put('/admin/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const { name, slug, order } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Kategori bulunamadı'
      });
    }

    if (name !== undefined) category.name = sanitizeInput(name.trim());
    if (slug !== undefined) category.slug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (order !== undefined) category.order = parseInt(order, 10) || 0;
    category.updatedAt = new Date();
    await category.save();

    res.json({
      success: true,
      message: 'Kategori güncellendi',
      category: {
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        order: category.order
      }
    });
  } catch (error) {
    console.error('Kategori güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Kategori güncellenemedi',
      message: error.message
    });
  }
});

/**
 * Admin: Kategori sil
 */
router.delete('/admin/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Kategori bulunamadı'
      });
    }
    res.json({
      success: true,
      message: 'Kategori silindi'
    });
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Kategori silinemedi',
      message: error.message
    });
  }
});

export default router;
