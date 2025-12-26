/**
 * Şifreleme Anahtarı Rotasyon Scripti
 * Eski anahtarla şifrelenmiş verileri yeni anahtarla yeniden şifreler
 */

import crypto from 'crypto';
import { getDB } from '../config/database.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Şifreleme fonksiyonları (eski ve yeni anahtar için)
const getKey = (encryptionKey) => {
  return crypto.createHash('sha256').update(encryptionKey).digest();
};

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Verinin şifreli olup olmadığını kontrol et
const isEncrypted = (data) => {
  if (!data || typeof data !== 'string') return false;
  
  // Şifrelenmiş veri base64 formatında ve uzun olmalı (min 100 karakter)
  // Ayrıca @ işareti içermemeli (email gibi düz metinlerde olur)
  try {
    const decoded = Buffer.from(data, 'base64');
    // Şifrelenmiş veri en az IV + SALT + TAG + bir miktar veri içermeli
    return decoded.length >= (IV_LENGTH + SALT_LENGTH + TAG_LENGTH + 10) && !data.includes('@');
  } catch {
    return false;
  }
};

// Eski anahtarla çöz (veya düz metin döndür)
const decryptWithKey = (data, encryptionKey) => {
  try {
    if (!data) return null;
    
    // Eğer şifreli değilse, direkt döndür
    if (!isEncrypted(data)) {
      return data; // Düz metin, şifreleme gerekmiyor
    }
    
    const key = getKey(encryptionKey);
    const combined = Buffer.from(data, 'base64');
    
    // Minimum uzunluk kontrolü
    if (combined.length < IV_LENGTH + SALT_LENGTH + TAG_LENGTH) {
      return data; // Geçersiz format, düz metin olarak kabul et
    }
    
    const iv = combined.slice(0, IV_LENGTH);
    const salt = combined.slice(IV_LENGTH, IV_LENGTH + SALT_LENGTH);
    const tag = combined.slice(IV_LENGTH + SALT_LENGTH, IV_LENGTH + SALT_LENGTH + TAG_LENGTH);
    const encrypted = combined.slice(IV_LENGTH + SALT_LENGTH + TAG_LENGTH);
    
    const derivedKey = crypto.pbkdf2Sync(key, salt, 10000, KEY_LENGTH, 'sha256');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    // Çözme başarısız, muhtemelen düz metin
    return data;
  }
};

// Yeni anahtarla şifrele
const encryptWithKey = (text, encryptionKey) => {
  try {
    if (!text) return null;
    
    const key = getKey(encryptionKey);
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    const derivedKey = crypto.pbkdf2Sync(key, salt, 10000, KEY_LENGTH, 'sha256');
    
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const tag = cipher.getAuthTag();
    
    const combined = Buffer.concat([
      iv,
      salt,
      tag,
      Buffer.from(encrypted, 'base64')
    ]);
    
    return combined.toString('base64');
  } catch (error) {
    console.error('Şifreleme hatası:', error.message);
    return null;
  }
};

// Yeni anahtar oluştur
const generateNewKey = () => {
  return crypto.randomBytes(32).toString('base64');
};

// .env dosyasını güncelle
const updateEnvFile = (newKey) => {
  const envPath = path.join(__dirname, '../../.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Eski ENCRYPTION_KEY'i bul ve değiştir
    const keyRegex = /^ENCRYPTION_KEY=.*$/m;
    if (keyRegex.test(envContent)) {
      envContent = envContent.replace(keyRegex, `ENCRYPTION_KEY=${newKey}`);
    } else {
      // Eğer yoksa ekle
      envContent += `\n# Şifreleme Anahtarı\nENCRYPTION_KEY=${newKey}\n`;
    }
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ .env dosyası güncellendi');
    return true;
  } catch (error) {
    console.error('❌ .env dosyası güncellenemedi:', error.message);
    return false;
  }
};

