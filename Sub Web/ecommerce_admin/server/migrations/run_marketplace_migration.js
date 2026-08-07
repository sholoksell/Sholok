const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

(async () => {
  let pool;
  try {
    pool = await mysql.createPool({
      host: '127.0.0.1', port: 3306, user: 'root', password: '',
      database: 'sholok_ecommerce', multipleStatements: true, connectTimeout: 10000
    });
    const sql = fs.readFileSync(path.join(__dirname, 'marketplace_migration.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Marketplace migration completed successfully');
  } catch (e) {
    console.error('❌ Migration error:', e.message);
    process.exit(1);
  } finally {
    if (pool) await pool.end();
  }
})();
