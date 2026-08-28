'use strict';
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'blog_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
  charset:            'utf8mb4',
});

const connectDB = async () => {
  const conn = await pool.getConnection();
  const host = process.env.DB_HOST || 'localhost';
  const db   = process.env.DB_NAME || 'blog_db';
  console.log(`✅ MySQL Connected: ${host}/${db}`);
  conn.release();
};

module.exports = { pool, connectDB };
