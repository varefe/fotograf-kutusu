import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/UserSchema.js';
import { connectDB } from '../config/database.js';

dotenv.config();

/**
 * Kullanıcı bilgilerini kontrol et
 * Kullanım: node server/scripts/checkUser.js <email>
 */
async function checkUser() {
  try {
    const email = process.argv[2];

    if (!email) {
      console.error('❌ Kullanım: node server/scripts/checkUser.js <email>');
      console.error('Örnek: node server/scripts/checkUser.js varefe@icloud.com');
      process.exit(1);
    }

    console.log('🔍 Kullanıcı kontrol ediliyor...');
    console.log('📧 E-posta:', email);

    // Veritabanına bağlan
    await connectDB();

    // Kullanıcıyı bul
    const user = await User.findOne({ email: email.toLowerCase() }).lean();

    if (!user) {
      console.error('❌ Kullanıcı bulunamadı:', email);
      process.exit(1);
    }

    console.log('\n✅ Kullanıcı bulundu!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 E-posta:', user.email);
    console.log('👤 Ad Soyad:', `${user.firstName} ${user.lastName}`);
    console.log('📞 Telefon:', user.phone || 'Belirtilmemiş');
    console.log('🛡️ Rol:', user.role);
    console.log('📅 Oluşturulma:', user.createdAt);
    console.log('🔄 Güncellenme:', user.updatedAt);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  ÖNEMLİ: Şifreler güvenlik nedeniyle hash\'lenmiş olarak saklanır.');
    console.log('   Orijinal şifre geri çözülemez. Şifreyi sıfırlamak için:');
    console.log('   1. /forgot-password sayfasını kullanın');
    console.log('   2. Veya: node server/scripts/changePassword.js <email> <yeni_şifre>');
    console.log('\n💡 Şifreyi "Efe*193123" olarak ayarlamak için:');
    console.log(`   node server/scripts/changePassword.js ${email} "Efe*193123"`);

    // Veritabanı bağlantısını kapat
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Kullanıcı kontrol hatası:', error);
    process.exit(1);
  }
}

checkUser();
