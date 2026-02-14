# 🚀 KomCS PJB Backend Deployment Guide

## 1. Persiapan Server (Ubuntu 24.04)
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs redis-server mariadb-server nginx
```

## 2. Setup Database
Jalankan perintah ini di terminal:
```bash
# Masuk ke MariaDB root untuk membuat user dan database
sudo mariadb -u root < /home/userpusat/web/komc.grosirbaja.com/public_html/db_setup.sql

# Impor struktur tabel (Schema)
mysql -u userpusat_komcsuser -p'Ad@rt7754i' userpusat_komcsdb < /home/userpusat/web/komc.grosirbaja.com/public_html/schema.sql
```

## 3. Setup Backend
```bash
cd /home/userpusat/web/komc.grosirbaja.com/public_html/backend
npm install
# Pastikan .env sudah benar (DB_USER=userpusat_komcsuser, dst)
sudo npm install -g pm2
pm2 delete komcs-pjb-api || true
pm2 start ecosystem.config.cjs --update-env
pm2 save
```

## 4. Setup Nginx Reverse Proxy
Pastikan konfigurasi Nginx di HestiaCP sudah mengarah ke port 5000 untuk `/api/`.