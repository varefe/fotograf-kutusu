import mongoose from 'mongoose';

// MongoDB bağlantı durumu
let isConnected = false;

export const connectDB = async (retries = 3) => {
  // Zaten bağlıysa tekrar bağlanma
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB zaten bağlı');
    return mongoose.connection;
  }

  // Bağlantı durumunu kontrol et - eğer bağlıysa ama isConnected false ise, durumu güncelle
  if (mongoose.connection.readyState === 1 && !isConnected) {
    console.log('✅ MongoDB bağlantısı aktif, durum güncellendi');
    isConnected = true;
    return mongoose.connection;
  }

  // Eğer bağlantı kesilmişse, mevcut bağlantıyı temizle
  if (mongoose.connection.readyState !== 0 && mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connection.close();
    } catch (e) {
      // Bağlantı zaten kapalıysa hata verme
    }
    isConnected = false;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // MongoDB connection string
      const MONGODB_URI = process.env.MONGODB_URI || 
        'mongodb://mongo:DpZZNKhEweSoBgjnsTmwjOpjpmtRlSqP@yamanote.proxy.rlwy.net:38288';

      // Bağlantı seçenekleri
      // Mongoose 7+ versiyonunda useNewUrlParser ve useUnifiedTopology artık desteklenmiyor
      const options = {
        serverSelectionTimeoutMS: 10000, // 10 saniye timeout (azaltıldı - daha hızlı hata)
        socketTimeoutMS: 30000, // 30 saniye socket timeout
        connectTimeoutMS: 10000, // 10 saniye bağlantı timeout
        retryWrites: true,
        retryReads: true,
        maxPoolSize: 5, // Connection pool boyutu (azaltıldı)
        minPoolSize: 1, // Minimum connection sayısı (azaltıldı)
        maxIdleTimeMS: 60000, // 60 saniye idle timeout (artırıldı)
        heartbeatFrequencyMS: 5000, // 5 saniyede bir heartbeat (daha sık)
        directConnection: false, // Replica set kullan
        family: 4, // IPv4 kullan
      };

      // MongoDB'ye bağlan
      await mongoose.connect(MONGODB_URI, options);

      isConnected = true;
      console.log('✅ MongoDB bağlantısı başarılı');

      // Bağlantı event'lerini dinle (sadece bir kez)
      if (!mongoose.connection.listeners('error').length) {
        mongoose.connection.on('error', (err) => {
          console.error('❌ MongoDB bağlantı hatası:', err.message);
          isConnected = false;
          // Hata durumunda otomatik yeniden bağlanmayı dene (5 saniye sonra)
          setTimeout(() => {
            if (!isConnected && mongoose.connection.readyState === 0) {
              console.log('🔄 MongoDB otomatik yeniden bağlanma deneniyor...');
              connectDB(3).catch(() => {}); // Hata durumunda sessizce devam et
            }
          }, 5000);
        });

        mongoose.connection.on('disconnected', () => {
          console.warn('⚠️ MongoDB bağlantısı kesildi');
          isConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
          console.log('✅ MongoDB yeniden bağlandı');
          isConnected = true;
        });
      }
      
      return mongoose.connection;
    } catch (error) {
      console.error(`❌ MongoDB bağlantı hatası (deneme ${attempt}/${retries}):`, error.message);
      isConnected = false;
      
      if (attempt < retries) {
        const delay = attempt * 1000; // 1s, 2s, 3s
        console.log(`⏳ ${delay/1000} saniye sonra tekrar denenecek...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
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

