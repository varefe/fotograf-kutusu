import express from 'express';
import { connectDB } from '../config/database.js';
import User from '../models/UserSchema.js';
import { requireAuth } from '../middleware/userAuth.js';

const router = express.Router();

// Kullanıcının bildirim tercihlerini getir
router.get('/preferences', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      preferences: user.notificationPreferences || {
        email: {
          orderStatus: true,
          orderShipped: true,
          orderDelivered: true,
          promotions: true,
          newsletter: false
        },
        sms: {
          orderStatus: false,
          orderShipped: false,
          orderDelivered: false
        },
        push: {
          enabled: true,
          orderStatus: true,
          promotions: true
        }
      }
    });
  } catch (error) {
    console.error('Bildirim tercihleri getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Bildirim tercihleri getirilemedi',
      message: error.message
    });
  }
});

// Kullanıcının bildirim tercihlerini güncelle
router.put('/preferences', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const { email, sms, push } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    if (email) {
      user.notificationPreferences = user.notificationPreferences || {};
      user.notificationPreferences.email = {
        ...user.notificationPreferences.email,
        ...email
      };
    }

    if (sms) {
      user.notificationPreferences = user.notificationPreferences || {};
      user.notificationPreferences.sms = {
        ...user.notificationPreferences.sms,
        ...sms
      };
    }

    if (push) {
      user.notificationPreferences = user.notificationPreferences || {};
      user.notificationPreferences.push = {
        ...user.notificationPreferences.push,
        ...push
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Bildirim tercihleri güncellendi',
      preferences: user.notificationPreferences
    });
  } catch (error) {
    console.error('Bildirim tercihleri güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Bildirim tercihleri güncellenemedi',
      message: error.message
    });
  }
});

// Push notification subscription kaydet
router.post('/push/subscribe', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz subscription'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    user.pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth
      }
    };

    // Push notification'ı aktif et
    if (!user.notificationPreferences) {
      user.notificationPreferences = {};
    }
    if (!user.notificationPreferences.push) {
      user.notificationPreferences.push = {};
    }
    user.notificationPreferences.push.enabled = true;

    await user.save();

    res.json({
      success: true,
      message: 'Push notification aboneliği kaydedildi'
    });
  } catch (error) {
    console.error('Push subscription kaydetme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Push subscription kaydedilemedi',
      message: error.message
    });
  }
});

// Push notification subscription kaldır
router.delete('/push/unsubscribe', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    user.pushSubscription = null;
    if (user.notificationPreferences?.push) {
      user.notificationPreferences.push.enabled = false;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Push notification aboneliği kaldırıldı'
    });
  } catch (error) {
    console.error('Push subscription kaldırma hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Push subscription kaldırılamadı',
      message: error.message
    });
  }
});

export default router;
