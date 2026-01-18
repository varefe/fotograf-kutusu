import mongoose from 'mongoose';
import { encryptSensitiveFields, decryptSensitiveFields } from '../utils/encryption.js';

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Opsiyonel - misafir siparişleri için null olabilir
  },
  photo: {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    base64: { type: String }, // Şifrelenmiş
    mimetype: { type: String },
    size: { type: Number }
  },
  size: { type: String, required: true },
  customSize: {
    width: { type: Number },
    height: { type: Number }
  },
  quantity: { type: Number, required: true, default: 1 },
  frameType: { type: String, default: 'standard' },
  paperType: { type: String, default: 'glossy' },
  colorMode: { type: String, default: 'color' },
  shippingType: { type: String, default: 'standard' },
  customerInfo: {
    firstName: { type: String }, // Şifrelenmiş
    lastName: { type: String }, // Şifrelenmiş
    email: { type: String, required: true }, // Şifrelenmiş
    phone: { type: String }, // Şifrelenmiş
    address: { type: String, required: true } // Şifrelenmiş
  },
  price: { type: Number, required: true },
  status: { type: String, default: 'Yeni' },
  paymentStatus: { type: String, default: 'pending' },
  notes: { type: String }, // Şifrelenmiş
  isEncrypted: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true // createdAt ve updatedAt otomatik yönetilir
});

// Pre-save hook: Hassas bilgileri şifrele (sadece yeni kayıt veya değişiklik varsa)
orderSchema.pre('save', function(next) {
  // Eğer zaten şifrelenmişse ve değişiklik yoksa, tekrar şifreleme
  if (!this.isEncrypted || this.isModified('customerInfo') || this.isModified('photo.base64') || this.isModified('notes')) {
    // Hassas bilgileri şifrele
    const orderData = {
      photo: this.photo,
      customerInfo: this.customerInfo,
      notes: this.notes
    };
    
    const encryptedData = encryptSensitiveFields(orderData);
    
    // Şifrelenmiş verileri güncelle
    if (encryptedData.photo) {
      this.photo = { ...this.photo, ...encryptedData.photo };
    }
    if (encryptedData.customerInfo) {
      this.customerInfo = encryptedData.customerInfo;
    }
    if (encryptedData.notes !== undefined) {
      this.notes = encryptedData.notes;
    }
    
    this.isEncrypted = true;
  }
  
  this.updatedAt = new Date();
  next();
});

// Model oluştur
const Order = mongoose.model('Order', orderSchema);

