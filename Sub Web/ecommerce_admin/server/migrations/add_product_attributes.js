const pool = require('../db');
async function run() {
  try {
    await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS attributes JSON DEFAULT NULL COMMENT 'e.g. {\"color\":\"Red\",\"size\":\"XL\"}'");
    console.log('Migration done: attributes column added');
  } catch(e) { console.error(e.message); }
  process.exit(0);
}
run();
