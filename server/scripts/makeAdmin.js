/**
 * Kullanıcıyı admin yapmak için script
 * Kullanım: node server/scripts/makeAdmin.js <email>
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/UserSchema.js';
import { connectDB } from '../config/database.js';

dotenv.config();

const makeUserAdmin = async (email) => {
  try {
    await connectDB();
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`❌ Kullanıcı bulunamadı: ${email}`);
      process.exit(1);
    }
    
    if (user.role === 'admin') {
      console.log(`✅ ${email} zaten admin!`);
      process.exit(0);
    }
    
    user.role = 'admin';
    await user.save();
    
    console.log(`✅ ${email} başarıyla admin yapıldı!`);
    console.log(`📧 E-posta: ${user.email}`);
    console.log(`👤 Ad Soyad: ${user.firstName} ${user.lastName}`);
    console.log(`🛡️ Rol: ${user.role}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
};

// Komut satırından e-posta al
const email = process.argv[2];

if (!email) {
  console.error('❌ Kullanım: node server/scripts/makeAdmin.js <email>');
  console.error('Örnek: node server/scripts/makeAdmin.js admin@example.com');
  process.exit(1);
}

makeUserAdmin(email);

