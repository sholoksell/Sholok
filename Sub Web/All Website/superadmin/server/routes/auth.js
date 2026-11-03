const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../db')
const requireAuth = require('../middleware/auth')

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const [rows] = await db.query('SELECT * FROM super_admins WHERE email = ? AND is_active = 1', [email])
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' })

    const admin = rows[0]
    const match = await bcrypt.compare(password, admin.password_hash)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })

    await db.query('UPDATE super_admins SET last_login = NOW() WHERE id = ?', [admin.id])

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role FROM super_admins WHERE id = ?', [req.admin.id])
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Invalid password data' })
    }
    const [rows] = await db.query('SELECT password_hash FROM super_admins WHERE id = ?', [req.admin.id])
    const match = await bcrypt.compare(currentPassword, rows[0].password_hash)
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' })
    const hash = await bcrypt.hash(newPassword, 12)
    await db.query('UPDATE super_admins SET password_hash = ? WHERE id = ?', [hash, req.admin.id])
    res.json({ message: 'Password updated' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
