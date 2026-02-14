#!/bin/bash

# KomCS PJB - Emergency Fix & Debugger v5
echo "------------------------------------------------"
echo "🛠️  FIXING PERMISSIONS & BUILDING..."
echo "------------------------------------------------"

# 1. Hapus dist lama sebagai root untuk membersihkan sisa build yang error
if [ "$EUID" -eq 0 ]; then
    echo "1. Menghapus folder dist lama..."
    rm -rf /home/userpusat/web/komc.grosirbaja.com/public_html/dist
    
    echo "2. Memperbaiki kepemilikan file ke userpusat..."
    chown -R userpusat:userpusat /home/userpusat/web/komc.grosirbaja.com/public_html
    chmod -R 755 /home/userpusat/web/komc.grosirbaja.com/public_html
    
    echo "3. Menjalankan build sebagai userpusat..."
    sudo -u userpusat npm run build
    
    echo "4. Restart Nginx..."
    systemctl restart nginx
    echo "✅ SELESAI. Silakan cek browser."
else
    echo "❌ ERROR: Harap jalankan skrip ini dengan 'sudo' (sudo ./debug_vps.sh)"
fi

echo "------------------------------------------------"
echo "🔍 CEK STATUS AKHIR:"
JS_FILE=$(ls /home/userpusat/web/komc.grosirbaja.com/public_html/dist/assets/index.*.js 2>/dev/null | head -n 1)
if [ -f "$JS_FILE" ]; then
    MIME_TYPE=$(curl -I -s http://localhost/assets/$(basename $JS_FILE) | grep -i "content-type")
    echo "MIME Type JS: $MIME_TYPE"
fi
echo "Backend: $(ss -tulpn | grep :5000 | awk '{print $5}')"
echo "------------------------------------------------"
