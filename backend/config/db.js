
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test Connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ DB Connected: MariaDB 11.4 via mysql2 pool');
    connection.release();
  } catch (error) {
    console.error('❌ DB Connection Failed:', error.message);
  }
})();

export default pool;
