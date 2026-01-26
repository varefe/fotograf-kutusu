/**
 * Güvenlik Middleware'leri
 * Ek güvenlik katmanları
 */

/**
 * Request logging (güvenlik için)
 */
export const securityLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('user-agent') || 'Unknown';
  
  // Şüpheli aktivite logla
  if (method === 'POST' && (url.includes('/api/orders') || url.includes('/api/payment'))) {
    console.log(`[SECURITY] ${timestamp} - ${ip} - ${method} ${url} - ${userAgent}`);
  }
  
  next();
};

/**
 * IP adresini sayıya çevir
 */
const ipToNumber = (ip) => {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
};

/**
 * CIDR notasyonunu kontrol et (örn: 74.220.51.0/24)
 */
const isIPInCIDR = (ip, cidr) => {
  const [network, prefixLength] = cidr.split('/');
  const prefix = parseInt(prefixLength, 10);
  const networkNum = ipToNumber(network);
  const ipNum = ipToNumber(ip);
  const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
  return (ipNum & mask) === (networkNum & mask);
};

/**
 * IP whitelist (opsiyonel - admin için)
 * CIDR notasyonu destekler (örn: 74.220.51.0/24)
 */
export const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      // Whitelist yoksa tüm IP'lere izin ver
      return next();
    }
    
    // Client IP'yi al (proxy arkasındaysa X-Forwarded-For header'ını kontrol et)
    let clientIP = req.ip || req.connection.remoteAddress;
    
    // X-Forwarded-For header'ını kontrol et (reverse proxy arkasında)
    if (req.headers['x-forwarded-for']) {
      const forwardedIPs = req.headers['x-forwarded-for'].split(',');
      clientIP = forwardedIPs[0].trim();
    }
    
    // IPv6 localhost'u IPv4'e çevir
    if (clientIP === '::1' || clientIP === '::ffff:127.0.0.1') {
      clientIP = '127.0.0.1';
    }
    // IPv6 formatını temizle
    if (clientIP.startsWith('::ffff:')) {
      clientIP = clientIP.replace('::ffff:', '');
    }
    
    // IP veya CIDR kontrolü
    let isAllowed = false;
    for (const allowed of allowedIPs) {
      if (allowed.includes('/')) {
        // CIDR notasyonu
        if (isIPInCIDR(clientIP, allowed)) {
          isAllowed = true;
          break;
        }
      } else {
        // Tek IP
        if (clientIP === allowed) {
          isAllowed = true;
          break;
        }
      }
    }
    
    if (isAllowed) {
      next();
    } else {
      console.warn(`[SECURITY] IP whitelist reddedildi: ${clientIP} - ${req.method} ${req.path}`);
      res.status(403).json({
        success: false,
        error: 'Erişim reddedildi',
        message: 'IP adresiniz izin verilen listede değil'
      });
    }
  };
};

/**
 * Request size kontrolü
 */
export const requestSizeLimiter = (maxSize = '50mb') => {
  return (req, res, next) => {
    const contentLength = req.get('content-length');
    
    if (contentLength) {
      const maxBytes = parseSize(maxSize);
      const requestBytes = parseInt(contentLength);
      
      if (requestBytes > maxBytes) {
        return res.status(413).json({
          success: false,
          error: 'İstek çok büyük',
          message: `Maksimum boyut: ${maxSize}`
        });
      }
    }
    
    next();
  };
};

/**
 * Size string'i byte'a çevir
 */
const parseSize = (size) => {
  const units = {
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };
  
  const match = size.toLowerCase().match(/^(\d+)(kb|mb|gb)$/);
  if (match) {
    return parseInt(match[1]) * units[match[2]];
  }
  
  return 50 * 1024 * 1024; // Default 50MB
};

/**
 * Helmet benzeri güvenlik header'ları
 */
export const securityHeaders = (req, res, next) => {
  // Content Security Policy (CSP) - iyzico için güncellendi
  // Development modunda CSP'yi gevşet (iyzico font sorunları için)
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('Content-Security-Policy', 
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
      "style-src 'self' 'unsafe-inline' https:; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data: https:; " +
      "connect-src 'self' https: http://localhost:*; " +
      "frame-src 'self' https:;"
    );
  } else {
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.iyzipay.com; " +
      "style-src 'self' 'unsafe-inline' https://static.iyzipay.com; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data: blob:; " + // İyzico fontlarını engelle, sadece kendi fontlarımızı kullan
      "connect-src 'self' https://api.iyzipay.com https://sandbox-api.iyzipay.com; " +
      "frame-src 'self' https://static.iyzipay.com;"
    );
  }
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions-Policy
  res.setHeader('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=()'
  );
  
  next();
};
