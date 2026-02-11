import express from 'express';
import { connectDB } from '../config/database.js';
import PageContent from '../models/PageContentSchema.js';
import { requireAdminRole } from '../middleware/auth.js';

/** Sayfa slug'ına göre varsayılan başlık ve HTML içerik (deploy'da tek dosya, server/data bağımlılığı yok) */
const pageDefaults = {
  about: {
    pageTitle: 'Hakkımızda',
    content: `<h2>Biz Kimiz?</h2>
<p>Fotoğraf baskı ve çerçeveleme hizmeti sunan firmamız, yıllardır müşterilerimize yüksek kaliteli baskı hizmeti sağlamaktadır. Anılarınızı ölümsüzleştirmek ve evinize, ofisinize değer katmak için buradayız.</p>
<h2>Misyonumuz</h2>
<p>Müşterilerimizin en değerli anılarını en yüksek kalitede baskıya dönüştürmek ve profesyonel çerçeveleme hizmetiyle sunmak. Her siparişte müşteri memnuniyetini ön planda tutarak, güvenilir ve hızlı teslimat sağlamak.</p>
<h2>Vizyonumuz</h2>
<p>Türkiye'nin en güvenilir ve kaliteli fotoğraf baskı hizmeti sağlayıcısı olmak. Teknolojik yenilikleri takip ederek, müşterilerimize en iyi deneyimi sunmak.</p>
<h2>Neden Bizi Seçmelisiniz?</h2>
<ul class="feature-list"><li>Yüksek kaliteli baskı teknolojisi</li><li>Profesyonel çerçeveleme hizmeti</li><li>Hızlı ve güvenli teslimat</li><li>Uygun fiyat garantisi</li><li>Müşteri odaklı hizmet anlayışı</li><li>Güvenli ödeme sistemi (iyzico)</li></ul>
<h2>İletişim</h2>
<p>Sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçebilirsiniz.</p>`
  },
  contact: {
    pageTitle: 'İletişim',
    content: `<h2>Bize Ulaşın</h2>
<p>Müşteri memnuniyeti bizim için önceliktir. Size en iyi hizmeti sunmak için buradayız.</p>
<p><strong>E-posta:</strong> <a href="mailto:admin@fotografkutusu.com">admin@fotografkutusu.com</a><br>En kısa sürede size dönüş yapacağız.</p>
<p><strong>Telefon:</strong> <a href="tel:05067087684">0 (506) 708 76 84</a><br>Çalışma Saatleri: Pazartesi - Cuma, 09:00 - 18:00</p>
<p><strong>Adres:</strong><br>Altın Oran Fotoğrafçılık, Ozan Sokak No 11, Manisa Turgutlu</p>
<p><strong>Çalışma Saatleri:</strong><br>Pazartesi - Cuma: 09:00 - 18:00<br>Cumartesi: 10:00 - 16:00<br>Pazar: Kapalı</p>`
  },
  privacy: {
    pageTitle: 'Gizlilik Sözleşmesi',
    content: `<p><strong>Son Güncelleme:</strong> Güncel tarih sitede gösterilir.</p>
<h2>1. Genel Bilgiler</h2>
<p>Bu Gizlilik Sözleşmesi, web sitemiz üzerinden sağladığınız kişisel verilerinizin toplanması, kullanılması, saklanması ve korunması ile ilgili hak ve yükümlülüklerimizi açıklamaktadır. 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca kişisel verilerinizin korunmasına büyük önem vermekteyiz.</p>
<h2>2. Toplanan Kişisel Veriler</h2>
<p>Hizmetlerimizi sunabilmek için aşağıdaki kişisel verilerinizi toplamaktayız:</p>
<ul><li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li><li><strong>İletişim Bilgileri:</strong> E-posta, telefon, adres</li><li><strong>Ödeme Bilgileri:</strong> Kredi kartı bilgileri (iyzico ile şifrelenmiş)</li><li><strong>İşlem Bilgileri:</strong> Sipariş geçmişi</li><li><strong>Teknik Bilgiler:</strong> IP adresi, çerezler</li></ul>
<h2>3. Veri Güvenliği ve Haklarınız</h2>
<p>Kişisel verilerinizin güvenliği için teknik ve idari önlemler almaktayız. KVKK kapsamındaki haklarınızı kullanmak için bizimle iletişime geçebilirsiniz.</p>`
  },
  'delivery-returns': {
    pageTitle: 'Teslimat ve İade Şartları',
    content: `<h2>Teslimat Koşulları</h2>
<h3>1. Teslimat Süresi</h3>
<p>Siparişleriniz onaylandıktan sonra 3-5 iş günü içinde hazırlanır ve kargoya verilir. Kargo teslimat süresi 1-3 iş günü arasında değişmektedir.</p>
<h3>2. Teslimat Ücreti</h3>
<p>Kargo ücreti sipariş tutarına göre belirlenmektedir. Belirli tutarın üzerindeki siparişlerde kargo ücretsizdir.</p>
<h2>İade ve Değişim Koşulları</h2>
<p>6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca, ürünü teslim aldığınız tarihten itibaren 14 gün içinde cayma hakkınızı kullanabilirsiniz. Ürünün kullanılmamış ve orijinal ambalajında olması gerekir.</p>`
  },
  'distance-selling': {
    pageTitle: 'Mesafeli Satış Sözleşmesi',
    content: `<p><strong>Son Güncelleme:</strong> Güncel tarih sitede gösterilir.</p>
<h2>1. Taraflar</h2>
<p>Bu sözleşme, satıcı ile internet sitesi üzerinden sipariş veren alıcı arasında düzenlenmiştir. <strong>Satıcı:</strong> Fotoğraf Kutusu. <strong>Alıcı:</strong> Web sitesi üzerinden sipariş veren müşteri.</p>
<h2>2. Sipariş ve Ödeme</h2>
<p>Alıcı web sitesi üzerinden sipariş oluşturur. Ödeme iyzico güvenli ödeme sistemi üzerinden yapılır. Fiyatlar sitede belirtilen KDV dahil fiyatlardır.</p>
<h2>3. Teslimat</h2>
<p>Siparişler onaylandıktan sonra 3-5 iş günü içinde hazırlanır ve kargoya verilir.</p>`
  },
  faq: {
    pageTitle: 'Sık Sorulan Sorular',
    content: `<h2>Sipariş İşlemleri</h2>
<p><strong>Nasıl sipariş verebilirim?</strong><br>Ana sayfadan boyut seçin, fotoğraflarınızı yükleyin (min. 15 adet), sepete ekleyin ve ödeme sayfasından tamamlayın.</p>
<p><strong>Minimum sipariş adedi nedir?</strong><br>Her boyut için minimum 15 adet. 15 ve üzeri toplu fiyat geçerlidir.</p>
<h2>Ödeme ve Teslimat</h2>
<p><strong>Hangi ödeme yöntemleri?</strong><br>Kredi kartı ve banka kartı ile güvenli ödeme (Iyzico).</p>
<p><strong>Siparişim ne zaman hazır olur?</strong><br>2-3 iş günü içinde hazırlanır, kargoya verilir. Türkiye genelinde ortalama 2-5 iş günü teslimat.</p>
<p><strong>İade yapabilir miyim?</strong><br>Teslim aldığınız tarihten itibaren 14 gün içinde cayma hakkınızı kullanabilirsiniz. Müşteri hizmetleri ile iletişime geçin.</p>`
  }
};

function getDefaultForSlug(slug) {
  const d = pageDefaults[slug];
  if (d) return { pageTitle: d.pageTitle, content: d.content };
  return { pageTitle: slug, content: '<p>İçerik henüz eklenmedi.</p>' };
}

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
