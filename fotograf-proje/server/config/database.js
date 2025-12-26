import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database dosyası yolu
const dbPath = path.join(__dirname, '../../data/orders.db');
const dbDir = path.dirname(dbPath);

// Data klasörünü oluştur
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`✅ Data klasörü oluşturuldu: ${dbDir}`);
}

// SQLite database bağlantısı
let db = null;

export const connectDB = () => {
  try {
    db = new Database(dbPath);
    
    // WAL mode (Write-Ahead Logging) - daha iyi performans
    db.pragma('journal_mode = WAL');
    
    console.log(`✅ SQLite database bağlantısı başarılı: ${dbPath}`);
    
    // Tabloyu oluştur (eğer yoksa)
    createTables();
    
    return db;
  } catch (error) {
    console.error('❌ SQLite bağlantı hatası:', error.message);
    throw error;
  }
};

const createTables = () => {
  const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      photo_filename TEXT NOT NULL,
      photo_originalName TEXT NOT NULL,
      photo_base64 TEXT,
      photo_mimetype TEXT,
      photo_size INTEGER,
      size TEXT NOT NULL,
      customWidth REAL,
      customHeight REAL,
      quantity INTEGER NOT NULL DEFAULT 1,
      frameType TEXT DEFAULT 'standard',
      paperType TEXT DEFAULT 'glossy',
      colorMode TEXT DEFAULT 'color',
      shippingType TEXT DEFAULT 'standard',
      customer_firstName TEXT,
      customer_lastName TEXT,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      customer_address TEXT,
      price REAL NOT NULL,
      status TEXT DEFAULT 'Yeni',
      paymentStatus TEXT DEFAULT 'pending',
      notes TEXT,
      isEncrypted INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.exec(createOrdersTable);
  console.log('✅ Orders tablosu hazır');
  
  // Mevcut tabloya isEncrypted kolonu ekle (eğer yoksa)
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN isEncrypted INTEGER DEFAULT 1`);
    console.log('✅ isEncrypted kolonu eklendi');
  } catch (error) {
    // Kolon zaten varsa hata vermez, devam et
    if (!error.message.includes('duplicate column')) {
      console.log('ℹ️ isEncrypted kolonu zaten mevcut veya eklenemedi');
    }
  }
};

export const getDB = () => {
  if (!db) {
    connectDB();
  }
  return db;
};

export default db;

