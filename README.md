# KomCS PJB - Commission Management System

Aplikasi manajemen komisi Customer Service (CS) berbasis web yang dirancang untuk efisiensi perhitungan ledger, pemantauan omzet harian, dan sistem penarikan dana transparan.

## 🛠️ Tech Stack
- **Frontend**: React 19 (ESM via Importmap), Tailwind CSS, Recharts.
- **Backend**: Node.js 20 (LTS), Express, `mysql2` (Raw Query), `redis`.
- **Database**: MariaDB 11.4 (LTS).
- **Process Manager**: PM2.
- **Server**: Ubuntu 24.04 LTS, HestiaCP, Nginx (Reverse Proxy).

## 📂 Struktur Folder
```text
/               # Frontend (React & Static Files)
├── components/ # UI Components
├── logic/      # Business Logic (Commission Calculation)
├── types.ts    # TypeScript Definitions
├── index.html  # Entry point frontend
└── backend/    # Node.js API
    ├── config/ # Database & Redis config
    ├── routes/ # API Endpoints
    └── server.js
```

## 🚀 Panduan Instalasi (Ubuntu 24.04)

### 1. Persiapan Environment
Pastikan server sudah terinstall Node.js 20, MariaDB 11.4, dan Redis:
```bash
# Update System
sudo apt update && sudo apt upgrade -y

# Install Redis
sudo apt install redis-server -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
```

### 2. Konfigurasi Database (MariaDB 11.4)
Masuk ke MariaDB dan buat database:
```sql
CREATE DATABASE komcs_pjb;
CREATE USER 'pjb_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON komcs_pjb.* TO 'pjb_user'@'localhost';
FLUSH PRIVILEGES;
```
Import skema:
```bash
mysql -u pjb_user -p komcs_pjb < schema.sql
```

### 3. Setup Backend
```bash
cd /home/user/web/domain.com/public_html/backend
npm install
cp .env.example .env
```
Edit file `.env` dan sesuaikan:
- `DB_PASS`: Password MariaDB Anda.
- `JWT_SECRET`: String acak untuk keamanan token.
- `REDIS_URL`: `redis://localhost:6379` (default).

Jalankan backend dengan PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
```

## 🌐 Konfigurasi Nginx (HestiaCP)
Pada HestiaCP, tambahkan konfigurasi ini di bagian **Advanced Setup** Nginx domain Anda untuk mengarahkan traffic API ke backend:

```nginx
# Proxy ke Node.js Backend
location /api/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# Serve Frontend Statis
location / {
    root /home/user/web/domain.com/public_html;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

## ⚙️ Environment Variables (backend/.env)
```ini
PORT=5000
NODE_ENV=production
DB_HOST=localhost
DB_USER=pjb_user
DB_PASS=your_password
DB_NAME=komcs_pjb
REDIS_URL=redis://localhost:6379
JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=8h
CLIENT_URL=https://your-domain.com
```

## 📋 Catatan Deployment (1 vCPU 6GB RAM)
- **Database Pool**: Limit koneksi dibatasi maksimal 10 (`connectionLimit: 10`) untuk menjaga stabilitas CPU.
- **Redis Caching**: Statistik bulanan di-cache selama 1 jam untuk mengurangi beban query MariaDB.
- **Logging**: Log PM2 tersimpan di folder `backend/logs/`. Gunakan `pm2 logs komcs-api` untuk memantau traffic.

## 🛠️ Troubleshooting
1. **DB Connection Error**: Pastikan port 3306 terbuka dan `pjb_user` memiliki hak akses ke database.
2. **Redis Error**: Cek status redis dengan `sudo systemctl status redis-server`.
3. **API 404/502**: Periksa apakah backend berjalan di port 5000 (`netstat -tulpn | grep 5000`) dan Nginx reverse proxy sudah benar.
4. **CORS Error**: Pastikan `CLIENT_URL` di `.env` sesuai dengan domain frontend Anda.