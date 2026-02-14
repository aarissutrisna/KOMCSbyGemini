#!/bin/bash

# KomCS PJB - VPS Debugger Script v3 (Deep Scan)
echo "------------------------------------------------"
echo "🔍 DIAGNOSA MENDALAM KOMCS PJB"
echo "------------------------------------------------"

# 1. Cek Content-Type via Localhost
echo "1. Mengecek MIME Type yang dikirim Nginx..."
JS_FILE=$(ls dist/assets/index.*.js | head -n 1)
if [ -f "$JS_FILE" ]; then
    RELATIVE_PATH="assets/$(basename $JS_FILE)"
    echo "Mengecek file: $RELATIVE_PATH"
    # Gunakan curl untuk melihat header saja
    MIME_CHECK=$(curl -I -s http://localhost/$RELATIVE_PATH | grep -i "content-type")
    echo "Header Content-Type: $MIME_CHECK"
    
    if [[ $MIME_CHECK == *"javascript"* ]]; then
        echo "✅ MIME Type SUDAH BENAR (application/javascript)."
    else
        echo "❌ ERROR: MIME Type SALAH! Nginx mengirim: $MIME_CHECK"
        echo "Solusi: Pastikan 'include /etc/nginx/mime.types;' ada di dalam blok 'location' Nginx."
    fi
else
    echo "❌ File JS build tidak ditemukan di dist/assets/."
fi

# 2. Cek Keselarasan index.html
echo -e "\n2. Mengecek index.html di folder dist..."
if [ -f "dist/index.html" ]; then
    if grep -q "importmap" "dist/index.html"; then
        echo "⚠️  WARNING: dist/index.html masih mengandung importmap. Ini bisa merusak bundle Vite."
    else
        echo "✅ index.html bersih dari importmap."
    fi
fi

# 3. Cek Error Log Nginx
echo -e "\n3. Mengecek 5 baris terakhir error log Nginx..."
tail -n 5 /var/log/nginx/error.log 2>/dev/null || echo "Tidak bisa mengakses log (butuh sudo)."

echo "------------------------------------------------"
echo "💡 LANGKAH TERAKHIR:"
echo "1. Jalankan ulang: npm run build"
echo "2. Restart Nginx: sudo systemctl restart nginx"
echo "3. Jika masih blank, buka Chrome DevTools (F12) > tab 'Console' dan kirimkan errornya."
echo "------------------------------------------------"
