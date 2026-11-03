const router = require('express').Router()
const db = require('../db')
const requireAuth = require('../middleware/auth')

router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM platform_settings')
    const settings = Object.fromEntries(rows.map(r => [r.setting_key, r.setting_value === '1' || r.setting_value === 'true' ? true : r.setting_value === '0' || r.setting_value === 'false' ? false : r.setting_value]))
    res.json(settings)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/', async (req, res) => {
  try {
    const entries = Object.entries(req.body)
    for (const [key, value] of entries) {
      await db.query(
        'INSERT INTO platform_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, String(value), String(value)]
      )
    }
    res.json({ message: 'Settings saved' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
