import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/UserSchema.js';
import { connectDB } from '../config/database.js';

dotenv.config();

/**
 * Kullanıcı şifresini değiştir
 * Kullanım: node server/scripts/changePassword.js <email> <newPassword>
 */
async function changePassword() {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.error('❌ Kullanım: node server/scripts/changePassword.js <email> <newPassword>');
      console.error('Örnek: node server/scripts/changePassword.js varefe@icloud.com "Efe*193123"');
      process.exit(1);
    }

    console.log('🔐 Şifre değiştirme işlemi başlatılıyor...');
    console.log('📧 E-posta:', email);

    // Veritabanına bağlan
    await connectDB();

    // Kullanıcıyı bul
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error('❌ Kullanıcı bulunamadı:', email);
      process.exit(1);
    }

    console.log('✅ Kullanıcı bulundu:', {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });

    // Şifre validasyonu
    if (newPassword.length < 8) {
      console.error('❌ Şifre çok kısa (en az 8 karakter olmalı)');
      process.exit(1);
    }

    // Şifre güçlülük kontrolü
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      console.error('❌ Şifre yeterince güçlü değil');
      console.error('Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter (@$!%*?&) içermelidir');
      process.exit(1);
    }

    // Şifreyi değiştir (pre-save hook otomatik hashleyecek)
    user.password = newPassword;
    await user.save();

    console.log('✅ Şifre başarıyla değiştirildi!');
    console.log('📧 E-posta:', user.email);
    console.log('🔑 Yeni şifre:', newPassword);

    // Veritabanı bağlantısını kapat
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Şifre değiştirme hatası:', error);
    process.exit(1);
  }
}

changePassword();
