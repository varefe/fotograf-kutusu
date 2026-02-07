import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Geçerli bir e-posta adresi giriniz']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Bildirim tercihleri
  notificationPreferences: {
    email: {
      orderStatus: { type: Boolean, default: true },
      orderShipped: { type: Boolean, default: true },
      orderDelivered: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false }
    },
    sms: {
      orderStatus: { type: Boolean, default: false },
      orderShipped: { type: Boolean, default: false },
      orderDelivered: { type: Boolean, default: false }
    },
    push: {
      enabled: { type: Boolean, default: true },
      orderStatus: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true }
    }
  },
  // Push notification subscription
  pushSubscription: {
    endpoint: { type: String },
    keys: {
      p256dh: { type: String },
      auth: { type: String }
    }
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

// Şifreyi hashle (kayıt öncesi)
userSchema.pre('save', async function() {
  // Eğer şifre değişmemişse, hashleme
  if (!this.isModified('password')) {
    return;
  }

  // Şifreyi hashle
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Kullanıcı bilgilerini güvenli şekilde döndür (şifre hariç)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Model oluştur
const User = mongoose.model('User', userSchema);

export default User;

