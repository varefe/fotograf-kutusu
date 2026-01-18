#!/bin/bash

# FTP Upload Script
HOST="fotografkutusu.com"
USER="pfotogex"
PASS="fot539IJdh}"
REMOTE_DIR="public_html"
LOCAL_DIR="dist"

echo "📤 FTP ile dosya yükleme başlıyor..."
echo "Host: $HOST"
echo "Kullanıcı: $USER"
echo ""

# FTP komutlarını dosyaya yaz
cat > /tmp/ftp_commands.txt << EOF
cd $REMOTE_DIR
binary
prompt
mput $LOCAL_DIR/*
quit
EOF

# FTP ile bağlan ve yükle
cd "$(dirname "$0")"
lftp -u $USER,$PASS $HOST << EOF
cd $REMOTE_DIR
mirror -R $LOCAL_DIR/ .
quit
EOF

if [ $? -eq 0 ]; then
    echo "✅ Dosyalar başarıyla yüklendi!"
else
    echo "❌ Yükleme sırasında hata oluştu"
    exit 1
fi
