const pool = require('./db');

async function runBilingualMigration() {
  try {
    const checks = [
      { col: 'name_bn',                table: 'products', sql: 'ALTER TABLE products ADD COLUMN name_bn VARCHAR(255) NULL AFTER name' },
      { col: 'description_bn',         table: 'products', sql: 'ALTER TABLE products ADD COLUMN description_bn LONGTEXT NULL AFTER description' },
      { col: 'short_description_bn',   table: 'products', sql: 'ALTER TABLE products ADD COLUMN short_description_bn TEXT NULL AFTER short_description' },
    ];

    for (const { col, table, sql } of checks) {
      const [[{ cnt }]] = await pool.query(
        `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, col]
      );
      if (cnt === 0) {
        await pool.query(sql);
        console.log(`✅ Migration: added ${col} to ${table}`);
      }
    }
  } catch (err) {
    console.error('⚠️  Bilingual migration error:', err.message);
  }
}

module.exports = runBilingualMigration;
