-- JALANKAN PERINTAH INI DI TERMINAL VPS SEBAGAI ROOT:
-- sudo mariadb -u root

-- 1. Buat Database jika belum ada
CREATE DATABASE IF NOT EXISTS komcs_pjb;

-- 2. Buat User (Gunakan password yang sesuai dengan .env)
-- Jika user sudah ada, ini akan mengupdate passwordnya
CREATE USER IF NOT EXISTS 'pjb_user'@'localhost' IDENTIFIED BY 'pjb_password';
ALTER USER 'pjb_user'@'localhost' IDENTIFIED BY 'pjb_password';

-- 3. Berikan Hak Akses Penuh
GRANT ALL PRIVILEGES ON komcs_pjb.* TO 'pjb_user'@'localhost';

-- 4. Refresh Privileges
FLUSH PRIVILEGES;

-- 5. Cek apakah user berhasil dibuat
SELECT User, Host FROM mysql.user WHERE User = 'pjb_user';
