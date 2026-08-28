const express  = require('express');
const bcrypt   = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { pool }          = require('../config/db');
const { generateToken, protect } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-30 chars (letters, numbers, underscores)'),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('displayName').trim().isLength({ min: 1, max: 50 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { username, email, password, displayName } = req.body;

      const [existing] = await pool.execute(
        'SELECT id, email, username FROM users WHERE email = ? OR username = ? LIMIT 1',
        [email, username]
      );
      if (existing.length) {
        const field = existing[0].email === email ? 'email' : 'username';
        return res.status(400).json({ success: false, message: `This ${field} is already registered` });
      }

      const hashed = await bcrypt.hash(password, 12);
      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password, display_name) VALUES (?, ?, ?, ?)',
        [username, email, hashed, displayName]
      );

      const userId = result.insertId;
      const token  = generateToken(userId);

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: { _id: String(userId), username, displayName, email, role: 'user', avatar: '' },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const [rows] = await pool.execute(
        'SELECT id, username, email, password, display_name, role, avatar, is_active FROM users WHERE email = ? LIMIT 1',
        [email]
      );
      const user = rows[0];

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      if (!user.is_active) {
        return res.status(403).json({ success: false, message: 'Account has been deactivated' });
      }

      await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

      const token = generateToken(user.id);
      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          _id:         String(user.id),
          username:    user.username,
          displayName: user.display_name,
          email:       user.email,
          role:        user.role,
          avatar:      user.avatar || '',
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
  }
);

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const [userRows] = await pool.execute(
      `SELECT id, username, email, display_name, bio, avatar, cover_image,
              role, is_verified, is_active, website, location, total_views,
              last_login, created_at, updated_at
       FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );
    if (!userRows.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const u = userRows[0];

    const [followers] = await pool.execute(
      `SELECT u.id, u.username, u.display_name AS displayName, u.avatar
       FROM user_follows uf JOIN users u ON u.id = uf.follower_id
       WHERE uf.followed_id = ?`,
      [userId]
    );
    const [following] = await pool.execute(
      `SELECT u.id, u.username, u.display_name AS displayName, u.avatar
       FROM user_follows uf JOIN users u ON u.id = uf.followed_id
       WHERE uf.follower_id = ?`,
      [userId]
    );

    const mapU = (r) => ({ _id: String(r.id), username: r.username, displayName: r.displayName, avatar: r.avatar || '' });

    res.json({
      success: true,
      user: {
        _id:         String(u.id),
        username:    u.username,
        email:       u.email,
        displayName: u.display_name,
        bio:         u.bio          || '',
        avatar:      u.avatar       || '',
        coverImage:  u.cover_image  || '',
        role:        u.role,
        isVerified:  Boolean(u.is_verified),
        isActive:    Boolean(u.is_active),
        website:     u.website      || '',
        location:    u.location     || '',
        totalViews:  u.total_views,
        lastLogin:   u.last_login,
        createdAt:   u.created_at,
        updatedAt:   u.updated_at,
        followers:   followers.map(mapU),
        following:   following.map(mapU),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/auth/change-password
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const [rows] = await pool.execute(
        'SELECT password FROM users WHERE id = ? LIMIT 1',
        [req.user.id]
      );
      if (!rows.length) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const valid = await bcrypt.compare(currentPassword, rows[0].password);
      if (!valid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      const hashed = await bcrypt.hash(newPassword, 12);
      await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// POST /api/auth/admin-register
router.post(
  '/admin-register',
  [
    body('secretKey').notEmpty().withMessage('Admin secret key is required'),
    body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('displayName').trim().isLength({ min: 1, max: 50 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { secretKey, username, email, password, displayName } = req.body;

      if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ success: false, message: 'Invalid admin secret key' });
      }

      const [existing] = await pool.execute(
        'SELECT id, email, username FROM users WHERE email = ? OR username = ? LIMIT 1',
        [email, username]
      );
      if (existing.length) {
        const field = existing[0].email === email ? 'email' : 'username';
        return res.status(400).json({ success: false, message: `This ${field} is already registered` });
      }

      const hashed = await bcrypt.hash(password, 12);
      const [result] = await pool.execute(
        "INSERT INTO users (username, email, password, display_name, role) VALUES (?, ?, ?, ?, 'admin')",
        [username, email, hashed, displayName]
      );

      const userId = result.insertId;
      const token  = generateToken(userId);

      res.status(201).json({
        success: true,
        message: 'Admin account created successfully',
        token,
        user: { _id: String(userId), username, displayName, email, role: 'admin' },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
  }
);

module.exports = router;
