#!/bin/bash

# 🚀 Production Deployment Script
# Kullanım: ./deploy.sh

echo "🚀 Production Deployment Başlatılıyor..."
echo ""

# 1. Frontend Build
echo "📦 Frontend build ediliyor..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build başarısız!"
    exit 1
fi

echo "✅ Frontend build tamamlandı (dist/ klasörü)"
echo ""

# 2. Dosya Kontrolü
echo "📋 Dosya kontrolü yapılıyor..."

if [ ! -d "dist" ]; then
    echo "❌ dist/ klasörü bulunamadı!"
    exit 1
fi

if [ ! -d "server" ]; then
    echo "❌ server/ klasörü bulunamadı!"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json bulunamadı!"
    exit 1
fi

echo "✅ Tüm gerekli dosyalar mevcut"
echo ""

# 3. Deployment Paketleri Oluştur
echo "📦 Deployment paketleri oluşturuluyor..."

# Frontend paketi
cd dist
zip -r ../frontend-deploy.zip . > /dev/null 2>&1
cd ..
echo "✅ frontend-deploy.zip oluşturuldu"

# Backend paketi
zip -r backend-deploy.zip server/ package.json package-lock.json > /dev/null 2>&1
echo "✅ backend-deploy.zip oluşturuldu"

echo ""
echo "✅ Deployment hazır!"
echo ""
echo "📤 Yayınlanacak dosyalar:"
echo "   1. frontend-deploy.zip -> Sunucuya yükleyip public_html/ içine çıkarın"
echo "   2. backend-deploy.zip -> Sunucuya yükleyip backend klasörüne çıkarın"
echo "   3. .env -> Production değerleriyle oluşturup sunucuya yükleyin"
echo ""
echo "⚠️  ÖNEMLİ: .env dosyasını production değerleriyle güncelleyin!"
echo ""
