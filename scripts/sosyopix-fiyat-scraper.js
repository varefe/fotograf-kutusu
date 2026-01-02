// Sosyopix fiyat bilgilerini toplama script'i
// Not: Bu script sadece referans için. Manuel olarak fiyatları güncellemek daha güvenli olabilir.

import https from 'https';
import fs from 'fs';

// Sosyopix'ten fiyat bilgilerini toplama (manuel olarak güncellenebilir)
const sosyopixPrices = {
  // Klasik Baskılar
  '10x15': {
    parlak: 15, // TL (tahmini)
    mat: 17, // TL (tahmini)
    description: '10x15 cm Klasik Fotoğraf Baskı'
  },
  '15x20': {
    parlak: 18, // TL (tahmini)
    mat: 20, // TL (tahmini)
    description: '15x20 cm Klasik Fotoğraf Baskı'
  },
  '20x30': {
    parlak: 25, // TL (tahmini)
    mat: 27, // TL (tahmini)
    description: '20x30 cm Klasik Fotoğraf Baskı'
  },
  '30x40': {
    parlak: 35, // TL (tahmini)
    mat: 37, // TL (tahmini)
    description: '30x40 cm Klasik Fotoğraf Baskı'
  },
  // Pola Baskılar
  'pola-9x11': {
    parlak: 10, // TL (tahmini, 35 adet için 279.90 TL / 35)
    mat: 8, // TL (tahmini)
    description: '9x11 cm Pola Baskı'
  },
  // Kare Baskılar
  'kare-10x10': {
    parlak: 12, // TL (tahmini)
    mat: 14, // TL (tahmini)
    description: '10x10 cm Kare Baskı'
  },
  // Kargo
  shipping: {
    standard: 15, // TL
    express: 35, // TL
    freeOver: 99 // TL üzeri ücretsiz kargo
  }
};

// Fiyatları JSON dosyasına kaydet
const pricesJson = JSON.stringify(sosyopixPrices, null, 2);
fs.writeFileSync('sosyopix-prices.json', pricesJson, 'utf8');
console.log('✅ Sosyopix fiyatları sosyopix-prices.json dosyasına kaydedildi');

export default sosyopixPrices;

