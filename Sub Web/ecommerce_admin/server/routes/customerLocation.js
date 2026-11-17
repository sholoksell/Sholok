const express = require('express');
const router = express.Router();
const pool = require('../db');
const customerAuthMiddleware = require('../middleware/customerAuth');

// GET /api/customer-location — get logged-in customer's saved delivery location
router.get('/', customerAuthMiddleware, async (req, res) => {
  try {
    const customerId = req.customer.id;
    const [[row]] = await pool.query(
      'SELECT * FROM customer_delivery_locations WHERE customer_id = ?',
      [customerId]
    );
    if (!row) return res.json(null);
    res.json({
      divisionId: row.division_id,
      divisionName: row.division_name,
      districtId: row.district_id,
      districtName: row.district_name,
      upazilaId: row.upazila_id,
      upazilaName: row.upazila_name,
      updatedAt: row.updated_at,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/customer-location — save/update delivery location
router.post('/', customerAuthMiddleware, async (req, res) => {
  try {
    const customerId = req.customer.id;
    const { division_id, district_id, upazila_id } = req.body;

    if (!division_id || !district_id || !upazila_id) {
      return res.status(400).json({ message: 'division_id, district_id and upazila_id are required' });
    }

    const [[div]] = await pool.query(
      'SELECT id, name FROM delivery_divisions WHERE id = ? AND is_active = 1', [division_id]
    );
    if (!div) return res.status(400).json({ message: 'Invalid division' });

    const [[dist]] = await pool.query(
      'SELECT id, name FROM delivery_districts WHERE id = ? AND division_id = ? AND is_active = 1',
      [district_id, division_id]
    );
    if (!dist) return res.status(400).json({ message: 'Invalid district for this division' });

    const [[upz]] = await pool.query(
      'SELECT id, name FROM delivery_upazilas WHERE id = ? AND district_id = ? AND is_active = 1',
      [upazila_id, district_id]
    );
    if (!upz) return res.status(400).json({ message: 'Invalid upazila for this district' });

    await pool.query(
      `INSERT INTO customer_delivery_locations
        (customer_id, division_id, division_name, district_id, district_name, upazila_id, upazila_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        division_id = VALUES(division_id),
        division_name = VALUES(division_name),
        district_id = VALUES(district_id),
        district_name = VALUES(district_name),
        upazila_id = VALUES(upazila_id),
        upazila_name = VALUES(upazila_name),
        updated_at = CURRENT_TIMESTAMP`,
      [customerId, div.id, div.name, dist.id, dist.name, upz.id, upz.name]
    );

    res.json({
      divisionId: div.id,
      divisionName: div.name,
      districtId: dist.id,
      districtName: dist.name,
      upazilaId: upz.id,
      upazilaName: upz.name,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
