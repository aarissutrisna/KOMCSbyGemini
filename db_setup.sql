-- JALANKAN PERINTAH INI DI TERMINAL VPS SEBAGAI ROOT:
-- sudo mariadb -u root

-- 1. Buat Database jika belum ada
CREATE DATABASE IF NOT EXISTS userpusat_komcsdb;

-- 2. Buat User (Gunakan password yang sesuai dengan instruksi)
CREATE USER IF NOT EXISTS 'userpusat_komcsuser'@'localhost' IDENTIFIED BY 'Ad@rt7754i';
ALTER USER 'userpusat_komcsuser'@'localhost' IDENTIFIED BY 'Ad@rt7754i';

-- 3. Berikan Hak Akses Penuh
GRANT ALL PRIVILEGES ON userpusat_komcsdb.* TO 'userpusat_komcsuser'@'localhost';

-- 4. Refresh Privileges
FLUSH PRIVILEGES;

-- 5. Cek apakah user berhasil dibuat
SELECT User, Host FROM mysql.user WHERE User = 'userpusat_komcsuser';