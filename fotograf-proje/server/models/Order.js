import { getDB } from '../config/database.js';
import { encryptSensitiveFields, decryptSensitiveFields } from '../utils/encryption.js';

const OrderModel = {
  // Yeni sipariş oluştur (hassas bilgileri şifreleyerek)
  create: (orderData) => {
    const db = getDB();
    
    // Hassas bilgileri şifrele
    const encryptedData = encryptSensitiveFields(orderData);
    
    const stmt = db.prepare(`
      INSERT INTO orders (
        photo_filename, photo_originalName, photo_base64, photo_mimetype, photo_size,
        size, customWidth, customHeight, quantity, frameType, paperType, colorMode, shippingType,
        customer_firstName, customer_lastName, customer_email, customer_phone, customer_address,
        price, status, paymentStatus, notes, isEncrypted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      encryptedData.photo.filename || encryptedData.photo.originalName,
      encryptedData.photo.originalName,
      encryptedData.photo.base64 || null, // Şifrelenmiş
      encryptedData.photo.mimetype || null,
      encryptedData.photo.size || null,
      encryptedData.size,
      encryptedData.customSize?.width || null,
      encryptedData.customSize?.height || null,
      encryptedData.quantity,
      encryptedData.frameType || 'standard',
      encryptedData.paperType || 'glossy',
      encryptedData.colorMode || 'color',
      encryptedData.shippingType || 'standard',
      encryptedData.customerInfo?.firstName || null, // Şifrelenmiş
      encryptedData.customerInfo?.lastName || null, // Şifrelenmiş
      encryptedData.customerInfo?.email || null, // Şifrelenmiş
      encryptedData.customerInfo?.phone || null, // Şifrelenmiş
      encryptedData.customerInfo?.address || null, // Şifrelenmiş
      encryptedData.price,
      encryptedData.status || 'Yeni',
      encryptedData.paymentStatus || 'pending',
      encryptedData.notes || null, // Şifrelenmiş
      1 // isEncrypted = true
    );
    
    return OrderModel.findById(result.lastInsertRowid, true); // Admin için çöz
  },
  
  // Tüm siparişleri getir (sadece admin için çözülmüş)
  findAll: (isAdmin = false) => {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC');
    const orders = stmt.all();
    
    // SQLite'dan gelen veriyi MongoDB formatına çevir
    return orders.map(order => OrderModel.formatOrder(order, isAdmin));
  },
  
  // ID'ye göre sipariş getir (sadece admin için çözülmüş)
  findById: (id, isAdmin = false) => {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
    const order = stmt.get(id);
    
    if (!order) return null;
    return OrderModel.formatOrder(order, isAdmin);
  },
  
  // Sipariş formatını MongoDB formatına çevir (sadece admin için çözülmüş)
  formatOrder: (order, isAdmin = false) => {
    // Şifrelenmiş veriyi hazırla
    const encryptedOrder = {
      _id: order.id.toString(),
      photo: {
        filename: order.photo_filename,
        originalName: order.photo_originalName,
        base64: order.photo_base64, // Şifrelenmiş
        mimetype: order.photo_mimetype,
        size: order.photo_size
      },
      size: order.size,
      customSize: order.customWidth && order.customHeight ? {
        width: order.customWidth,
        height: order.customHeight
      } : undefined,
      quantity: order.quantity,
      frameType: order.frameType,
      paperType: order.paperType,
      colorMode: order.colorMode,
      shippingType: order.shippingType,
      customerInfo: {
        firstName: order.customer_firstName, // Şifrelenmiş
        lastName: order.customer_lastName, // Şifrelenmiş
        email: order.customer_email, // Şifrelenmiş
        phone: order.customer_phone, // Şifrelenmiş
        address: order.customer_address // Şifrelenmiş
      },
      price: order.price,
      status: order.status,
      paymentStatus: order.paymentStatus,
      notes: order.notes, // Şifrelenmiş
      isEncrypted: order.isEncrypted === 1,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
    
    // Sadece admin ise şifreleri çöz
    if (isAdmin && order.isEncrypted === 1) {
      return decryptSensitiveFields(encryptedOrder);
    }
    
    // Admin değilse hassas bilgileri gizle
    if (!isAdmin) {
      encryptedOrder.customerInfo = {
        firstName: '***',
        lastName: '***',
        email: '***',
        phone: '***',
        address: '***'
      };
      encryptedOrder.photo.base64 = null;
      encryptedOrder.notes = null;
    }
    
    return encryptedOrder;
  },
  
  // Sipariş durumunu güncelle
  updateStatus: (id, status) => {
    const db = getDB();
    const stmt = db.prepare('UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(status, id);
    return OrderModel.findById(id);
  },
  
  // Sipariş sil
  delete: (id) => {
    const db = getDB();
    const stmt = db.prepare('DELETE FROM orders WHERE id = ?');
    stmt.run(id);
    return true;
  },
  
  // Tüm siparişleri sil
  deleteAll: () => {
    const db = getDB();
    const stmt = db.prepare('DELETE FROM orders');
    const result = stmt.run();
    return result.changes; // Silinen kayıt sayısı
  }
};

export default OrderModel;

