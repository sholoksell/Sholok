const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_production';

async function adminAuth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const payload = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, name, email, role, is_active FROM admins WHERE id = ?',
      [payload.id]
    );
    if (!rows.length || !rows[0].is_active)
      return res.status(401).json({ message: 'Unauthorized' });

    req.admin = rows[0];
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

async function customerAuth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const payload = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, status FROM customers WHERE id = ?',
      [payload.id]
    );
    if (!rows.length || rows[0].status === 'blocked')
      return res.status(401).json({ message: 'Unauthorized' });

    req.customer = rows[0];
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { adminAuth, customerAuth };
