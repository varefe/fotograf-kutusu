import crypto from 'crypto';

// Şifreleme anahtarı - environment variable'dan alınır
// Production'da mutlaka güçlü bir key kullanın!
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fotograf-baski-secret-key-2024-change-in-production';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for IV
const SALT_LENGTH = 64; // 64 bytes for salt
const TAG_LENGTH = 16; // 16 bytes for GCM tag
const KEY_LENGTH = 32; // 32 bytes for AES-256

// Key'i sabit uzunlukta hash'le
const getKey = () => {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
};

/**
 * Hassas veriyi şifrele
 * @param {string} text - Şifrelenecek metin
 * @returns {string} - Base64 encoded şifrelenmiş veri
 */
export const encrypt = (text) => {
  try {
    if (!text) return null;
    
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    // Salt ile key'i türet
    const derivedKey = crypto.pbkdf2Sync(key, salt, 10000, KEY_LENGTH, 'sha256');
    
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const tag = cipher.getAuthTag();
    
    // IV + Salt + Tag + Encrypted Data formatında birleştir
    const combined = Buffer.concat([
      iv,
      salt,
      tag,
      Buffer.from(encrypted, 'base64')
    ]);
    
    return combined.toString('base64');
  } catch (error) {
    console.error('Şifreleme hatası:', error);
    return null;
  }
};

/**
 * Şifrelenmiş veriyi çöz
 * @param {string} encryptedData - Base64 encoded şifrelenmiş veri
 * @returns {string|null} - Çözülmüş metin veya null
 */
export const decrypt = (encryptedData) => {
  try {
    if (!encryptedData) return null;
    
    const key = getKey();
    const combined = Buffer.from(encryptedData, 'base64');
    
    // IV, Salt, Tag ve Encrypted Data'yı ayır
    const iv = combined.slice(0, IV_LENGTH);
    const salt = combined.slice(IV_LENGTH, IV_LENGTH + SALT_LENGTH);
    const tag = combined.slice(IV_LENGTH + SALT_LENGTH, IV_LENGTH + SALT_LENGTH + TAG_LENGTH);
    const encrypted = combined.slice(IV_LENGTH + SALT_LENGTH + TAG_LENGTH);
    
    // Salt ile key'i türet
    const derivedKey = crypto.pbkdf2Sync(key, salt, 10000, KEY_LENGTH, 'sha256');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Çözme hatası:', error);
    return null;
  }
};

/**
 * Objeyi şifrele (JSON stringify sonrası)
 * @param {object} obj - Şifrelenecek obje
 * @returns {string|null} - Şifrelenmiş veri
 */
export const encryptObject = (obj) => {
  try {
    const jsonString = JSON.stringify(obj);
    return encrypt(jsonString);
  } catch (error) {
    console.error('Obje şifreleme hatası:', error);
    return null;
  }
};

/**
 * Şifrelenmiş objeyi çöz
 * @param {string} encryptedData - Şifrelenmiş veri
 * @returns {object|null} - Çözülmüş obje
 */
export const decryptObject = (encryptedData) => {
  try {
    const decrypted = decrypt(encryptedData);
    if (!decrypted) return null;
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Obje çözme hatası:', error);
    return null;
  }
};

/**
 * Hassas alanları şifrele (customerInfo, photo base64 gibi)
 * @param {object} orderData - Sipariş verisi
 * @returns {object} - Hassas alanları şifrelenmiş sipariş verisi
 */
export const encryptSensitiveFields = (orderData) => {
  const encrypted = { ...orderData };
  
  // Müşteri bilgilerini şifrele
  if (encrypted.customerInfo) {
    encrypted.customerInfo = {
      firstName: encrypt(encrypted.customerInfo.firstName || ''),
      lastName: encrypt(encrypted.customerInfo.lastName || ''),
      email: encrypt(encrypted.customerInfo.email || ''),
      phone: encrypt(encrypted.customerInfo.phone || ''),
      address: encrypt(encrypted.customerInfo.address || '')
    };
  }
  
  // Fotoğraf base64'ünü şifrele (çok büyük olabilir, dikkatli ol)
  if (encrypted.photo && encrypted.photo.base64) {
    encrypted.photo = {
      ...encrypted.photo,
      base64: encrypt(encrypted.photo.base64)
    };
  }
  
  // Notları şifrele
  if (encrypted.notes) {
    encrypted.notes = encrypt(encrypted.notes);
  }
  
  return encrypted;
};

/**
 * Şifrelenmiş hassas alanları çöz
 * @param {object} orderData - Şifrelenmiş sipariş verisi
 * @returns {object} - Çözülmüş sipariş verisi
 */
export const decryptSensitiveFields = (orderData) => {
  if (!orderData) return null;
  
  const decrypted = { ...orderData };
  
  // Müşteri bilgilerini çöz
  if (decrypted.customerInfo) {
    decrypted.customerInfo = {
      firstName: decrypt(decrypted.customerInfo.firstName) || '',
      lastName: decrypt(decrypted.customerInfo.lastName) || '',
      email: decrypt(decrypted.customerInfo.email) || '',
      phone: decrypt(decrypted.customerInfo.phone) || '',
      address: decrypt(decrypted.customerInfo.address) || ''
    };
  }
  
  // Fotoğraf base64'ünü çöz
  if (decrypted.photo && decrypted.photo.base64) {
    decrypted.photo = {
      ...decrypted.photo,
      base64: decrypt(decrypted.photo.base64)
    };
  }
  
  // Notları çöz
  if (decrypted.notes) {
    decrypted.notes = decrypt(decrypted.notes) || '';
  }
  
  return decrypted;
};
