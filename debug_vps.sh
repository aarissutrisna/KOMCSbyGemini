#!/bin/bash

# KomCS PJB - Ultimate VPS Debugger v8 (Production Credentials)
echo "------------------------------------------------"
echo "🔍 DIAGNOSA & AUTO-FIX KOMCS PJB"
echo "------------------------------------------------"

if [ "$EUID" -ne 0 ]; then
  echo "❌ HARAP JALANKAN DENGAN SUDO: sudo ./debug_vps.sh"
  exit 1
fi

# 1. Cek Koneksi MariaDB
echo "1. Mengecek status database..."
if ! systemctl is-active --quiet mariadb; then
    echo "❌ MariaDB MATI! Mencoba menyalakan..."
    systemctl start mariadb
fi

# Test userpusat credentials via CLI
DB_USER="userpusat_komcsuser"
DB_PASS="Ad@rt7754i"
DB_NAME="userpusat_komcsdb"

echo "2. Mengetes login MariaDB user '$DB_USER'..."
mysql -u"$DB_USER" -p"$DB_PASS" -e "status" "$DB_NAME" &>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Koneksi Database OK."
else
    echo "❌ DATABASE ACCESS DENIED!"
    echo "   Solusi: Jalankan perintah berikut untuk mereset user dengan kredensial baru:"
    echo "   sudo mariadb -u root < db_setup.sql"
fi

echo -e "\n3. Membersihkan sisa build lama..."
rm -rf /home/userpusat/web/komc.grosirbaja.com/public_html/dist
chown -R userpusat:userpusat /home/userpusat/web/komc.grosirbaja.com/public_html
chmod -R 755 /home/userpusat/web/komc.grosirbaja.com/public_html

echo -e "\n4. Menjalankan build frontend..."
sudo -u userpusat npm run build

echo -e "\n5. Merestart Backend & Nginx..."
pm2 restart all || echo "⚠️ PM2 belum jalan, lewati."
systemctl restart nginx

echo -e "\n6. Validasi Akhir..."
JS_FILE=$(ls /home/userpusat/web/komc.grosirbaja.com/public_html/dist/assets/index.*.js 2>/dev/null | head -n 1)
if [ -f "$JS_FILE" ]; then
    MIME_CHECK=$(curl -I -s http://localhost/assets/$(basename $JS_FILE) | grep -i "content-type")
    echo "MIME Type JS: $MIME_CHECK"
fi
echo "------------------------------------------------"
echo "💡 Jika error DB masih ada, cek log backend:"
echo "   pm2 logs komcs-pjb-api"
echo "------------------------------------------------"