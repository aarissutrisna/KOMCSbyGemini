#!/bin/bash

# KomCS PJB - Ultimate VPS Debugger v12 (Robust Start)
echo "------------------------------------------------"
echo "🔍 DIAGNOSA & AUTO-FIX KOMCS PJB"
echo "------------------------------------------------"

if [ "$EUID" -ne 0 ]; then
  echo "❌ HARAP JALANKAN DENGAN SUDO: sudo ./debug_vps.sh"
  exit 1
fi

# 1. Pastikan MariaDB Berjalan
echo "1. Mengecek status database..."
systemctl start mariadb

# 2. Reset User & Impor Schema Otomatis
echo "2. Mereset hak akses & mengimpor skema database..."
if [ -f "/home/userpusat/web/komc.grosirbaja.com/public_html/db_setup.sql" ]; then
    mariadb -u root < /home/userpusat/web/komc.grosirbaja.com/public_html/db_setup.sql
else
    echo "⚠️ db_setup.sql tidak ditemukan, mencoba manual..."
    mariadb -u root -e "CREATE DATABASE IF NOT EXISTS userpusat_komcsdb; GRANT ALL PRIVILEGES ON userpusat_komcsdb.* TO 'userpusat_komcsuser'@'localhost' IDENTIFIED BY 'Ad@rt7754i'; FLUSH PRIVILEGES;"
fi

if [ -f "/home/userpusat/web/komc.grosirbaja.com/public_html/schema.sql" ]; then
    mysql -u userpusat_komcsuser -p'Ad@rt7754i' userpusat_komcsdb < /home/userpusat/web/komc.grosirbaja.com/public_html/schema.sql
    echo "✅ Schema Berhasil Diimpor."
else
    echo "❌ schema.sql TIDAK DITEMUKAN!"
fi

# 3. Bersihkan File Statis & Permissions
echo -e "\n3. Membersihkan sisa build lama..."
rm -rf /home/userpusat/web/komc.grosirbaja.com/public_html/dist
chown -R userpusat:userpusat /home/userpusat/web/komc.grosirbaja.com/public_html
chmod -R 755 /home/userpusat/web/komc.grosirbaja.com/public_html

# 4. Rebuild Frontend
echo -e "\n4. Menjalankan build frontend..."
sudo -u userpusat npm run build

# 5. Hard Restart Backend
echo -e "\n5. Merestart Backend dengan pembersihan cache..."
cd /home/userpusat/web/komc.grosirbaja.com/public_html/backend
pm2 delete komcs-pjb-api || true

if [ -f "ecosystem.config.cjs" ]; then
    pm2 start ecosystem.config.cjs --update-env
    pm2 save
    echo "✅ PM2 Started successfully."
else
    echo "❌ ecosystem.config.cjs TIDAK DITEMUKAN! Mencoba start langsung..."
    pm2 start server.js --name komcs-pjb-api --update-env
fi

systemctl restart nginx

echo -e "\n6. Verifikasi Akhir..."
pm2 status komcs-pjb-api
echo "------------------------------------------------"
echo "🎉 PROSES SELESAI"
echo "Jika masih ada error 'pjb_user', cek file .env secara manual:"
echo "cat /home/userpusat/web/komc.grosirbaja.com/public_html/backend/.env"
echo "------------------------------------------------"