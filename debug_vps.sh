#!/bin/bash

# KomCS PJB - Ultimate VPS Debugger v11 (Fix PM2 ESM Error)
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
mariadb -u root < /home/userpusat/web/komc.grosirbaja.com/public_html/db_setup.sql
mysql -u userpusat_komcsuser -p'Ad@rt7754i' userpusat_komcsdb < /home/userpusat/web/komc.grosirbaja.com/public_html/schema.sql
if [ $? -eq 0 ]; then
    echo "✅ Database & Schema Berhasil Disiapkan."
else
    echo "❌ Gagal Menyiapkan Database. Cek db_setup.sql"
fi

# 3. Bersihkan File Statis & Permissions
echo -e "\n3. Membersihkan sisa build lama..."
rm -rf /home/userpusat/web/komc.grosirbaja.com/public_html/dist
chown -R userpusat:userpusat /home/userpusat/web/komc.grosirbaja.com/public_html
chmod -R 755 /home/userpusat/web/komc.grosirbaja.com/public_html

# 4. Rebuild Frontend
echo -e "\n4. Menjalankan build frontend..."
sudo -u userpusat npm run build

# 5. Hard Restart Backend (Clear PM2 Environment Cache)
echo -e "\n5. Merestart Backend dengan pembersihan cache..."
pm2 delete komcs-pjb-api || true
cd /home/userpusat/web/komc.grosirbaja.com/public_html/backend
# Menggunakan .cjs untuk menghindari error ES Module scope
pm2 start ecosystem.config.cjs --update-env
systemctl restart nginx

echo -e "\n6. Verifikasi Kredensial di Log PM2..."
echo "Menampilkan 5 baris terakhir log koneksi database:"
pm2 logs komcs-pjb-api --lines 5 --no-daemon & sleep 3 && kill $!

echo "------------------------------------------------"
echo "🎉 PROSES SELESAI"
echo "Status PM2:"
pm2 status
echo "------------------------------------------------"