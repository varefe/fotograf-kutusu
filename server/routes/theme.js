import express from 'express';
import { connectDB } from '../config/database.js';
import SiteTheme from '../models/SiteThemeSchema.js';
import { requireAdminRole } from '../middleware/auth.js';

const router = express.Router();

const DEFAULT_THEME = {
  primaryColor: '#2563eb',
  primaryDark: '#1d4ed8',
  primaryLight: '#93c5fd',
  secondaryColor: '#14b8a6',
  textColor: '#0f172a',
  textLight: '#64748b',
  bgColor: '#ffffff',
  bgLight: '#f8fafc',
  bgGray: '#f1f5f9',
  borderColor: '#e2e8f0'
};

/** Public: Mevcut tema (varsayılan veya kayıtlı) */
router.get('/', async (req, res) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6e10026d-a3f6-4a76-a74c-bdc502ce31cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'theme.js:GET/',message:'theme GET handler entered',data:{path:req.path},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
  // #endregion
  try {
    await connectDB();
    const doc = await SiteTheme.findOne().sort({ updatedAt: -1 }).lean();
    if (doc) {
      const theme = { ...DEFAULT_THEME, ...doc };
      delete theme._id;
      delete theme.__v;
      return res.json({ success: true, theme });
    }
    res.json({ success: true, theme: { ...DEFAULT_THEME } });
  } catch (err) {
    console.error('Theme get error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/** Admin: Tema güncelle (body.reset === true ise varsayılana sıfırla) */
router.put('/', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    if (req.body && req.body.reset === true) {
      await SiteTheme.updateOne({}, { $set: { ...DEFAULT_THEME, updatedAt: new Date() } }, { upsert: true });
      const theme = { ...DEFAULT_THEME };
      return res.json({ success: true, message: 'Renkler varsayılana döndürüldü', theme });
    }
    const keys = ['primaryColor', 'primaryDark', 'primaryLight', 'secondaryColor', 'textColor', 'textLight', 'bgColor', 'bgLight', 'bgGray', 'borderColor'];
    let doc = await SiteTheme.findOne().lean();
    if (!doc) {
      doc = await SiteTheme.create(DEFAULT_THEME);
      doc = doc.toObject ? doc.toObject() : doc;
    }
    const updates = {};
    keys.forEach(k => {
      if (req.body[k] != null && typeof req.body[k] === 'string' && req.body[k].trim()) {
        updates[k] = req.body[k].trim();
      }
    });
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date();
      await SiteTheme.updateOne({}, { $set: updates });
      doc = { ...doc, ...updates };
    }
    const theme = { ...DEFAULT_THEME, ...doc };
    delete theme._id;
    delete theme.__v;
    res.json({ success: true, message: 'Renkler kaydedildi', theme });
  } catch (err) {
    console.error('Theme update error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
