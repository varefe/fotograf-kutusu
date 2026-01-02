import mongoose from 'mongoose';
import { encryptSensitiveFields, decryptSensitiveFields } from '../utils/encryption.js';

// Order Schema
const orderSchema = new mongoose.Schema({
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
    // Sadece admin ise şifreleri çöz
    if (isAdmin && order.isEncrypted) {
      return decryptSensitiveFields(order);
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

    return order;
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

