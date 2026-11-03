const router = require('express').Router()
const db = require('../db')
const requireAuth = require('../middleware/auth')

router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const { search, status, type, page = 1, limit = 20 } = req.query
    let query = 'SELECT * FROM frontend_users WHERE 1=1'
    const params = []
    if (search) { query += ' AND (name LIKE ? OR email LIKE ? OR mobile LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`) }
    if (status && status !== 'All statuses') { query += ' AND status = ?'; params.push(status) }
    if (type && type !== 'All account types') { query += ' AND account_type = ?'; params.push(type) }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), (Number(page) - 1) * Number(limit))
    const [rows] = await db.query(query, params)
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM frontend_users WHERE 1=1')
    res.json({ rows, total })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    await db.query('UPDATE frontend_users SET status = ? WHERE id = ?', [status, req.params.id])
    res.json({ message: 'Status updated' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
