import express from 'express';
import { connectDB } from '../config/database.js';
import Announcement from '../models/AnnouncementSchema.js';
import { requireAdminRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * Aktif popup'ları getir (Public)
 */
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const { page = 'all', userId } = req.query;

    const now = new Date();
    const query = {
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    };

    // Sayfa filtresi
    if (page !== 'all') {
      query.$or = [
        { showOnPages: 'all' },
        { showOnPages: page }
      ];
    }

    const announcements = await Announcement.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(5); // Maksimum 5 popup

    // View count artır
    if (announcements.length > 0) {
      await Announcement.updateMany(
        { _id: { $in: announcements.map(a => a._id) } },
        { $inc: { viewCount: 1 } }
      );
    }

    res.json({
      success: true,
      announcements: announcements.map(a => ({
        id: a._id.toString(),
        title: a.title,
        message: a.message,
        type: a.type,
        image: a.image,
        link: a.link,
        buttonText: a.buttonText,
        displayFrequency: a.displayFrequency,
        priority: a.priority
      }))
    });
  } catch (error) {
    console.error('Popup getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Popup\'lar getirilemedi',
      message: error.message
    });
  }
});

/**
 * Popup tıklama takibi (Public)
 */
router.post('/:id/click', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;

    await Announcement.findByIdAndUpdate(id, {
      $inc: { clickCount: 1 }
    });

    res.json({
      success: true,
      message: 'Tıklama kaydedildi'
    });
  } catch (error) {
    console.error('Popup tıklama hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Tıklama kaydedilemedi',
      message: error.message
    });
  }
});

/**
 * Tüm popup'ları getir (Admin)
 */
router.get('/admin/all', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const { type, isActive } = req.query;

    const query = {};
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const announcements = await Announcement.find(query)
      .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      announcements
    });
  } catch (error) {
    console.error('Admin popup getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Popup\'lar getirilemedi',
      message: error.message
    });
  }
});

/**
 * Yeni popup oluştur (Admin)
 */
router.post('/admin', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const {
      title,
      message,
      type,
      image,
      link,
      buttonText,
      isActive,
      startDate,
      endDate,
      showOnPages,
      targetAudience,
      displayFrequency,
      priority
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Başlık ve mesaj zorunludur'
      });
    }

    const announcement = await Announcement.create({
      title,
      message,
      type: type || 'info',
      image: image || null,
      link: link || null,
      buttonText: buttonText || 'Tamam',
      isActive: isActive !== undefined ? isActive : true,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      showOnPages: showOnPages || ['all'],
      targetAudience: targetAudience || 'all',
      displayFrequency: displayFrequency || 'once',
      priority: priority || 0
    });

    res.status(201).json({
      success: true,
      message: 'Popup oluşturuldu',
      announcement
    });
  } catch (error) {
    console.error('Popup oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Popup oluşturulamadı',
      message: error.message
    });
  }
});

/**
 * Popup güncelle (Admin)
 */
router.put('/admin/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const updateData = req.body;

    // Date fields'i dönüştür
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Popup bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Popup güncellendi',
      announcement
    });
  } catch (error) {
    console.error('Popup güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Popup güncellenemedi',
      message: error.message
    });
  }
});

/**
 * Popup sil (Admin)
 */
router.delete('/admin/:id', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Popup bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Popup silindi'
    });
  } catch (error) {
    console.error('Popup silme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Popup silinemedi',
      message: error.message
    });
  }
});

export default router;
