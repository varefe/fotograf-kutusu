/**
 * Veritabanı Temizleme Scripti
 * 
 * Bu script tüm koleksiyonları temizler:
 * - orders (Siparişler)
 * - users (Kullanıcılar - admin hariç veya hepsi)
 * - galleries (Galeri öğeleri)
 * - categories (Kategoriler)
 * - reviews (Yorumlar)
 * - announcements (Duyurular)
 * 
 * Kullanım:
 *   node server/scripts/clearDatabase.js
 * 
 * DİKKAT: Bu işlem geri alınamaz!
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/database.js';
import User from '../models/UserSchema.js';
import Order from '../models/OrderSchema.js';
import Gallery from '../models/GallerySchema.js';
import Category from '../models/CategorySchema.js';
import Review from '../models/ReviewSchema.js';
import Announcement from '../models/AnnouncementSchema.js';

dotenv.config();

async function clearDatabase() {
  try {
    console.log('🔄 Veritabanına bağlanılıyor...\n');
    await connectDB();
    
    const mongoose = (await import('mongoose')).default;
    const db = mongoose.connection.db;
    const dbName = db?.databaseName || 'Bilinmiyor';
    
    console.log(`📊 Veritabanı: ${dbName}\n`);
    
    // Tüm koleksiyonları listele
    const collections = await db.listCollections().toArray();
    console.log('📋 Mevcut Koleksiyonlar:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    console.log('');
    
    // Her koleksiyon için sayıları göster
    console.log('📊 Koleksiyon İstatistikleri:');
    
    const orderCount = await Order.countDocuments({});
    const userCount = await User.countDocuments({});
    const adminCount = await User.countDocuments({ role: 'admin' });
    const galleryCount = await Gallery.countDocuments({});
    const categoryCount = await Category.countDocuments({});
    const reviewCount = await Review.countDocuments({});
    const announcementCount = await Announcement.countDocuments({});
    
    console.log(`   📦 Orders (Siparişler): ${orderCount}`);
    console.log(`   👥 Users (Kullanıcılar): ${userCount} (${adminCount} admin)`);
    console.log(`   🖼️  Galleries (Galeri): ${galleryCount}`);
    console.log(`   📁 Categories (Kategoriler): ${categoryCount}`);
    console.log(`   ⭐ Reviews (Yorumlar): ${reviewCount}`);
    console.log(`   📢 Announcements (Duyurular): ${announcementCount}`);
    console.log('');
    
    const totalDocs = orderCount + userCount + galleryCount + categoryCount + reviewCount + announcementCount;
    
    if (totalDocs === 0) {
      console.log('✅ Veritabanı zaten boş. Temizlenecek bir şey yok.\n');
      await disconnectDB();
      process.exit(0);
    }
    
    console.log(`⚠️  TOPLAM: ${totalDocs} döküman silinecek!\n`);
    console.log('⚠️  DİKKAT: Bu işlem geri alınamaz!\n');
    
    // Kullanıcıdan onay al (eğer interaktif moddaysa)
    // Node.js'te readline kullanarak onay alabiliriz ama script çalıştırılırken
    // genellikle --yes flag'i ile çalıştırılır
    const args = process.argv.slice(2);
    const skipConfirm = args.includes('--yes') || args.includes('-y');
    
    if (!skipConfirm) {
      console.log('❓ Devam etmek için --yes veya -y parametresi ekleyin:');
      console.log('   node server/scripts/clearDatabase.js --yes\n');
      await disconnectDB();
      process.exit(1);
    }
    
    console.log('🗑️  Veritabanı temizleniyor...\n');
    
    // Siparişleri sil
    if (orderCount > 0) {
      const deletedOrders = await Order.deleteMany({});
      console.log(`✅ ${deletedOrders.deletedCount} sipariş silindi`);
    }
    
    // Galeri öğelerini sil
    if (galleryCount > 0) {
      const deletedGalleries = await Gallery.deleteMany({});
      console.log(`✅ ${deletedGalleries.deletedCount} galeri öğesi silindi`);
    }
    
    // Kategorileri sil
    if (categoryCount > 0) {
      const deletedCategories = await Category.deleteMany({});
      console.log(`✅ ${deletedCategories.deletedCount} kategori silindi`);
    }
    
    // Yorumları sil
    if (reviewCount > 0) {
      const deletedReviews = await Review.deleteMany({});
      console.log(`✅ ${deletedReviews.deletedCount} yorum silindi`);
    }
    
    // Duyuruları sil
    if (announcementCount > 0) {
      const deletedAnnouncements = await Announcement.deleteMany({});
      console.log(`✅ ${deletedAnnouncements.deletedCount} duyuru silindi`);
    }
    
    // Kullanıcıları sil (admin'ler dahil)
    if (userCount > 0) {
      const deletedUsers = await User.deleteMany({});
      console.log(`✅ ${deletedUsers.deletedCount} kullanıcı silindi`);
    }
    
    console.log('\n✅ Veritabanı başarıyla temizlendi!\n');
    
    // Son durumu göster
    const finalOrderCount = await Order.countDocuments({});
    const finalUserCount = await User.countDocuments({});
    const finalGalleryCount = await Gallery.countDocuments({});
    const finalCategoryCount = await Category.countDocuments({});
    const finalReviewCount = await Review.countDocuments({});
    const finalAnnouncementCount = await Announcement.countDocuments({});
    
    console.log('📊 Son Durum:');
    console.log(`   📦 Orders: ${finalOrderCount}`);
    console.log(`   👥 Users: ${finalUserCount}`);
    console.log(`   🖼️  Galleries: ${finalGalleryCount}`);
    console.log(`   📁 Categories: ${finalCategoryCount}`);
    console.log(`   ⭐ Reviews: ${finalReviewCount}`);
    console.log(`   📢 Announcements: ${finalAnnouncementCount}`);
    console.log('');
    
    // Veritabanı bağlantısını kapat
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error.stack);
    await disconnectDB();
    process.exit(1);
  }
}

// Script'i çalıştır
clearDatabase();
