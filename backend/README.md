
# 🚀 KomCS PJB Backend Deployment Guide

## 1. Persiapan Server (Ubuntu 24.04)
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs redis-server mariadb-server nginx
```

## 2. Setup Database
```sql
CREATE DATABASE komcs_pjb;
CREATE USER 'pjb_user'@'localhost' IDENTIFIED BY 'PASSWORD_ANDA';
GRANT ALL PRIVILEGES ON komcs_pjb.* TO 'pjb_user'@'localhost';
FLUSH PRIVILEGES;
```
Import `schema.sql` ke database tersebut.

## 3. Setup Backend
```bash
cd /home/USER/komcs-backend
npm install
cp .env.example .env # Edit .env
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 4. Setup Nginx Reverse Proxy
Edit `/etc/nginx/sites-available/komcs`:
```nginx
server {
    listen 80;
    server_name api.komcs.pjb.id;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
`sudo ln -s /etc/nginx/sites-available/komcs /etc/nginx/sites-enabled/`
`sudo nginx -t && sudo systemctl restart nginx`
