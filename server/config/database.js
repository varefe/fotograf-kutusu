import mongoose from 'mongoose';

// MongoDB bağlantı durumu
let isConnected = false;

export const connectDB = async () => {
  // Zaten bağlıysa tekrar bağlanma
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB zaten bağlı');
    return mongoose.connection;
  }

  try {
    // MongoDB connection string
    const MONGODB_URI = process.env.MONGODB_URI || 
      'mongodb://mongo:DpZZNKhEweSoBgjnsTmwjOpjpmtRlSqP@yamanote.proxy.rlwy.net:38288';

    // Bağlantı seçenekleri
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 saniye timeout
      socketTimeoutMS: 45000, // 45 saniye socket timeout
    };

    // MongoDB'ye bağlan
    await mongoose.connect(MONGODB_URI, options);

    isConnected = true;
    console.log('✅ MongoDB bağlantısı başarılı');

    // Bağlantı event'lerini dinle
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB bağlantı hatası:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB bağlantısı kesildi');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB yeniden bağlandı');
      isConnected = true;
    });

    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
    isConnected = false;
    throw error;
  }
};

// Bağlantı durumunu kontrol et
export const getDB = () => {
  if (!isConnected || mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB bağlantısı yok. connectDB() çağrılmalı.');
  }
  return mongoose.connection;
};

// Bağlantıyı kapat
export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('✅ MongoDB bağlantısı kapatıldı');
  }
};

export default mongoose.connection;

