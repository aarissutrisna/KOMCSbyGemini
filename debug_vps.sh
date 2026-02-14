#!/bin/bash

# KomCS PJB - VPS Debugger Script v4 (Auto-Heal Permissions)
echo "------------------------------------------------"
echo "🔍 DIAGNOSA & AUTO-FIX KOMCS PJB"
echo "------------------------------------------------"

# 1. Perbaikan Izin (Permissions)
echo "1. Menyamakan kepemilikan file ke user 'userpusat'..."
if [ "$EUID" -ne 0 ]; then
  echo "⚠️  Harap jalankan skrip ini dengan 'sudo' untuk memperbaiki izin file."
else
  chown -R userpusat:userpusat /home/userpusat/web/komc.grosirbaja.com/public_html
  chmod -R 755 /home/userpusat/web/komc.grosirbaja.com/public_html
  echo "✅ Izin file telah diperbaiki."
fi

# 2. Cek Content-Type via Localhost
echo -e "\n2. Mengecek MIME Type yang dikirim Nginx..."
JS_FILE=$(ls dist/assets/index.*.js 2>/dev/null | head -n 1)
if [ -f "$JS_FILE" ]; then
    RELATIVE_PATH="assets/$(basename $JS_FILE)"
    MIME_CHECK=$(curl -I -s http://localhost/$RELATIVE_PATH | grep -i "content-type")
    echo "Header Content-Type: $MIME_CHECK"
    if [[ $MIME_CHECK == *"javascript"* ]]; then
        echo "✅ MIME Type BENAR."
    else
        echo "❌ MIME Type SALAH."
    fi
else
    echo "⚠️  File build belum tersedia. Silakan jalankan 'npm run build'."
fi

# 3. Cek Status Backend
echo -e "\n3. Mengecek Port 5000 (Backend)..."
if command -v ss &> /dev/null; then
    ss -tulpn | grep :5000 || echo "❌ Backend tidak jalan di port 5000."
fi

echo "------------------------------------------------"
echo "🚀 SOLUSI CEPAT JIKA ERROR BUILD:"
echo "Jalankan perintah ini sebagai root:"
echo "  rm -rf /home/userpusat/web/komc.grosirbaja.com/public_html/dist"
echo "  chown -R userpusat:userpusat /home/userpusat/web/komc.grosirbaja.com/public_html"
echo "  sudo -u userpusat npm run build"
echo "------------------------------------------------"
