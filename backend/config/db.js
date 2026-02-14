import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env secara eksplisit dari root folder backend
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test Connection & Detailed Error Handling
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ DB Connected: MariaDB 11.4 [DB: ${process.env.DB_NAME}] [User: ${process.env.DB_USER}]`);
    connection.release();
  } catch (error) {
    console.error('❌ DB CONNECTION ERROR DETECTED:');
    console.error(`   - Code: ${error.code}`);
    console.error(`   - Message: ${error.message}`);
    console.error(`   - Attempted User: ${process.env.DB_USER}`);
    console.error(`   - Hint: Jika user di atas bukan 'userpusat_komcsuser', jalankan 'pm2 delete all && ./debug_vps.sh'`);
  }
})();

export default pool;