// Order Model Methods
const OrderModel = {
  // Yeni sipariş oluştur
  create: async (orderData) => {
    const order = new Order(orderData);
    const savedOrder = await order.save();
    return OrderModel.formatOrder(savedOrder.toObject(), true); // Admin için çöz
  },

  // Tüm siparişleri getir
  findAll: async (isAdmin = false) => {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    console.log(`🔍 findAll: ${orders.length} sipariş bulundu, isAdmin: ${isAdmin}`);
    
    if (orders.length === 0) {
      console.warn('⚠️ Veritabanında hiç sipariş bulunamadı!');
      return [];
    }
    
    const formattedOrders = orders.map((order, index) => {
      try {
        const orderObj = order.toObject();
        const formatted = OrderModel.formatOrder(orderObj, isAdmin);
        
        // formatOrder artık hiçbir zaman null döndürmemeli
        if (!formatted) {
          console.error(`❌ Sipariş #${orderObj._id || orderObj.id} formatOrder null döndürdü!`);
          // Yine de siparişi göster
          return orderObj;
        }
        
        // Eski sipariş kontrolü
        if (isAdmin && formatted) {
          const orderDate = formatted.createdAt ? new Date(formatted.createdAt) : null;
          if (orderDate) {
            const isOld = orderDate < new Date('2024-01-01'); // Örnek: 2024'ten önceki siparişler
            if (isOld) {
              console.log(`📅 Eski sipariş bulundu: #${formatted._id || formatted.id}, Tarih: ${orderDate.toISOString()}`);
            }
          }
        }
        
        return formatted;
      } catch (error) {
        console.error(`❌ Sipariş formatlama hatası (index ${index}):`, error);
        // Hata olsa bile siparişi göster
        return order.toObject();
      }
    });
    
    // Artık null filtreleme yok - formatOrder hiçbir zaman null döndürmemeli
    console.log(`✅ findAll: ${formattedOrders.length} sipariş formatlandı (${orders.length} ham sipariş)`);
    return formattedOrders;
  },

  // Belirli bir tarihten itibaren siparişleri getir
  findAllAfterDate: async (date, isAdmin = false) => {
    console.log('🔍 findAllAfterDate çağrıldı:', {
      filterDate: date,
      filterDateISO: date.toISOString(),
      isAdmin
    });
    
    // Tarih filtresi ile sorgu
    const query = {
      createdAt: { $gte: date }
    };
    
    console.log('🔍 MongoDB sorgusu:', JSON.stringify(query));
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    console.log(`🔍 findAllAfterDate sonucu: ${orders.length} sipariş bulundu`);
    
    if (orders.length > 0) {
      const sampleOrder = orders[0].toObject();
      console.log('🔍 Örnek sipariş tarihi:', {
        createdAt: sampleOrder.createdAt,
        createdAtISO: sampleOrder.createdAt ? new Date(sampleOrder.createdAt).toISOString() : 'Yok',
        filterDateISO: date.toISOString(),
        isAfter: sampleOrder.createdAt ? new Date(sampleOrder.createdAt) >= date : false
      });
    }
    
    return orders.map(order => OrderModel.formatOrder(order.toObject(), isAdmin));
  },

  // Kullanıcının siparişlerini getir
  findByUserId: async (userId, isAdmin = false) => {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return orders.map(order => OrderModel.formatOrder(order.toObject(), isAdmin));
  },

  // ID'ye göre sipariş getir
  findById: async (id, isAdmin = false) => {
    const order = await Order.findById(id);
    if (!order) return null;
    return OrderModel.formatOrder(order.toObject(), isAdmin);
  },

  // Sipariş formatını düzenle (sadece admin için çözülmüş)
  formatOrder: (order, isAdmin = false) => {
    // Null kontrolü - eğer order null ise, boş bir obje döndür (null değil!)
    if (!order) {
      console.warn('⚠️ formatOrder: order null veya undefined, boş obje döndürülüyor');
      return {
        _id: 'unknown',
        createdAt: new Date(),
        customerInfo: { email: '', firstName: '', lastName: '', phone: '', address: '' },
        status: 'Bilinmiyor',
        paymentStatus: 'unknown'
      };
    }

    // Admin değilse hassas bilgileri gizle
    if (!isAdmin) {
      return {
        ...order,
        customerInfo: {
          firstName: '***',
          lastName: '***',
          email: '***',
          phone: '***',
          address: '***'
        },
        photo: {
          ...order.photo,
          base64: null
        },
        notes: null
      };
    }

    // Admin ise şifreleri çöz (isEncrypted flag'ine bakmaksızın - eski siparişler için de)
    if (isAdmin) {
      try {
        // Eski siparişler için de şifre çözme işlemini dene
        // isEncrypted flag'i olmayan veya false olan siparişler için de çalışır
        const decrypted = decryptSensitiveFields(order);
        if (decrypted && decrypted !== null) {
          // Başarılı çözme - tüm alanları kontrol et
          return {
            ...order,
            ...decrypted,
            // Eğer customerInfo eksikse, orijinalinden al
            customerInfo: decrypted.customerInfo || order.customerInfo || {
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              address: ''
            }
          };
        } else {
          // Çözme başarısız ama siparişi göster (eski format olabilir)
          // Eski siparişler zaten şifrelenmemiş olabilir
          console.log(`ℹ️ Sipariş #${order._id || order.id} çözülemedi veya zaten çözülmüş, orijinal format gösteriliyor`);
          return {
            ...order,
            // customerInfo eksikse boş obje ekle
            customerInfo: order.customerInfo || {
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              address: ''
            }
          };
        }
      } catch (error) {
        console.warn(`⚠️ Sipariş #${order._id || order.id} şifre çözme hatası:`, error.message);
        // Şifre çözme başarısız olsa bile siparişi göster (eski sipariş olabilir)
        // Hiçbir zaman null döndürme!
        return {
          ...order,
          customerInfo: order.customerInfo || {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: ''
          }
        };
      }
    }

    // Son çare: order'ı olduğu gibi döndür
    return {
      ...order,
      customerInfo: order.customerInfo || {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
      }
    };
  },

  // Sipariş durumunu güncelle
  updateStatus: async (id, status) => {
    const order = await Order.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!order) return null;
    return OrderModel.formatOrder(order.toObject());
  },

  // Sipariş sil
  delete: async (id) => {
    await Order.findByIdAndDelete(id);
    return true;
  },

  // Tüm siparişleri sil
  deleteAll: async () => {
    const result = await Order.deleteMany({});
    return result.deletedCount;
  }
};

export default OrderModel;

