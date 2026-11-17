const express = require('express');
const router = express.Router();
const pool = require('../db');
const customerAuthMiddleware = require('../middleware/customerAuth');

// GET /api/customer-location
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

// POST /api/customer-location
router.post('/', customerAuthMiddleware, async (req, res) => {
  try {
    const customerId = req.customer.id;
    const { division_name, district_name, upazila_name } = req.body;

    if (!division_name || !district_name) {
      return res.status(400).json({ message: 'division_name and district_name are required' });
    }

    // Validate: if upazila provided, check combo exists; otherwise just check division+district
    if (upazila_name) {
      const [[row]] = await pool.query(
        'SELECT assignment_key FROM delivery_area_assignments WHERE division=? AND district=? AND area=? LIMIT 1',
        [division_name, district_name, upazila_name]
      );
      if (!row) return res.status(400).json({ message: 'Invalid location combination' });
    }

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
      [customerId, division_name, division_name, district_name, district_name, upazila_name, upazila_name]
    );

    res.json({ divisionName: division_name, districtName: district_name, upazilaName: upazila_name });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
