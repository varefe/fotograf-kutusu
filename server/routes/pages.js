import express from 'express';
import { connectDB } from '../config/database.js';
import PageContent from '../models/PageContentSchema.js';
import { requireAdminRole } from '../middleware/auth.js';
import { pageDefaults, getDefaultForSlug } from '../data/pageDefaults.js';

const router = express.Router();

const SLUGS = ['about', 'contact', 'privacy', 'delivery-returns', 'distance-selling', 'faq'];

/** Public: Tek sayfa içeriği (varsayılan veya DB) */
router.get('/:slug', async (req, res) => {
  try {
    await connectDB();
    const { slug } = req.params;
    const doc = await PageContent.findOne({ slug }).lean();
    if (doc) {
      return res.json({ success: true, page: { slug: doc.slug, pageTitle: doc.pageTitle, content: doc.content } });
    }
    const def = getDefaultForSlug(slug);
    return res.json({ success: true, page: { slug, pageTitle: def.pageTitle, content: def.content } });
  } catch (err) {
    console.error('Page get error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/** Admin: Tüm sayfa listesi (slug + mevcut başlık) */
router.get('/', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const docs = await PageContent.find({ slug: { $in: SLUGS } }).lean();
    const bySlug = Object.fromEntries((docs || []).map(d => [d.slug, d]));
    const list = SLUGS.map(slug => {
      const d = bySlug[slug];
      const def = pageDefaults[slug] || {};
      return {
        slug,
        pageTitle: d?.pageTitle ?? def?.pageTitle ?? slug,
        hasCustom: !!d
      };
    });
    res.json({ success: true, pages: list });
  } catch (err) {
    console.error('Pages list error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/** Admin: Sayfa içeriği getir (düzenleme için) */
router.get('/admin/:slug', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const { slug } = req.params;
    const doc = await PageContent.findOne({ slug }).lean();
    if (doc) {
      return res.json({ success: true, page: { slug: doc.slug, pageTitle: doc.pageTitle, content: doc.content } });
    }
    const def = getDefaultForSlug(slug);
    res.json({ success: true, page: { slug, pageTitle: def.pageTitle, content: def.content } });
  } catch (err) {
    console.error('Page admin get error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/** Admin: Sayfa içeriği güncelle */
router.put('/admin/:slug', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    const { slug } = req.params;
    const { pageTitle, content } = req.body;
    if (!SLUGS.includes(slug)) {
      return res.status(400).json({ success: false, error: 'Geçersiz sayfa' });
    }
    const update = {
      pageTitle: typeof pageTitle === 'string' ? pageTitle.trim() : '',
      content: typeof content === 'string' ? content : '',
      updatedAt: new Date()
    };
    const doc = await PageContent.findOneAndUpdate(
      { slug },
      { $set: update },
      { new: true, upsert: true }
    ).lean();
    res.json({
      success: true,
      message: 'İçerik kaydedildi',
      page: { slug: doc.slug, pageTitle: doc.pageTitle, content: doc.content }
    });
  } catch (err) {
    console.error('Page update error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
