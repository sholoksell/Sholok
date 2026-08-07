const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'sholok_vendor_jwt_secret_2024';

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'No token provided' });
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'vendor') return res.status(401).json({ message: 'Invalid token type' });
    const [[vendor]] = await pool.query("SELECT * FROM vendors WHERE id=? AND status='active'", [decoded.id]);
    if (!vendor) return res.status(401).json({ message: 'Vendor not found or not active' });
    req.vendor = vendor;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
