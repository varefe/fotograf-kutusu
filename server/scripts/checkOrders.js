/**
 * Sipariş kontrolü script'i
 * Kullanım: node server/scripts/checkOrders.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import '../models/OrderSchema.js'; // Order model'ini yükle

dotenv.config();

const checkOrders = async () => {
  try {
    console.log('🔍 Sipariş kontrolü başlatılıyor...\n');
    
    await connectDB();
    console.log('✅ MongoDB bağlantısı başarılı\n');
    
    const Order = mongoose.models.Order;
    
    // Veritabanı bilgileri
    const dbName = mongoose.connection.db?.databaseName || 'Bilinmiyor';
    const collectionName = Order.collection?.name || 'Bilinmiyor';
    
    console.log('📊 Veritabanı Bilgileri:');
    console.log(`   Veritabanı: ${dbName}`);
    console.log(`   Koleksiyon: ${collectionName}`);
    console.log(`   Bağlantı Durumu: ${mongoose.connection.readyState === 1 ? '✅ Bağlı' : '❌ Bağlı değil'}\n`);
    
    // Toplam sipariş sayısı
    const totalCount = await Order.countDocuments({});
    console.log(`📦 Toplam Sipariş Sayısı: ${totalCount}\n`);
    
    if (totalCount === 0) {
      console.log('⚠️  Veritabanında sipariş bulunamadı.\n');
      
      // Koleksiyonları kontrol et
      const collections = await mongoose.connection.db?.listCollections().toArray() || [];
      console.log('📋 Mevcut Koleksiyonlar:');
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
      
      process.exit(0);
    }
    
    // Sipariş istatistikleri
    const paidCount = await Order.countDocuments({ paymentStatus: 'paid' });
    const pendingCount = await Order.countDocuments({ paymentStatus: 'pending' });
    const failedCount = await Order.countDocuments({ paymentStatus: 'failed' });
    
    console.log('📊 Sipariş İstatistikleri:');
    console.log(`   ✅ Ödenen: ${paidCount}`);
    console.log(`   ⏳ Bekleyen: ${pendingCount}`);
    console.log(`   ❌ Başarısız: ${failedCount}\n`);
    
    // Durum istatistikleri
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('📊 Durum İstatistikleri:');
    statusCounts.forEach(stat => {
      console.log(`   ${stat._id || 'Belirtilmemiş'}: ${stat.count}`);
    });
    console.log('');
    
    // Son 5 sipariş
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    console.log('📋 Son 5 Sipariş:');
    recentOrders.forEach((order, index) => {
      console.log(`\n   ${index + 1}. Sipariş #${order._id}`);
      console.log(`      📧 Email: ${order.customerInfo?.email || 'Email yok'}`);
      console.log(`      💰 Fiyat: ${order.price || 0} ₺`);
      console.log(`      📦 Durum: ${order.status || 'Yeni'}`);
      console.log(`      💳 Ödeme: ${order.paymentStatus || 'pending'}`);
      console.log(`      📅 Tarih: ${order.createdAt ? new Date(order.createdAt).toLocaleString('tr-TR') : 'Tarih yok'}`);
    });
    
    // Toplam gelir (ödenen siparişler)
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    console.log(`\n💰 Toplam Gelir (Ödenen Siparişler): ${totalRevenue.toFixed(2)} ₺\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

checkOrders();
