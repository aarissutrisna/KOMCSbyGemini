#!/bin/bash

# KomCS PJB - Ultimate VPS Debugger v14 (Anti-Cache Edition)
echo "------------------------------------------------"
echo "🔍 DIAGNOSA & AUTO-FIX KOMCS PJB"
echo "------------------------------------------------"

if [ "$EUID" -ne 0 ]; then
  echo "❌ HARAP JALANKAN DENGAN SUDO: sudo ./debug_vps.sh"
  exit 1
fi

# 1. Database Check
echo "1. Sinkronisasi MariaDB..."
systemctl start mariadb
mariadb -u root <<EOF
CREATE DATABASE IF NOT EXISTS userpusat_komcsdb;
GRANT ALL PRIVILEGES ON userpusat_komcsdb.* TO 'userpusat_komcsuser'@'localhost' IDENTIFIED BY 'Ad@rt7754i';
FLUSH PRIVILEGES;
EOF

# 2. Force Rewrite .env (Untuk memastikan pjb_user tidak tersisa di file)
echo "2. Menulis ulang file .env..."
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

# 3. Clean & Rebuild Frontend
echo "3. Rebuild Frontend..."
cd /home/userpusat/web/komc.grosirbaja.com/public_html
sudo -u userpusat npm run build

# 4. KILL PM2 & CLEAR ALL CACHE (PENTING!)
echo "4. Membersihkan Total Cache PM2..."
# Hapus semua proses dan dump file PM2 yang mungkin menyimpan variabel lama
sudo -u userpusat pm2 kill
sudo -u userpusat rm -rf /home/userpusat/.pm2/dump.pm2

# 5. Start Backend
echo "5. Memulai Backend dengan Konfigurasi Baru..."
cd /home/userpusat/web/komc.grosirbaja.com/public_html/backend
sudo -u userpusat pm2 start ecosystem.config.cjs --update-env
sudo -u userpusat pm2 save

# 6. Nginx
systemctl restart nginx

echo -e "\n6. Verifikasi Akhir..."
sudo -u userpusat pm2 status
echo "------------------------------------------------"
echo "🎉 PROSES SELESAI"
echo "Jika log masih menunjukkan 'pjb_user', berarti ada environment variabel"
echo "di level OS. Gunakan perintah: unset DB_USER"
echo "------------------------------------------------"