/**
 * Input Validation ve Sanitization
 * Güvenlik için input doğrulama ve temizleme
 */

// Email format kontrolü
export const isValidEmail = (email) => {
  if (!email) return false;
  // String'e çevir (sanitize edilmiş olabilir)
  const emailStr = String(email).trim();
  if (emailStr.length === 0) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailStr);
};

// Telefon format kontrolü
export const isValidPhone = (phone) => {
  if (!phone) return true; // Opsiyonel
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone.trim());
};

// XSS koruması - HTML tag'lerini temizle
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return input;
  
  // HTML tag'lerini kaldır
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Dosya boyutu kontrolü (MB cinsinden)
export const isValidFileSize = (base64String, maxSizeMB = 10) => {
  if (!base64String) return true;
  
  // Base64 string'in boyutunu hesapla (yaklaşık)
  const base64Length = base64String.length;
  const sizeInBytes = (base64Length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  
  return sizeInMB <= maxSizeMB;
};

// Dosya tipi kontrolü
export const isValidImageType = (mimetype) => {
  if (!mimetype) return false;
  
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  return allowedTypes.includes(mimetype.toLowerCase());
};

// Dosya adı güvenliği
export const sanitizeFilename = (filename) => {
  if (!filename) return 'photo.jpg';
  
  // Zararlı karakterleri kaldır
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.\./g, '_') // Path traversal koruması
    .substring(0, 255); // Max dosya adı uzunluğu
};

// SQL Injection koruması - özel karakterleri temizle
export const sanitizeForSQL = (input) => {
  if (!input || typeof input !== 'string') return input;
  
  // SQL injection karakterlerini kaldır
  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
};

// Adres validasyonu
export const isValidAddress = (address) => {
  if (!address) return false;
  // String'e çevir (sanitize edilmiş olabilir)
  const addressStr = String(address).trim();
  // Minimum 10 karakter, maksimum 500 karakter
  return addressStr.length >= 10 && addressStr.length <= 500;
};

// İsim validasyonu
export const isValidName = (name) => {
  if (!name) return true; // Opsiyonel
  
  const trimmed = name.trim();
  // Sadece harf, boşluk ve Türkçe karakterler
  const nameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/;
  return trimmed.length <= 100 && nameRegex.test(trimmed);
};

// Boyut validasyonu
export const isValidSize = (size) => {
  const validSizes = ['10x15', '15x20', '20x30', '30x40', 'custom'];
  return validSizes.includes(size);
};

// Miktar validasyonu
export const isValidQuantity = (quantity) => {
  const qty = parseInt(quantity);
  return !isNaN(qty) && qty > 0 && qty <= 100;
};

// Özel boyut validasyonu
export const isValidCustomSize = (customSize) => {
  if (!customSize) return false;
  
  const width = parseFloat(customSize.width);
  const height = parseFloat(customSize.height);
  
  return (
    !isNaN(width) && !isNaN(height) &&
    width > 0 && width <= 200 && // Max 200cm
    height > 0 && height <= 200
  );
};

// Sipariş notları validasyonu
export const isValidNotes = (notes) => {
  if (!notes) return true; // Opsiyonel
  
  // Maksimum 1000 karakter
  return typeof notes === 'string' && notes.length <= 1000;
};

// Tüm sipariş verilerini doğrula
export const validateOrderData = (orderData) => {
  const errors = [];
  
  // Email - hem üst seviyede hem customerInfo içinde kontrol et
  const emailToValidate = String(orderData.email || orderData.customerInfo?.email || '').trim();
  console.log('🔍 Email validasyonu:', { emailToValidate, length: emailToValidate.length, isValid: isValidEmail(emailToValidate) });
  if (!emailToValidate || !isValidEmail(emailToValidate)) {
    errors.push('Geçersiz e-posta adresi');
  }
  
  // Telefon
  const phoneToValidate = orderData.phone || orderData.customerInfo?.phone || '';
  if (phoneToValidate && !isValidPhone(phoneToValidate)) {
    errors.push('Geçersiz telefon numarası');
  }
  
  // Adres - hem üst seviyede hem customerInfo içinde kontrol et
  const addressToValidate = String(orderData.address || orderData.customerInfo?.address || '').trim();
  console.log('🔍 Address validasyonu:', { addressToValidate, length: addressToValidate.length, isValid: isValidAddress(addressToValidate) });
  if (!addressToValidate || !isValidAddress(addressToValidate)) {
    errors.push('Adres en az 10 karakter olmalıdır');
  }
  
  // İsim
  if (orderData.firstName && !isValidName(orderData.firstName)) {
    errors.push('Geçersiz isim formatı');
  }
  
  if (orderData.lastName && !isValidName(orderData.lastName)) {
    errors.push('Geçersiz soyisim formatı');
  }
  
  // Boyut
  if (!isValidSize(orderData.size)) {
    errors.push('Geçersiz boyut seçimi');
  }
  
  // Özel boyut
  if (orderData.size === 'custom' && !isValidCustomSize(orderData.customSize)) {
    errors.push('Geçersiz özel boyut (0-200cm arası)');
  }
  
  // Miktar
  if (!isValidQuantity(orderData.quantity)) {
    errors.push('Miktar 1-100 arası olmalıdır');
  }
  
  // Fotoğraf - photos array veya photo objesi kontrolü
  const hasPhotos = orderData.photos && Array.isArray(orderData.photos) && orderData.photos.length > 0;
  const hasPhoto = orderData.photo && orderData.photo.base64;
  // Ödemeyi atla / gözden geçir akışı: önce sipariş fotoğrafsız kaydedilir, fotoğraflar PATCH ile sonra eklenir
  const notesStr = orderData.notes && typeof orderData.notes === 'string' ? orderData.notes : '';
  const photosDeferred = orderData.photos && Array.isArray(orderData.photos) && orderData.photos.length === 0 &&
    notesStr && (notesStr.includes('ödeme sonrası eklenecek') || notesStr.includes('sonrası eklenecek'));

  if (!hasPhotos && !hasPhoto && !photosDeferred) {
    errors.push('Fotoğraf gerekli');
  } else if (!photosDeferred) {
    // photos array varsa onu kullan, yoksa photo objesini kullan
    const photosToValidate = hasPhotos ? orderData.photos : (orderData.photo ? [orderData.photo] : []);
    const isTestMode = orderData.paymentStatus === 'test';
    
    photosToValidate.forEach((photo, index) => {
      if (!photo || !photo.base64) {
        errors.push(`Fotoğraf ${index + 1} geçersiz`);
        return;
      }
      
      if (!isTestMode) {
        // Normal modda dosya boyutu kontrolü yap
        if (!isValidFileSize(photo.base64, 10)) {
          errors.push(`Fotoğraf ${index + 1} boyutu 10MB'dan küçük olmalıdır`);
        }
      }
      
      // Dosya tipi
      if (photo.mimetype && !isValidImageType(photo.mimetype)) {
        errors.push(`Fotoğraf ${index + 1}: Sadece JPEG, PNG, GIF veya WebP formatları kabul edilir`);
      }
      
      // Dosya adı
      if (photo.filename) {
        photo.filename = sanitizeFilename(photo.filename);
      }
    });
  }
  
  // Notlar
  if (orderData.notes && !isValidNotes(orderData.notes)) {
    errors.push('Notlar maksimum 1000 karakter olabilir');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
