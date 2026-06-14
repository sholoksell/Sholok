const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');

// Get active banners
router.get('/', async (req, res) => {
  try {
    const { position } = req.query;

    const query = {
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [
        { endDate: { $gte: new Date() } },
        { endDate: null },
      ],
    };

    if (position) {
      query.position = position;
    }

    const banners = await Banner.find(query).sort('order position');

    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
});

// Track banner click
router.post('/:id/click', async (req, res) => {
  try {
    await Banner.findByIdAndUpdate(req.params.id, {
      $inc: { clickCount: 1 },
    });

    res.json({ message: 'Click tracked' });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking click', error: error.message });
  }
});

module.exports = router;
