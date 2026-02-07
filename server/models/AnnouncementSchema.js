import mongoose from 'mongoose';

// Announcement/Popup Schema
const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['campaign', 'new_product', 'special_offer', 'info'],
    default: 'info'
  },
  image: {
    type: String, // URL veya base64
    default: null
  },
  link: {
    url: { type: String, default: null },
    text: { type: String, default: null }
  },
  buttonText: {
    type: String,
    default: 'Tamam'
  },
  // Görüntüleme ayarları
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  // Hangi sayfalarda gösterilecek
  showOnPages: {
    type: [String],
    default: ['all'] // 'all', 'home', 'product', 'cart', etc.
  },
  // Kullanıcı segmentasyonu
  targetAudience: {
    type: String,
    enum: ['all', 'new_users', 'returning_users', 'vip'],
    default: 'all'
  },
  // Görüntüleme sıklığı
  displayFrequency: {
    type: String,
    enum: ['once', 'daily', 'always'],
    default: 'once'
  },
  // İstatistikler
  viewCount: {
    type: Number,
    default: 0
  },
  clickCount: {
    type: Number,
    default: 0
  },
  // Öncelik (yüksek öncelik önce gösterilir)
  priority: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
announcementSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
announcementSchema.index({ priority: -1, createdAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
