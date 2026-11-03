const router = require('express').Router()
const db = require('../db')
const requireAuth = require('../middleware/auth')

router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM platform_services ORDER BY name')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    await db.query('UPDATE platform_services SET status = ? WHERE id = ?', [status, req.params.id])
    res.json({ message: 'Status updated' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
