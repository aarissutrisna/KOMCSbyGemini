#!/bin/bash

# KomCS PJB - VPS Debugger Script v2
echo "------------------------------------------------"
echo "🔍 DIAGNOSA SISTEM KOMCS PJB (FIX MODE)"
echo "------------------------------------------------"

# 1. Cek Folder Dist
echo "1. Mengecek folder hasil build (dist)..."
if [ -d "dist" ]; then
    echo "✅ Folder dist ditemukan."
    echo "Isi assets:"
    ls -F dist/assets/
else
    echo "❌ Folder dist TIDAK ditemukan! Jalankan 'npm run build' dulu."
fi

# 2. Cek apakah index.html di dist sudah ter-build (bukan source)
echo -e "\n2. Verifikasi index.html di folder dist..."
if [ -f "dist/index.html" ]; then
    if grep -q "index.tsx" "dist/index.html"; then
        echo "❌ ERROR: dist/index.html masih merujuk ke .tsx! Build gagal total."
    else
        echo "✅ index.html sudah ter-bundle (merujuk ke file .js)."
    fi
else
    echo "❌ dist/index.html tidak ditemukan."
fi

# 3. Cek Port Backend (Gunakan ss karena netstat tidak ada)
echo -e "\n3. Mengecek Port 5000 (Backend)..."
if command -v ss &> /dev/null; then
    ss -tulpn | grep :5000 || echo "❌ Backend tidak jalan di port 5000."
else
    echo "⚠️  ss tidak ditemukan, tidak bisa cek port."
fi

# 4. Cek Nginx Config Path
echo -e "\n4. Verifikasi Root Nginx..."
CONF="/home/userpusat/conf/web/komc.grosirbaja.com/nginx.conf"
if [ -f "$CONF" ]; then
    ROOT_VAL=$(grep "root" "$CONF" | head -n 1)
    echo "Config Root: $ROOT_VAL"
    if [[ $ROOT_VAL == *"dist"* ]]; then
        echo "✅ Root sudah mengarah ke /dist"
    else
        echo "❌ ERROR: Root Nginx SALAH! Harus ke /public_html/dist"
    fi
else
    echo "❌ Config HestiaCP tidak ditemukan di $CONF"
fi

echo "------------------------------------------------"
echo "💡 TINDAKAN:"
echo "1. Pastikan menjalankan: npm run build"
echo "2. Edit Nginx config HestiaCP, ubah root ke /dist"
echo "3. Restart Nginx: systemctl restart nginx"
echo "------------------------------------------------"
