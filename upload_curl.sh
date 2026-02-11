#!/bin/bash

# FTP ile domain'e (fotografkutusu.com) yükleme
# Kullanım: ./upload_curl.sh
# Veya:    FTP_USER=kullanici FTP_PASS=sifre ./upload_curl.sh

HOST="${FTP_HOST:-fotografkutusu.com}"
USER="${FTP_USER:-pfotogex}"
# Şifre } ile bitiyorsa FTP_PASS ile verin: FTP_PASS='sifreniz' ./upload_curl.sh
PASS="${FTP_PASS:-fot539IJdh}"
REMOTE_DIR="public_html"
LOCAL_DIR="dist"

echo "📤 Domain'e FTP yükleme: $HOST"
echo ""

cd "$(dirname "$0")"

if [ ! -d "$LOCAL_DIR" ]; then
    echo "❌ $LOCAL_DIR/ klasörü yok. Önce build alın:"
    echo "   VITE_API_URL=https://heartfelt-embrace-production-8a92.up.railway.app npm run build:full"
    exit 1
fi

if [ ! -f "$LOCAL_DIR/index.html" ]; then
    echo "❌ $LOCAL_DIR/index.html yok. Önce: npm run build:full"
    exit 1
fi

# .htaccess yoksa kökten kopyala (SPA routing için gerekli)
if [ ! -f "$LOCAL_DIR/.htaccess" ] && [ -f ".htaccess" ]; then
    cp .htaccess "$LOCAL_DIR/.htaccess"
    echo "📋 .htaccess dist'e kopyalandı"
fi

upload_file() {
    local file=$1
    local remote_path=${file#$LOCAL_DIR/}
    
    if [ -d "$file" ]; then
        return 0
    fi
    
    echo -n "   $remote_path ... "
    curl -T "$file" -u "$USER:$PASS" "ftp://$HOST/$REMOTE_DIR/$remote_path" --ftp-create-dirs --silent --show-error -w "%{http_code}" -o /dev/null 2>/dev/null
    local ret=$?
    if [ $ret -eq 0 ]; then
        echo "✅"
    else
        echo "❌ (curl exit $ret)"
        return 1
    fi
}

echo "📤 Dosyalar yükleniyor..."
upload_file "$LOCAL_DIR/.htaccess" 2>/dev/null || true
upload_file "$LOCAL_DIR/index.html"

for file in "$LOCAL_DIR"/*; do
    [ -e "$file" ] || continue
    if [ -f "$file" ]; then
        upload_file "$file"
    fi
done

if [ -d "$LOCAL_DIR/assets" ]; then
    for file in "$LOCAL_DIR/assets"/*; do
        [ -f "$file" ] && upload_file "$file"
    done
fi

echo ""
echo "✅ Yükleme bitti. Site: https://$HOST"
