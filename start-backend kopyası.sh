#!/bin/bash

# Backend sunucusunu başlatma script'i
# Production için kullanın

cd "$(dirname "$0")"

# .env dosyasını kontrol et
if [ ! -f .env ]; then
    echo "⚠️  .env dosyası bulunamadı!"
    echo "📝 Lütfen .env dosyasını oluşturun"
    exit 1
fi

# Node.js versiyonunu kontrol et
if ! command -v node &> /dev/null; then
    echo "❌ Node.js bulunamadı!"
    exit 1
fi

echo "🚀 Backend sunucusu başlatılıyor..."
echo "📍 Port: ${PORT:-5000}"
echo "🌐 Environment: ${NODE_ENV:-production}"

# PM2 varsa PM2 ile başlat, yoksa direkt node ile
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 bulundu, PM2 ile başlatılıyor..."
    pm2 start server/server.js --name "fotograf-backend" --env production
    pm2 save
    echo "✅ Backend PM2 ile başlatıldı"
    echo "📊 Durum kontrolü: pm2 status"
    echo "📋 Loglar: pm2 logs fotograf-backend"
else
    echo "⚠️  PM2 bulunamadı, direkt node ile başlatılıyor..."
    echo "💡 PM2 kurulumu için: npm install -g pm2"
    NODE_ENV=production PORT=${PORT:-5000} node server/server.js
fi

