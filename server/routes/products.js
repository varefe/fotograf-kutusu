import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/database.js';
import Product from '../models/ProductSchema.js';
import { requireAdminRole } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const UPLOAD_DIR = path.join(path.dirname(__dirname), '..', 'server-uploads', 'products');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.jpg').toLowerCase().replace(/jpeg/, 'jpg');
    cb(null, `product-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error('Sadece resim dosyaları (JPEG, PNG, GIF, WebP) yüklenebilir'));
  }
});

const DEFAULT_PRODUCTS = [
  { size: '10x15', name: '10x15 cm', description: 'Küçük boyut', unitPrice: 16, totalPrice: 240, features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat'], image: null, featured: false, order: 1 },
  { size: '15x20', name: '15x20 cm', description: 'Orta boyut', unitPrice: 19, totalPrice: 285, features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat'], image: null, featured: false, order: 2 },
  { size: '20x30', name: '20x30 cm', description: 'Popüler boyut', unitPrice: 26, totalPrice: 390, features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat'], image: null, featured: true, order: 3 },
  { size: '30x40', name: '30x40 cm', description: 'Büyük boyut', unitPrice: 36, totalPrice: 540, features: ['Yüksek kalite baskı', 'Çerçeve dahil', '15+ adet toplu fiyat'], image: null, featured: false, order: 4 }
];

/**
 * Ürün listesi (Public - ana sayfa için)
 */
router.get('/', async (req, res) => {
  try {
    await connectDB();
    let count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(DEFAULT_PRODUCTS);
    }
    const products = await Product.find({ isActive: true })
      .sort({ order: 1, size: 1 })
      .lean();
    res.json({
      success: true,
      products: products.map(p => ({
        id: p._id.toString(),
        size: p.size,
        name: p.name,
        description: p.description,
        unitPrice: p.unitPrice,
        totalPrice: p.totalPrice,
        features: p.features || [],
        image: p.image,
        featured: !!p.featured
      }))
    });
  } catch (error) {
    console.error('Ürün listesi hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Ürünler getirilemedi',
      message: error.message
    });
  }
});

/**
 * Tüm ürünler (Admin) - koleksiyon boşsa varsayılan ürünleri ekle
 */
router.get('/admin/all', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    let count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(DEFAULT_PRODUCTS);
    }
    const products = await Product.find({}).sort({ order: 1, size: 1 }).lean();
    res.json({
      success: true,
      products: products.map(p => ({
        ...p,
        id: p._id.toString()
      }))
    });
  } catch (error) {
    console.error('Admin ürün listesi hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Ürünler getirilemedi',
      message: error.message
    });
  }
});

/**
 * Ürün görseli yükle (Admin) - bilgisayardan dosya
 */
router.post('/admin/upload', requireAdminRole, (req, res, next) => {
  try {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, error: err.message || 'Dosya yüklenemedi' });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Görsel dosyası seçin' });
      }
      const url = '/uploads/products/' + req.file.filename;
      res.json({ success: true, url });
    });
  } catch (e) {
    console.error('Ürün görseli yükleme hatası:', e);
    res.status(500).json({ success: false, error: 'Sunucu hatası', message: e?.message || 'Yükleme işlenemedi' });
  }
});

/**
 * Yeni ürün (Admin)
 */
router.post('/admin', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const { size, name, description, unitPrice, totalPrice, features, image, featured, order, isActive } = req.body;
    if (!size || !name || unitPrice == null || totalPrice == null) {
      return res.status(400).json({
        success: false,
        error: 'size, name, unitPrice ve totalPrice zorunludur'
      });
    }
    const product = await Product.create({
      size,
      name,
      description: description || '',
      unitPrice: Number(unitPrice),
      totalPrice: Number(totalPrice),
      features: Array.isArray(features) ? features : [],
      image: image || null,
      featured: !!featured,
      order: order != null ? Number(order) : 0,
      isActive: isActive !== false
    });
    res.status(201).json({
      success: true,
      message: 'Ürün oluşturuldu',
      product: { ...product.toObject(), id: product._id.toString() }
    });
  } catch (error) {
    console.error('Ürün oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Ürün oluşturulamadı',
      message: error.message
    });
  }
});

/**
 * Ürün güncelle (Admin)
 */
router.put('/admin/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const updateData = req.body;
    if (updateData.unitPrice != null) updateData.unitPrice = Number(updateData.unitPrice);
    if (updateData.totalPrice != null) updateData.totalPrice = Number(updateData.totalPrice);
    if (updateData.order != null) updateData.order = Number(updateData.order);
    if (updateData.features != null && !Array.isArray(updateData.features)) updateData.features = [];
    updateData.updatedAt = new Date();
    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Ürün bulunamadı'
      });
    }
    res.json({
      success: true,
      message: 'Ürün güncellendi',
      product: { ...product.toObject(), id: product._id.toString() }
    });
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Ürün güncellenemedi',
      message: error.message
    });
  }
});

/**
 * Ürün sil (Admin)
 */
router.delete('/admin/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Ürün bulunamadı'
      });
    }
    res.json({
      success: true,
      message: 'Ürün silindi'
    });
  } catch (error) {
    console.error('Ürün silme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Ürün silinemedi',
      message: error.message
    });
  }
});

export default router;
