const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// GET all active locations
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'all') {
      filter.category = category;
    }
    const locations = await Location.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single location
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create location
router.post('/', async (req, res) => {
  try {
    const { name, nameBn, lat, lng, category, address, description } = req.body;
    if (!name || lat == null || lng == null) {
      return res.status(400).json({ success: false, message: 'name, lat, lng are required' });
    }
    const location = await Location.create({ name, nameBn, lat, lng, category, address, description });
    res.status(201).json({ success: true, location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update location
router.put('/:id', async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE location (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, message: 'Location deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
