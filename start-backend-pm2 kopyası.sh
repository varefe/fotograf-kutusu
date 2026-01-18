#!/bin/bash

# Backend sunucusunu PM2 ile başlatma script'i
# Production için önerilen yöntem

cd "$(dirname "$0")"

# PM2 kontrolü
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 bulunamadı!"
    echo "📦 PM2 kurulumu: npm install -g pm2"
    exit 1
fi

# .env dosyasını kontrol et
if [ ! -f .env ]; then
    echo "⚠️  .env dosyası bulunamadı!"
    exit 1
fi

echo "🚀 Backend sunucusu PM2 ile başlatılıyor..."

# Eğer zaten çalışıyorsa durdur
pm2 delete fotograf-backend 2>/dev/null || true

# Yeni instance başlat
pm2 start server/server.js \
    --name "fotograf-backend" \
    --env production \
    --instances 1 \
    --max-memory-restart 500M \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --merge-logs \
    --error logs/error.log \
    --output logs/out.log

# PM2'yi kaydet (sunucu yeniden başladığında otomatik başlasın)
pm2 save

echo "✅ Backend PM2 ile başlatıldı"
echo ""
echo "📊 Komutlar:"
echo "   pm2 status              - Durum kontrolü"
echo "   pm2 logs fotograf-backend - Logları görüntüle"
echo "   pm2 restart fotograf-backend - Yeniden başlat"
echo "   pm2 stop fotograf-backend - Durdur"
echo "   pm2 delete fotograf-backend - Sil"

