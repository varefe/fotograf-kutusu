import crypto from 'crypto';

// Şifreleme anahtarı - environment variable'dan alınır
// Production'da mutlaka güçlü bir key kullanın!
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fotograf-baski-secret-key-2024-change-in-production';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for IV
const SALT_LENGTH = 64; // 64 bytes for salt
const TAG_LENGTH = 16; // 16 bytes for GCM tag
const KEY_LENGTH = 32; // 32 bytes for AES-256
const MIN_ENCRYPTED_B64_LENGTH = 128; // IV+Salt+Tag+veri için minimum base64 uzunluk

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
    if (encryptedData == null) return null;
    if (typeof encryptedData !== 'string') return null;
    const trimmed = encryptedData.replace(/\s+/g, '');
    if (!trimmed.length) return null;
    // Çok kısa veri bizim formatımız değildir; çözmeye çalışma (plain text olabilir)
    if (trimmed.length < MIN_ENCRYPTED_B64_LENGTH) return null;

    const key = getKey();
    const combined = Buffer.from(trimmed, 'base64');
    if (combined.length < IV_LENGTH + SALT_LENGTH + TAG_LENGTH + 1) return null;

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
    console.error('Çözme hatası:', error.message);
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
  
  // Photos array'ini şifrele (birden fazla fotoğraf)
  if (encrypted.photos && Array.isArray(encrypted.photos)) {
    encrypted.photos = encrypted.photos.map(photo => {
      if (photo && photo.base64) {
        return {
          ...photo,
          base64: encrypt(photo.base64)
        };
      }
      return photo;
    });
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
 * @returns {object} - Çözülmüş sipariş verisi; _decryptionFailed true ise en az bir alan çözülemedi
 */
export const decryptSensitiveFields = (orderData) => {
  if (!orderData) return null;

  const decrypted = { ...orderData };
  let decryptionFailed = false;

  const looksEncrypted = (s) => typeof s === 'string' && s.length >= MIN_ENCRYPTED_B64_LENGTH && /^[A-Za-z0-9+/]+=*$/.test(s.replace(/\s/g, ''));

  // Şifrelenmemiş siparişler (eski kayıt veya isEncrypted: false): customerInfo'yu olduğu gibi kullan
  if (orderData.isEncrypted === false && decrypted.customerInfo && typeof decrypted.customerInfo === 'object') {
    decrypted.customerInfo = {
      firstName: String(decrypted.customerInfo.firstName ?? '').trim(),
      lastName: String(decrypted.customerInfo.lastName ?? '').trim(),
      email: String(decrypted.customerInfo.email ?? '').trim(),
      phone: String(decrypted.customerInfo.phone ?? '').trim(),
      address: String(decrypted.customerInfo.address ?? '').trim()
    };
  } else if (decrypted.customerInfo && typeof decrypted.customerInfo === 'object') {
    try {
      const ci = decrypted.customerInfo;
      const safeDecrypt = (val) => {
        if (val == null || val === '') return '';
        if (typeof val !== 'string') return String(val).trim() || '';
        const out = decrypt(val);
        if (out != null && out !== '') return out;
        if (looksEncrypted(val)) {
          decryptionFailed = true;
          return '';
        }
        return val;
      };
      decrypted.customerInfo = {
        firstName: safeDecrypt(ci.firstName),
        lastName: safeDecrypt(ci.lastName),
        email: safeDecrypt(ci.email),
        phone: safeDecrypt(ci.phone),
        address: safeDecrypt(ci.address)
      };
      if (decryptionFailed && process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Müşteri bilgisi şifresi çözülemedi. .env içinde ENCRYPTION_KEY\'in sipariş oluşturulurken kullanılan anahtar ile aynı olduğundan emin olun.');
      }
    } catch (e) {
      console.error('decryptSensitiveFields customerInfo hatası:', e);
      decrypted.customerInfo = { firstName: '', lastName: '', email: '', phone: '', address: '' };
      decryptionFailed = true;
    }
  }

  if (decryptionFailed) decrypted._decryptionFailed = true;

  // customerInfo hiç yoksa boş obje ver (frontend hatasını önle)
  if (!decrypted.customerInfo || typeof decrypted.customerInfo !== 'object') {
    decrypted.customerInfo = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: ''
    };
  }
  // Şifre çözülemediyse admin için saklanan şifresiz kopyayı kullan
  const display = orderData.customerInfoDisplay;
  if (display && typeof display === 'object' && decrypted.customerInfo) {
    const ci = decrypted.customerInfo;
    if (!ci.firstName && display.firstName) ci.firstName = String(display.firstName).trim();
    if (!ci.lastName && display.lastName) ci.lastName = String(display.lastName).trim();
    if (!ci.email && display.email) ci.email = String(display.email).trim();
    if (!ci.phone && display.phone) ci.phone = String(display.phone).trim();
    if (!ci.address && display.address) ci.address = String(display.address).trim();
  }

  // Fotoğraf base64'ünü çöz
  if (decrypted.photo && decrypted.photo.base64) {
    decrypted.photo = {
      ...decrypted.photo,
      base64: decrypt(decrypted.photo.base64)
    };
  }
  
  // Photos array'ini çöz (birden fazla fotoğraf)
  // Eleman bazen { base64, mimetype } bazen sadece şifrelenmiş base64 string olabilir
  if (decrypted.photos && Array.isArray(decrypted.photos)) {
    decrypted.photos = decrypted.photos.map(photo => {
      if (typeof photo === 'string') {
        const base64 = decrypt(photo);
        if (base64) return { base64, mimetype: 'image/jpeg' };
        const looksLikeImage = /^[A-Za-z0-9+/]+=*$/.test(photo) && (photo.startsWith('/9j/') || photo.startsWith('iVBOR'));
        if (looksLikeImage) return { base64: photo, mimetype: 'image/jpeg' };
        return null;
      }
      if (photo && photo.base64) {
        const base64 = decrypt(photo.base64);
        if (base64) return { ...photo, base64 };
        return null; // Çözülemediyse listeye ekleme (yanlış anahtar vb.)
      }
      return null;
    }).filter(Boolean);
  }
  
  // Notları çöz
  if (decrypted.notes) {
    decrypted.notes = decrypt(decrypted.notes) || '';
  }
  
  return decrypted;
};
