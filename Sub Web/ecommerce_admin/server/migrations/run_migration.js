const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

(async () => {
  let pool;
  try {
    pool = await mysql.createPool({
      host: '127.0.0.1', port: 3306, user: 'root', password: '',
      database: 'sholok_ecommerce', multipleStatements: true,
      connectTimeout: 10000
    });
    const sqlFile = path.join(__dirname, 'delivery_shipping_migration.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    await pool.query(sql);
    console.log('✅ Migration completed successfully');
  } catch (e) {
    console.error('❌ Migration error:', e.message);
    process.exit(1);
  } finally {
    if (pool) await pool.end();
  }
})();
