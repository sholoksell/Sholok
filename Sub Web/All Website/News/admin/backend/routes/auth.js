const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'sholok_news_jwt_2024';

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const [[user]] = await pool.query('SELECT * FROM news_admin_users WHERE email=? AND is_active=1', [email]);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    await pool.query('UPDATE news_admin_users SET last_login=NOW() WHERE id=?', [user.id]);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /auth/register  (requires ADMIN_INVITE_CODE env var)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, inviteCode } = req.body;
    const CODE = process.env.ADMIN_INVITE_CODE;
    if (!CODE) return res.status(403).json({ message: 'Registration is disabled' });
    if (!inviteCode || inviteCode !== CODE) return res.status(403).json({ message: 'Invalid invite code' });
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    const [[existing]] = await pool.query('SELECT id FROM news_admin_users WHERE email=?', [email]);
    if (existing) return res.status(409).json({ message: 'An account with this email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query(
      'INSERT INTO news_admin_users (name, email, password_hash, role, is_active) VALUES (?,?,?,?,1)',
      [name.trim(), email.toLowerCase().trim(), hash, 'editor']
    );
    const token = jwt.sign({ id: r.insertId, email, role: 'editor', name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: r.insertId, name, email, role: 'editor' } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const [[user]] = await pool.query('SELECT id,name,email,role,avatar,last_login FROM news_admin_users WHERE id=?', [req.admin.id]);
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /auth/change-password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [[user]] = await pool.query('SELECT * FROM news_admin_users WHERE id=?', [req.admin.id]);
    if (!await bcrypt.compare(currentPassword, user.password_hash)) return res.status(401).json({ message: 'Current password incorrect' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    await pool.query('UPDATE news_admin_users SET password_hash=? WHERE id=?', [await bcrypt.hash(newPassword, 10), req.admin.id]);
    res.json({ message: 'Password changed' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
