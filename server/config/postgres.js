import { Sequelize } from 'sequelize';

// PostgreSQL bağlantı durumu
let sequelize = null;
let isConnected = false;

export const connectPostgres = async (retries = 3) => {
  // Zaten bağlıysa tekrar bağlanma
  if (isConnected && sequelize && await sequelize.authenticate()) {
    console.log('✅ PostgreSQL zaten bağlı');
    return sequelize;
  }

  // Eğer mevcut bağlantı varsa kapat
  if (sequelize) {
    try {
      await sequelize.close();
    } catch (e) {
      // Bağlantı zaten kapalıysa hata verme
    }
    sequelize = null;
    isConnected = false;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // PostgreSQL connection string
      const POSTGRES_URI = process.env.POSTGRES_URI || 
        process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        'postgresql://fotografkutusu_com_user:vzsIGuEbtFRviZ2RNCvkwLFzxGIDmKW1@dpg-d5rsv3ggjchc73fbbm80-a.frankfurt-postgres.render.com/fotografkutusu_com';

      // Sequelize bağlantısı oluştur
      sequelize = new Sequelize(POSTGRES_URI, {
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 1,
          acquire: 30000,
          idle: 10000
        },
        dialectOptions: {
          // Render.com PostgreSQL SSL gerektiriyor
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      });

      // Bağlantıyı test et
      await sequelize.authenticate();

      isConnected = true;
      console.log('✅ PostgreSQL bağlantısı başarılı');

      return sequelize;
    } catch (error) {
      console.error(`❌ PostgreSQL bağlantı hatası (deneme ${attempt}/${retries}):`, error.message);
      isConnected = false;
      
      if (sequelize) {
        try {
          await sequelize.close();
        } catch (e) {}
        sequelize = null;
      }
      
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
export const getPostgres = () => {
  if (!isConnected || !sequelize) {
    throw new Error('PostgreSQL bağlantısı yok. connectPostgres() çağrılmalı.');
  }
  return sequelize;
};

// Bağlantıyı kapat
export const disconnectPostgres = async () => {
  if (sequelize && isConnected) {
    await sequelize.close();
    sequelize = null;
    isConnected = false;
    console.log('✅ PostgreSQL bağlantısı kapatıldı');
  }
};

export default sequelize;
