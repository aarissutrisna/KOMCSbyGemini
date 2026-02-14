#!/bin/bash

# KomCS PJB - Ultimate VPS Debugger v16 (Anti-NoScript Edition)
echo "------------------------------------------------"
echo "🔍 DIAGNOSA & AUTO-FIX KOMCS PJB"
echo "------------------------------------------------"

if [ "$EUID" -ne 0 ]; then
  echo "❌ HARAP JALANKAN DENGAN SUDO: sudo ./debug_vps.sh"
  exit 1
fi

# 1. Bersihkan Environment Variable Sistem (Pembersihan pjb_user)
echo "1. Purging environment variables..."
unset DB_USER
unset DB_PASS
unset DB_NAME

# 2. Database Sync
echo "2. Sinkronisasi MariaDB..."
systemctl start mariadb
mariadb -u root <<EOF
CREATE DATABASE IF NOT EXISTS userpusat_komcsdb;
GRANT ALL PRIVILEGES ON userpusat_komcsdb.* TO 'userpusat_komcsuser'@'localhost' IDENTIFIED BY 'Ad@rt7754i';
FLUSH PRIVILEGES;
EOF

# 3. Force Write .env
echo "3. Refreshing .env file..."
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
chown userpusat:userpusat $ENV_PATH

# 4. Deep Clean PM2
echo "4. Deep Cleaning PM2..."
# Hapus semua proses dan file dump yang mungkin menyimpan cache 'pjb_user' atau config rusak
sudo -u userpusat pm2 kill
sudo -u userpusat rm -rf /home/userpusat/.pm2/dump.pm2
sudo -u userpusat rm -rf /home/userpusat/.pm2/logs/*

# 5. Build Frontend
echo "5. Rebuilding Frontend..."
cd /home/userpusat/web/komc.grosirbaja.com/public_html
sudo -u userpusat npm run build

# 6. Start Backend
echo "6. Starting Backend with fixed ecosystem.config.cjs..."
cd /home/userpusat/web/komc.grosirbaja.com/public_html/backend
sudo -u userpusat npm install
# Gunakan flag --update-env untuk memastikan variabel .env terbaru dibaca
sudo -u userpusat pm2 start ecosystem.config.cjs --env production --update-env
sudo -u userpusat pm2 save

# 7. Final Check
echo -e "\n7. Verifikasi Status Akhir..."
systemctl restart nginx
sudo -u userpusat pm2 status
echo "------------------------------------------------"
echo "🎉 PROSES SELESAI"
echo "Cek logs dengan: sudo -u userpusat pm2 logs komcs-pjb-api"
echo "------------------------------------------------"