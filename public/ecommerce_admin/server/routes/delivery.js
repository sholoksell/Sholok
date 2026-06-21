const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const DeliveryZone = require('../models/DeliveryZone');

// GET /delivery/areas — public list of serviceable cities/areas
router.get('/areas', async (req, res) => {
  try {
    const zones = await DeliveryZone.find({ isActive: true }).sort({ city: 1 });
    res.json({ zones });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /delivery/slots — public, next 7 days of delivery slots
router.get('/slots', async (req, res) => {
  try {
    const slots = [];
    const labels = ['Morning (9AM-12PM)', 'Afternoon (12PM-4PM)', 'Evening (4PM-8PM)'];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      slots.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        slots: labels,
      });
    }
    res.json({ slots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /delivery/check-availability — public, { postalCode, city }
router.post('/check-availability', async (req, res) => {
  try {
    const { city, postalCode } = req.body;
    if (!city) return res.status(400).json({ available: false, message: 'city is required' });

    const zone = await DeliveryZone.findOne({
      isActive: true,
      city: new RegExp(`^${city}$`, 'i'),
    });

    if (!zone) {
      return res.json({ available: false, message: 'Delivery not available in this area yet' });
    }

    res.json({
      available: true,
      city: zone.city,
      charge: zone.charge,
      estimatedDays: zone.estimatedDays,
      postalCode: postalCode || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Admin management ───────────────────────────────────────────
// GET /delivery/zones — admin list (includes inactive)
router.get('/zones', authMiddleware, async (req, res) => {
  try {
    const zones = await DeliveryZone.find().sort({ city: 1 });
    res.json({ zones });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /delivery/zones — admin create
router.post('/zones', authMiddleware, async (req, res) => {
  try {
    const zone = await DeliveryZone.create(req.body);
    res.status(201).json(zone);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /delivery/zones/:id — admin update
router.put('/zones/:id', authMiddleware, async (req, res) => {
  try {
    const zone = await DeliveryZone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!zone) return res.status(404).json({ message: 'Zone not found' });
    res.json(zone);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /delivery/zones/:id — admin delete
router.delete('/zones/:id', authMiddleware, async (req, res) => {
  try {
    const zone = await DeliveryZone.findByIdAndDelete(req.params.id);
    if (!zone) return res.status(404).json({ message: 'Zone not found' });
    res.json({ message: 'Zone deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
