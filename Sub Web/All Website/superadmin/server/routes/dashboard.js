const router = require('express').Router()
const db = require('../db')
const requireAuth = require('../middleware/auth')

router.use(requireAuth)

router.get('/stats', async (req, res) => {
  try {
    const [[users]] = await db.query('SELECT COUNT(*) AS total FROM frontend_users')
    const [[active]] = await db.query("SELECT COUNT(*) AS total FROM platform_services WHERE status = 'Active'")
    const [[alerts]] = await db.query("SELECT COUNT(*) AS total FROM security_alerts WHERE status = 'Open'")
    res.json({
      registeredUsers: users.total,
      activeServices: active.total,
      openAlerts: alerts.total,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