// Ana rotasyon fonksiyonu
const rotateEncryptionKey = async (oldKey, newKey) => {
  console.log('🔄 Şifreleme anahtarı rotasyonu başlıyor...\n');
  
  const db = getDB();
  if (!db) {
    console.error('❌ Veritabanı bağlantısı kurulamadı');
    return false;
  }
  
  // Şifrelenmiş tüm siparişleri al
  const stmt = db.prepare('SELECT id, customer_firstName, customer_lastName, customer_email, customer_phone, customer_address, photo_base64, notes FROM orders WHERE isEncrypted = 1');
  const orders = stmt.all();
  
  console.log(`📊 Toplam ${orders.length} şifrelenmiş sipariş bulundu\n`);
  
  if (orders.length === 0) {
    console.log('ℹ️  Şifrelenmiş sipariş yok, sadece anahtar güncellenecek');
    return updateEnvFile(newKey);
  }
  
  let successCount = 0;
  let failCount = 0;
  const failedIds = [];
  
  // Her siparişi işle
  for (const order of orders) {
    try {
      const fieldsToRotate = [
        { name: 'customer_firstName', value: order.customer_firstName },
        { name: 'customer_lastName', value: order.customer_lastName },
        { name: 'customer_email', value: order.customer_email },
        { name: 'customer_phone', value: order.customer_phone },
        { name: 'customer_address', value: order.customer_address },
        { name: 'photo_base64', value: order.photo_base64 },
        { name: 'notes', value: order.notes }
      ];
      
      const updates = {};
      let hasError = false;
      
      // Her alanı çöz ve yeniden şifrele
      for (const field of fieldsToRotate) {
        if (field.value) {
          // Eski anahtarla çöz (veya düz metin al)
          const decrypted = decryptWithKey(field.value, oldKey);
          
          if (decrypted === null || decrypted === undefined) {
            // Boş değer, atla
            continue;
          }
          
          // Eğer zaten şifrelenmişse ve çözülemediyse, eski değeri koru
          if (isEncrypted(field.value) && decrypted === field.value) {
            // Çözülemedi ama şifreli görünüyor, eski değeri koru
            console.log(`   ⚠️  Sipariş #${order.id} - ${field.name} çözülemedi, eski değer korunuyor`);
            updates[field.name] = field.value;
            continue;
          }
          
          // Yeni anahtarla şifrele (düz metin veya çözülmüş veri)
          const reencrypted = encryptWithKey(decrypted, newKey);
          
          if (reencrypted === null) {
            console.error(`   ⚠️  Sipariş #${order.id} - ${field.name} şifrelenemedi`);
            hasError = true;
            break;
          }
          
          updates[field.name] = reencrypted;
        }
      }
      
      if (hasError) {
        failCount++;
        failedIds.push(order.id);
        continue;
      }
      
      // Veritabanını güncelle
      const updateStmt = db.prepare(`
        UPDATE orders 
        SET customer_firstName = ?,
            customer_lastName = ?,
            customer_email = ?,
            customer_phone = ?,
            customer_address = ?,
            photo_base64 = ?,
            notes = ?,
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      
      updateStmt.run(
        updates.customer_firstName || order.customer_firstName,
        updates.customer_lastName || order.customer_lastName,
        updates.customer_email || order.customer_email,
        updates.customer_phone || order.customer_phone,
        updates.customer_address || order.customer_address,
        updates.photo_base64 || order.photo_base64,
        updates.notes || order.notes,
        order.id
      );
      
      successCount++;
      
      if (successCount % 10 === 0) {
        console.log(`   ✅ ${successCount} sipariş işlendi...`);
      }
      
    } catch (error) {
      console.error(`   ❌ Sipariş #${order.id} işlenirken hata:`, error.message);
      failCount++;
      failedIds.push(order.id);
    }
  }
  
  console.log('\n📊 Rotasyon Sonuçları:');
  console.log(`   ✅ Başarılı: ${successCount}`);
  console.log(`   ❌ Başarısız: ${failCount}`);
  
  if (failedIds.length > 0) {
    console.log(`   ⚠️  Başarısız sipariş ID'leri: ${failedIds.join(', ')}`);
  }
  
  // .env dosyasını güncelle
  if (successCount > 0 || orders.length === 0) {
    const envUpdated = updateEnvFile(newKey);
    if (envUpdated) {
      console.log('\n✅ Rotasyon tamamlandı!');
      console.log('⚠️  Server\'ı yeniden başlatmanız gerekiyor!');
      return true;
    }
  }
  
  return failCount === 0;
};

// Ana fonksiyon
const main = async () => {
  console.log('🔐 Şifreleme Anahtarı Rotasyon Scripti\n');
  console.log('='.repeat(60));
  
  // Mevcut anahtarı al
  const oldKey = process.env.ENCRYPTION_KEY || 'fotograf-baski-secret-key-2024-change-in-production';
  
  if (oldKey === 'fotograf-baski-secret-key-2024-change-in-production') {
    console.log('⚠️  UYARI: Varsayılan anahtar kullanılıyor!');
    console.log('   Bu anahtarı değiştirmeniz önerilir.\n');
  }
  
  // Yeni anahtar oluştur
  const newKey = generateNewKey();
  
  console.log('📋 Rotasyon Bilgileri:');
  console.log(`   Eski Anahtar: ${oldKey.substring(0, 20)}...`);
  console.log(`   Yeni Anahtar: ${newKey.substring(0, 20)}...`);
  console.log('');
  
  // Onay iste (otomatik mod için skip edilebilir)
  const args = process.argv.slice(2);
  const autoMode = args.includes('--auto') || args.includes('-y');
  
  if (!autoMode) {
    console.log('⚠️  Bu işlem tüm şifrelenmiş verileri yeniden şifreleyecek.');
    console.log('   Devam etmek için --auto veya -y parametresi kullanın.');
    console.log('   Örnek: node rotate-encryption-key.js --auto\n');
    process.exit(0);
  }
  
  // Rotasyonu başlat
  const success = await rotateEncryptionKey(oldKey, newKey);
  
  if (success) {
    console.log('\n🎉 Rotasyon başarıyla tamamlandı!');
    console.log('\n📝 Yapılacaklar:');
    console.log('   1. Server\'ı yeniden başlatın');
    console.log('   2. Yeni anahtarı güvenli bir yerde saklayın');
    console.log('   3. Eski anahtarı silmeyin (yedek için)');
    process.exit(0);
  } else {
    console.log('\n❌ Rotasyon sırasında hatalar oluştu!');
    console.log('   Lütfen logları kontrol edin.');
    process.exit(1);
  }
};

// Script'i çalıştır
main().catch(error => {
  console.error('❌ Kritik hata:', error);
  process.exit(1);
});
