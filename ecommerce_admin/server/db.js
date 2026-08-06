const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || '127.0.0.1',
  port:               parseInt(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'sholok_ecommerce',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
  charset:            'utf8mb4',
  connectTimeout:     10000,   // 10 s per attempt
  enableKeepAlive:    true,
  keepAliveInitialDelay: 30000,
});

// Retry initial connection check (XAMPP MySQL may not be ready instantly)
async function checkConnection(retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await pool.getConnection();
      console.log(`✅ MySQL Connected to "${process.env.DB_NAME || 'sholok_ecommerce'}" on ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}`);
      conn.release();
      return;
    } catch (err) {
      const isLast = attempt === retries;
      console.warn(`⚠️  MySQL connection attempt ${attempt}/${retries} failed: ${err.code || err.message}`);
      if (isLast) {
        console.error('❌ Could not connect to MySQL. Make sure XAMPP MySQL is running on port', process.env.DB_PORT || 3306);
      } else {
        console.log(`   Retrying in ${delayMs / 1000}s…`);
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
}

checkConnection();

module.exports = pool;
