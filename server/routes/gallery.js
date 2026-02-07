import express from 'express';
import { connectDB } from '../config/database.js';
import Gallery from '../models/GallerySchema.js';
import { requireAdminRole } from '../middleware/auth.js';
import { sanitizeInput } from '../utils/validation.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer config (memory storage for base64)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Tüm görünür galeri öğelerini getir (Public)
router.get('/', async (req, res) => {
  try {
    await connectDB();
    
    const category = req.query.category || 'all';
    const featured = req.query.featured === 'true';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    let query = { isVisible: true };
    
    if (category !== 'all') {
      query.category = category;
    }
    
    if (featured) {
      query.isFeatured = true;
    }
    
    const galleries = await Gallery.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Gallery.countDocuments(query);
    
    // Kategorilere göre sayıları getir
    const categoryCounts = await Gallery.aggregate([
      { $match: { isVisible: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      galleries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      categoryCounts: categoryCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Galeri listeleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Galeri getirilemedi',
      message: error.message
    });
  }
});

// Admin: Tüm galeri öğelerini getir (/:id'den önce tanımlanmalı, yoksa "admin" id olarak yakalanır)
router.get('/admin/all', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const category = req.query.category || 'all';
    
    let query = {};
    if (category !== 'all') {
      query.category = category;
    }
    
    const galleries = await Gallery.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Gallery.countDocuments(query);
    
    res.json({
      success: true,
      galleries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin galeri listeleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Galeri getirilemedi',
      message: error.message
    });
  }
});

// Tek galeri öğesini getir (Public) - /admin/* route'larından sonra
router.get('/:id', async (req, res) => {
  try {
    await connectDB();
    
    const gallery = await Gallery.findById(req.params.id);
    
    if (!gallery || !gallery.isVisible) {
      return res.status(404).json({
        success: false,
        error: 'Galeri öğesi bulunamadı'
      });
    }
    
    // Görüntülenme sayısını artır
    gallery.viewCount = (gallery.viewCount || 0) + 1;
    await gallery.save();
    
    res.json({
      success: true,
      gallery
    });
  } catch (error) {
    console.error('Galeri getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Galeri getirilemedi',
      message: error.message
    });
  }
});

// Admin: Galeri öğesi oluştur
router.post('/admin', requireAdminRole, upload.single('image'), async (req, res) => {
  try {
    await connectDB();
    
    const { title, description, category, size, customSize, tags, isFeatured, isVisible, order } = req.body;
    
    if (!title || !category || !size) {
      return res.status(400).json({
        success: false,
        error: 'Başlık, kategori ve boyut zorunludur'
      });
    }
    
    let imageData = null;
    
    // Base64 veya file upload
    if (req.body.base64) {
      // Base64 string olarak geliyor
      imageData = {
        filename: req.body.filename || `gallery-${Date.now()}.jpg`,
        originalName: req.body.originalName || 'gallery-image.jpg',
        base64: req.body.base64,
        mimetype: req.body.mimetype || 'image/jpeg',
        size: req.body.imageSize ?? req.body.size ?? 0
      };
    } else if (req.file) {
      // Multer ile yüklenen dosya
      imageData = {
        filename: req.file.originalname,
        originalName: req.file.originalname,
        base64: req.file.buffer.toString('base64'),
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    } else {
      return res.status(400).json({
        success: false,
        error: 'Görsel gerekli'
      });
    }
    
    const gallery = new Gallery({
      title: sanitizeInput(title),
      description: description ? sanitizeInput(description) : '',
      image: imageData,
      category: category,
      size: sanitizeInput(size),
      customSize: customSize ? {
        width: parseFloat(customSize.width),
        height: parseFloat(customSize.height)
      } : undefined,
      tags: tags ? (Array.isArray(tags) ? tags.map(t => sanitizeInput(t)) : [sanitizeInput(tags)]) : [],
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isVisible: isVisible !== 'false' && isVisible !== false,
      order: parseInt(order) || 0
    });
    
    await gallery.save();
    
    res.status(201).json({
      success: true,
      message: 'Galeri öğesi başarıyla oluşturuldu',
      gallery
    });
  } catch (error) {
    console.error('Galeri oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Galeri oluşturulamadı',
      message: error.message
    });
  }
});

// Admin: Galeri öğesini güncelle
router.put('/admin/:id', requireAdminRole, upload.single('image'), async (req, res) => {
  try {
    await connectDB();
    
    const { title, description, category, size, customSize, tags, isFeatured, isVisible, order } = req.body;
    
    const gallery = await Gallery.findById(req.params.id);
    
    if (!gallery) {
      return res.status(404).json({
        success: false,
        error: 'Galeri öğesi bulunamadı'
      });
    }
    
    if (title) gallery.title = sanitizeInput(title);
    if (description !== undefined) gallery.description = sanitizeInput(description);
    if (category) gallery.category = category;
    if (size) gallery.size = sanitizeInput(size);
    if (customSize) {
      gallery.customSize = {
        width: parseFloat(customSize.width),
        height: parseFloat(customSize.height)
      };
    }
    if (tags) {
      gallery.tags = Array.isArray(tags) ? tags.map(t => sanitizeInput(t)) : [sanitizeInput(tags)];
    }
    if (isFeatured !== undefined) gallery.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isVisible !== undefined) gallery.isVisible = isVisible !== 'false' && isVisible !== false;
    if (order !== undefined) gallery.order = parseInt(order);
    
    // Yeni görsel varsa güncelle
    if (req.body.base64) {
      gallery.image = {
        filename: req.body.filename || gallery.image.filename,
        originalName: req.body.originalName || gallery.image.originalName,
        base64: req.body.base64,
        mimetype: req.body.mimetype || gallery.image.mimetype,
        size: req.body.imageSize ?? req.body.size ?? gallery.image.size
      };
    } else if (req.file) {
      gallery.image = {
        filename: req.file.originalname,
        originalName: req.file.originalname,
        base64: req.file.buffer.toString('base64'),
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }
    
    gallery.updatedAt = new Date();
    await gallery.save();
    
    res.json({
      success: true,
      message: 'Galeri öğesi güncellendi',
      gallery
    });
  } catch (error) {
    console.error('Galeri güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Galeri güncellenemedi',
      message: error.message
    });
  }
});

// Admin: Galeri öğesini sil
router.delete('/admin/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    
    await Gallery.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Galeri öğesi silindi'
    });
  } catch (error) {
    console.error('Galeri silme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Galeri silinemedi',
      message: error.message
    });
  }
});

export default router;
