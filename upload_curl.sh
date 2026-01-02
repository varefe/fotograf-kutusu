#!/bin/bash

# FTP Upload using curl
HOST="fotografkutusu.com"
USER="pfotogex"
PASS="fot539IJdh}"
REMOTE_DIR="public_html"
LOCAL_DIR="dist"

echo "📤 FTP ile dosya yükleme başlıyor..."
echo "Host: $HOST"
echo ""

cd "$(dirname "$0")"

# Tüm dosyaları yükle
upload_file() {
    local file=$1
    local remote_path=${file#$LOCAL_DIR/}
    
    if [ -d "$file" ]; then
        echo "📁 Klasör atlanıyor: $file"
        return
    fi
    
    echo "📤 Yükleniyor: $remote_path"
    
    curl -T "$file" \
        -u "$USER:$PASS" \
        "ftp://$HOST/$REMOTE_DIR/$remote_path" \
        --ftp-create-dirs \
        --silent --show-error
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Başarılı"
    else
        echo "   ❌ Hata"
        return 1
    fi
}

# Önce .htaccess'i yükle
if [ -f "$LOCAL_DIR/.htaccess" ]; then
    upload_file "$LOCAL_DIR/.htaccess"
fi

# index.html'i yükle
if [ -f "$LOCAL_DIR/index.html" ]; then
    upload_file "$LOCAL_DIR/index.html"
fi

# assets klasöründeki dosyaları yükle
if [ -d "$LOCAL_DIR/assets" ]; then
    for file in "$LOCAL_DIR/assets"/*; do
        if [ -f "$file" ]; then
            upload_file "$file"
        fi
    done
fi

# vite.svg'i yükle
if [ -f "$LOCAL_DIR/vite.svg" ]; then
    upload_file "$LOCAL_DIR/vite.svg"
fi

echo ""
echo "✅ Yükleme tamamlandı!"
echo "🌐 Site: https://$HOST"
