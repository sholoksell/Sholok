const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
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
    body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-30 chars (letters, numbers, underscores)'),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('displayName').trim().isLength({ min: 1, max: 50 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { username, email, password, displayName } = req.body;

      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        const field = existingUser.email === email ? 'email' : 'username';
        return res.status(400).json({ success: false, message: `This ${field} is already registered` });
      }

      const user = await User.create({ username, email, password, displayName });
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: { _id: user._id, username: user.username, displayName: user.displayName, email: user.email, role: user.role, avatar: user.avatar },
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
      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account has been deactivated' });
      }

      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      const token = generateToken(user._id);
      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: { _id: user._id, username: user.username, displayName: user.displayName, email: user.email, role: user.role, avatar: user.avatar },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
  }
);

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'username displayName avatar')
      .populate('following', 'username displayName avatar');
    res.json({ success: true, user });
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
      const user = await User.findById(req.user._id).select('+password');

      if (!(await user.comparePassword(currentPassword))) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      user.password = newPassword;
      await user.save();
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// POST /api/auth/admin-register — create admin account (requires secret key)
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

      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        const field = existingUser.email === email ? 'email' : 'username';
        return res.status(400).json({ success: false, message: `This ${field} is already registered` });
      }

      const user = await User.create({ username, email, password, displayName, role: 'admin' });
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'Admin account created successfully',
        token,
        user: { _id: user._id, username: user.username, displayName: user.displayName, email: user.email, role: user.role },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
  }
);

module.exports = router;
