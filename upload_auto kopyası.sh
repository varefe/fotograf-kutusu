#!/bin/bash

# Otomatik Upload Script - Tüm yöntemleri dener
HOST="fotografkutusu.com"
USER="pfotogex"
PASS="fot539IJdh}"
REMOTE_DIR="public_html"
LOCAL_DIR="dist"

echo "🚀 Otomatik yükleme başlıyor..."
echo "Host: $HOST"
echo ""

cd "$(dirname "$0")"

# Yöntem 1: SFTP (Port 22)
echo "📡 Yöntem 1: SFTP (Port 22) deneniyor..."
expect << EOF
set timeout 10
spawn sftp -o StrictHostKeyChecking=no -P 22 ${USER}@${HOST}
expect {
    "password:" { send "${PASS}\r" }
    "Password:" { send "${PASS}\r" }
    timeout { exit 1 }
}
expect "sftp>"
send "cd ${REMOTE_DIR}\r"
expect "sftp>"
send "put -r ${LOCAL_DIR}/* .\r"
expect "sftp>"
send "quit\r"
expect eof
EOF

if [ $? -eq 0 ]; then
    echo "✅ SFTP ile başarıyla yüklendi!"
    exit 0
fi

# Yöntem 2: FTP (Port 21)
echo ""
echo "📡 Yöntem 2: FTP (Port 21) deneniyor..."
curl -T "${LOCAL_DIR}/.htaccess" -u "${USER}:${PASS}" "ftp://${HOST}/${REMOTE_DIR}/.htaccess" --silent --show-error
if [ $? -eq 0 ]; then
    echo "✅ FTP bağlantısı başarılı, dosyalar yükleniyor..."
    
    # Tüm dosyaları yükle
    for file in "${LOCAL_DIR}"/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            curl -T "$file" -u "${USER}:${PASS}" "ftp://${HOST}/${REMOTE_DIR}/$filename" --silent
            echo "   ✅ $filename"
        fi
    done
    
    # assets klasörünü yükle
    if [ -d "${LOCAL_DIR}/assets" ]; then
        mkdir -p /tmp/assets_upload
        for file in "${LOCAL_DIR}/assets"/*; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                curl -T "$file" -u "${USER}:${PASS}" "ftp://${HOST}/${REMOTE_DIR}/assets/$filename" --ftp-create-dirs --silent
                echo "   ✅ assets/$filename"
            fi
        done
    fi
    
    echo "✅ Tüm dosyalar yüklendi!"
    exit 0
fi

# Yöntem 3: FTPS (Port 990)
echo ""
echo "📡 Yöntem 3: FTPS (Port 990) deneniyor..."
curl -T "${LOCAL_DIR}/.htaccess" -u "${USER}:${PASS}" "ftps://${HOST}:990/${REMOTE_DIR}/.htaccess" --ssl-reqd --insecure --silent --show-error
if [ $? -eq 0 ]; then
    echo "✅ FTPS bağlantısı başarılı!"
    exit 0
fi

# Yöntem 4: cPanel Port (2082, 2083)
echo ""
echo "📡 Yöntem 4: cPanel Port (2082) deneniyor..."
curl -T "${LOCAL_DIR}/.htaccess" -u "${USER}:${PASS}" "ftp://${HOST}:2082/${REMOTE_DIR}/.htaccess" --silent --show-error
if [ $? -eq 0 ]; then
    echo "✅ cPanel FTP bağlantısı başarılı!"
    exit 0
fi

echo ""
echo "❌ Tüm yöntemler başarısız oldu."
echo "📋 Manuel yükleme için:"
echo "   1. cPanel File Manager kullanın"
echo "   2. DEPLOYMENT_MANUAL.md dosyasına bakın"
echo "   3. build.zip dosyasını yükleyin"
exit 1

















