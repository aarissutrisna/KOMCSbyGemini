#!/bin/bash

# KomCS PJB - Ultimate VPS Debugger v15 (Final Script Fix)
echo "------------------------------------------------"
echo "🔍 DIAGNOSA & AUTO-FIX KOMCS PJB"
echo "------------------------------------------------"

if [ "$EUID" -ne 0 ]; then
  echo "❌ HARAP JALANKAN DENGAN SUDO: sudo ./debug_vps.sh"
  exit 1
fi

# 0. Clean OS Environment Variables (Prevent pjb_user leak)
echo "0. Membersihkan Environment Variable Sesi..."
unset DB_USER
unset DB_PASS
unset DB_NAME

# 1. Database Check & User Sync
echo "1. Sinkronisasi MariaDB (User: userpusat_komcsuser)..."
systemctl start mariadb
mariadb -u root <<EOF
CREATE DATABASE IF NOT EXISTS userpusat_komcsdb;
GRANT ALL PRIVILEGES ON userpusat_komcsdb.* TO 'userpusat_komcsuser'@'localhost' IDENTIFIED BY 'Ad@rt7754i';
FLUSH PRIVILEGES;
EOF

# 2. Force Rewrite .env (Absolute correctness)
echo "2. Menulis ulang file .env backend..."
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

# 3. Clean & Rebuild Frontend
echo "3. Rebuild Frontend..."
cd /home/userpusat/web/komc.grosirbaja.com/public_html
sudo -u userpusat npm run build

# 4. KILL PM2 & PURGE (Deep Clean)
echo "4. Membersihkan Total Cache PM2..."
sudo -u userpusat pm2 kill
sudo -u userpusat rm -rf /home/userpusat/.pm2/dump.pm2
sudo -u userpusat rm -rf /home/userpusat/.pm2/logs/*

# 5. Start Backend using ecosystem.config.cjs
echo "5. Memulai Backend (komcs-pjb-api)..."
cd /home/userpusat/web/komc.grosirbaja.com/public_html/backend
# Pastikan npm dependencies terinstall
sudo -u userpusat npm install
# Jalankan PM2
sudo -u userpusat pm2 start ecosystem.config.cjs --update-env
sudo -u userpusat pm2 save

# 6. Nginx Restart
echo "6. Merestart Nginx..."
systemctl restart nginx

echo -e "\n7. Verifikasi Status Akhir..."
sudo -u userpusat pm2 status
echo "------------------------------------------------"
echo "🎉 PROSES SELESAI"
echo "Jika 'pjb_user' masih muncul di log, cek file /etc/environment"
echo "------------------------------------------------"]></content>
  </change>
</changes>