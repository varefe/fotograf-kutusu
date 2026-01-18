#!/bin/bash

# Backend'i SSH ile uzak sunucuda başlatma script'i
# cPanel erişilemiyorsa bu script'i kullanın

HOST="fotografkutusu.com"
USER="pfotogex"
PASS="fot539IJdh}"

echo "🚀 Backend'i uzak sunucuda başlatılıyor..."
echo "📍 Host: $HOST"
echo ""

# SSH ile bağlan ve backend'i başlat
sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no ${USER}@${HOST} << 'ENDSSH'
  # Proje klasörünü bul
  cd ~/fotograf-proje 2>/dev/null || cd ~/public_html 2>/dev/null || cd ~
  
  # Node.js versiyonunu kontrol et
  if ! command -v node &> /dev/null; then
    echo "❌ Node.js bulunamadı!"
    exit 1
  fi
  
  echo "✅ Node.js versiyonu: $(node --version)"
  
  # PM2 kontrolü
  if command -v pm2 &> /dev/null; then
    echo "✅ PM2 bulundu"
    
    # Eski backend'i durdur
    pm2 delete fotograf-backend 2>/dev/null || true
    
    # Backend'i başlat
    cd ~/fotograf-proje 2>/dev/null || cd ~/public_html 2>/dev/null || cd ~
    pm2 start server/server.js --name "fotograf-backend" --env production
    pm2 save
    
    echo "✅ Backend PM2 ile başlatıldı"
    pm2 status
  else
    echo "⚠️  PM2 bulunamadı, direkt node ile başlatılıyor..."
    echo "💡 PM2 kurulumu için: npm install -g pm2"
    
    # Direkt node ile başlat (arka planda)
    cd ~/fotograf-proje 2>/dev/null || cd ~/public_html 2>/dev/null || cd ~
    nohup node server/server.js > backend.log 2>&1 &
    echo $! > backend.pid
    echo "✅ Backend başlatıldı (PID: $(cat backend.pid))"
  fi
  
  # Health check
  sleep 2
  echo ""
  echo "🔍 Health check yapılıyor..."
  curl -s http://localhost:5000/api/health || echo "⚠️  Backend henüz hazır değil, birkaç saniye bekleyin"
ENDSSH

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Backend başarıyla başlatıldı!"
else
  echo ""
  echo "❌ Backend başlatılamadı"
  echo "💡 Manuel olarak SSH ile bağlanıp başlatabilirsiniz:"
  echo "   ssh ${USER}@${HOST}"
  echo "   cd ~/fotograf-proje"
  echo "   pm2 start server/server.js --name fotograf-backend --env production"
fi

