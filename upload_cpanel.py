#!/usr/bin/env python3
"""
cPanel File Manager API ile otomatik dosya yükleme scripti
"""
import requests
import base64
import json
import os
import zipfile
from pathlib import Path

# cPanel bilgileri
CPANEL_HOST = "fotografkutusu.com"
CPANEL_USER = "pfotogex"
CPANEL_PASS = "fot539IJdh}"
CPANEL_PORT = 2083  # cPanel portu (HTTPS)

# Dosya yolları
LOCAL_DIR = "dist"
REMOTE_DIR = "public_html"

def upload_file_to_cpanel(file_path, remote_path):
    """cPanel File Manager API ile dosya yükle"""
    url = f"https://{CPANEL_HOST}:{CPANEL_PORT}/execute/Fileman/upload_files"
    
    auth_string = f"{CPANEL_USER}:{CPANEL_PASS}"
    auth_bytes = auth_string.encode('ascii')
    auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
    
    headers = {
        'Authorization': f'Basic {auth_b64}',
    }
    
    data = {
        'dir': f'/{REMOTE_DIR}',
        'file-1': (os.path.basename(file_path), open(file_path, 'rb'), 'application/octet-stream')
    }
    
    try:
        response = requests.post(url, headers=headers, files=data, verify=False, timeout=30)
        print(f"📤 {os.path.basename(file_path)}: {response.status_code}")
        if response.status_code == 200:
            print(f"   ✅ Başarılı")
            return True
        else:
            print(f"   ❌ Hata: {response.text[:100]}")
            return False
    except Exception as e:
        print(f"   ❌ Hata: {str(e)}")
        return False
    finally:
        if 'file-1' in data:
            data['file-1'][1].close()

def main():
    print("📤 cPanel File Manager API ile dosya yükleme başlıyor...")
    print(f"Host: {CPANEL_HOST}")
    print(f"Kullanıcı: {CPANEL_USER}")
    print()
    
    dist_path = Path(LOCAL_DIR)
    if not dist_path.exists():
        print(f"❌ {LOCAL_DIR} klasörü bulunamadı!")
        print("Önce 'npm run build:full' komutunu çalıştırın.")
        return
    
    # Önemli dosyaları yükle
    files_to_upload = [
        ".htaccess",
        "index.html",
        "vite.svg"
    ]
    
    # Assets klasöründeki dosyalar
    assets_path = dist_path / "assets"
    if assets_path.exists():
        for file in assets_path.iterdir():
            if file.is_file():
                files_to_upload.append(f"assets/{file.name}")
    
    success_count = 0
    for file_rel_path in files_to_upload:
        file_path = dist_path / file_rel_path
        if file_path.exists():
            if upload_file_to_cpanel(str(file_path), file_rel_path):
                success_count += 1
        else:
            print(f"⚠️  Dosya bulunamadı: {file_rel_path}")
    
    print()
    print(f"✅ {success_count}/{len(files_to_upload)} dosya yüklendi!")
    print(f"🌐 Site: https://{CPANEL_HOST}")

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    main()
