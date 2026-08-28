const jwt  = require('jsonwebtoken');
const { pool } = require('../config/db');

const buildUser = (u) => ({
  _id:         String(u.id),
  id:          u.id,
  username:    u.username,
  email:       u.email,
  displayName: u.display_name,
  bio:         u.bio        || '',
  avatar:      u.avatar     || '',
  coverImage:  u.cover_image|| '',
  role:        u.role,
  isVerified:  Boolean(u.is_verified),
  isActive:    Boolean(u.is_active),
  website:     u.website    || '',
  location:    u.location   || '',
  createdAt:   u.created_at,
  updatedAt:   u.updated_at,
});

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.execute(
      `SELECT id, username, email, display_name, bio, avatar, cover_image,
              role, is_verified, is_active, website, location, total_views,
              last_login, created_at, updated_at
       FROM users WHERE id = ? LIMIT 1`,
      [decoded.id]
    );

    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    req.user = buildUser(rows[0]);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [rows] = await pool.execute(
        `SELECT id, username, email, display_name, bio, avatar, cover_image,
                role, is_verified, is_active, website, location
         FROM users WHERE id = ? LIMIT 1`,
        [decoded.id]
      );
      if (rows.length && rows[0].is_active) {
        req.user = buildUser(rows[0]);
      }
    }
  } catch { /* optional — swallow errors */ }
  next();
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

module.exports = { protect, optionalAuth, adminOnly, generateToken };
