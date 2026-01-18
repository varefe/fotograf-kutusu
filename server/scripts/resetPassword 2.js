/**
 * Kullanıcı şifresini sıfırlamak için script
 * Kullanım: node server/scripts/resetPassword.js <email> <yeni_sifre>
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/UserSchema.js';
import { connectDB } from '../config/database.js';

dotenv.config();

const resetPassword = async (email, newPassword) => {
  try {
    await connectDB();
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`❌ Kullanıcı bulunamadı: ${email}`);
      process.exit(1);
    }
    
    // Şifre validasyonu
    if (!newPassword || newPassword.length < 8) {
      console.error('❌ Şifre en az 8 karakter olmalıdır');
      process.exit(1);
    }
    
    // Şifreyi güncelle (pre-save hook otomatik hashleyecek)
    user.password = newPassword;
    await user.save();
    
    console.log(`✅ Şifre başarıyla sıfırlandı!`);
    console.log(`📧 E-posta: ${user.email}`);
    console.log(`👤 Ad Soyad: ${user.firstName} ${user.lastName}`);
    console.log(`🛡️ Rol: ${user.role}`);
    console.log(`🔐 Yeni şifre: ${newPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
};

// Komut satırından e-posta ve şifre al
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('❌ Kullanım: node server/scripts/resetPassword.js <email> <yeni_sifre>');
  console.error('Örnek: node server/scripts/resetPassword.js varefe@icloud.com YeniSifre123!');
  process.exit(1);
}

resetPassword(email, newPassword);
