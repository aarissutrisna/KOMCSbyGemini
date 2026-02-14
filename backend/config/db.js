import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

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
    console.error(`   - Error No: ${error.errno}`);
    console.error(`   - Message: ${error.message}`);
    console.error('   - Hint: Check if pjb_user exists and has the correct password in .env');
  }
})();

export default pool;