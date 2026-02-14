#!/bin/bash

# KomCS PJB - Ultimate VPS Debugger v13 (Deep Clean & Force Start)
echo "------------------------------------------------"
echo "🔍 DIAGNOSA & AUTO-FIX KOMCS PJB"
echo "------------------------------------------------"

if [ "$EUID" -ne 0 ]; then
  echo "❌ HARAP JALANKAN DENGAN SUDO: sudo ./debug_vps.sh"
  exit 1
fi

# 1. Database Check
echo "1. Memastikan MariaDB Aktif..."
systemctl start mariadb

# 2. Reset Database & User
echo "2. Menyinkronkan Database userpusat_komcsdb..."
mariadb -u root <<EOF
CREATE DATABASE IF NOT EXISTS userpusat_komcsdb;
GRANT ALL PRIVILEGES ON userpusat_komcsdb.* TO 'userpusat_komcsuser'@'localhost' IDENTIFIED BY 'Ad@rt7754i';
FLUSH PRIVILEGES;
EOF

if [ -f "/home/userpusat/web/komc.grosirbaja.com/public_html/schema.sql" ]; then
    mysql -u userpusat_komcsuser -p'Ad@rt7754i' userpusat_komcsdb < /home/userpusat/web/komc.grosirbaja.com/public_html/schema.sql
    echo "✅ Schema Berhasil Diimpor."
else
    echo "⚠️ schema.sql tidak ditemukan di root."
fi

# 3. Fix Backend .env (Force rewrite to correct user)
echo -e "\n3. Memastikan konfigurasi .env backend benar..."
ENV_PATH="/home/userpusat/web/komc.grosirbaja.com/public_html/backend/.env"
cat > $ENV_PATH <<EOF
PORT=5000
NODE_ENV=production
DB_HOST=localhost
DB_USER=userpusat_komcsuser
DB_PASS=Ad@rt7754i
DB_NAME=userpusat_komcsdb
DB_PORT=3306
JWT_SECRET=pjb_super_secret_key_2025_secure
JWT_EXPIRES_IN=12h
CLIENT_URL=http://komc.grosirbaja.com
EOF
echo "✅ File .env telah diperbarui."

# 4. Rebuild Frontend
echo -e "\n4. Menjalankan build frontend..."
cd /home/userpusat/web/komc.grosirbaja.com/public_html
sudo -u userpusat npm run build
chown -R userpusat:userpusat /home/userpusat/web/komc.grosirbaja.com/public_html/dist
chmod -R 755 /home/userpusat/web/komc.grosirbaja.com/public_html/dist

# 5. Hard Reset PM2
echo -e "\n5. Merestart Backend (Hard Reset)..."
pm2 stop all 2>/dev/null
pm2 delete all 2>/dev/null
cd /home/userpusat/web/komc.grosirbaja.com/public_html/backend
pm2 start ecosystem.config.cjs --update-env
pm2 save
systemctl restart nginx

echo -e "\n6. Verifikasi Status Akhir..."
echo "--- STATUS PM2 ---"
pm2 status
echo -e "\n--- LOG KONEKSI DB ---"
pm2 logs komcs-pjb-api --lines 10 --no-daemon & sleep 5 && kill $!

echo "------------------------------------------------"
echo "🎉 SEMUA PROSES SELESAI"
echo "Aplikasi seharusnya sudah berjalan di: http://komc.grosirbaja.com"
echo "------------------------------------------------"