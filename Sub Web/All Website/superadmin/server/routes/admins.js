const router = require('express').Router()
const bcrypt = require('bcrypt')
const db = require('../db')
const requireAuth = require('../middleware/auth')

router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT sa.id, sa.name, sa.email, sa.mobile, sa.role, sa.status, sa.joined,
             GROUP_CONCAT(ss.service_name ORDER BY ss.service_name) AS services
      FROM service_admins sa
      LEFT JOIN service_admin_services ss ON ss.admin_id = sa.id
      GROUP BY sa.id
      ORDER BY sa.joined DESC
    `)
    const admins = rows.map(r => ({ ...r, services: r.services ? r.services.split(',') : [] }))
    res.json(admins)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, email, mobile, role, services = [] } = req.body
    if (!name || !email || !role) return res.status(400).json({ message: 'Required fields missing' })
    const [result] = await db.query(
      'INSERT INTO service_admins (name, email, mobile, role, status, joined) VALUES (?, ?, ?, ?, ?, CURDATE())',
      [name, email, mobile || null, role, 'Active']
    )
    const adminId = result.insertId
    if (services.length > 0) {
      const vals = services.map(s => [adminId, s])
      await db.query('INSERT INTO service_admin_services (admin_id, service_name) VALUES ?', [vals])
    }
    res.status(201).json({ id: adminId, message: 'Admin created' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    await db.query('UPDATE service_admins SET status = ? WHERE id = ?', [status, req.params.id])
    res.json({ message: 'Status updated' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM service_admin_services WHERE admin_id = ?', [req.params.id])
    await db.query('DELETE FROM service_admins WHERE id = ?', [req.params.id])
    res.json({ message: 'Admin deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
