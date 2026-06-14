const express = require('express');
const router = express.Router();
const DeliverySlot = require('../models/DeliverySlot');
const DeliveryArea = require('../models/DeliveryArea');

// Get available delivery slots
router.get('/slots', async (req, res) => {
  try {
    const slots = await DeliverySlot.find({ 
      isActive: true,
      $expr: { $lt: ['$currentOrders', '$maxOrders'] }
    }).sort('startTime');

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery slots', error: error.message });
  }
});

// Check delivery availability
router.post('/check-availability', async (req, res) => {
  try {
    const { postalCode, city } = req.body;

    const area = await DeliveryArea.findOne({
      isActive: true,
      city: new RegExp(city, 'i'),
      postalCodes: postalCode,
    });

    if (!area) {
      return res.json({
        available: false,
        message: 'Sorry, we do not deliver to this area yet.',
      });
    }

    res.json({
      available: true,
      area: {
        name: area.name,
        deliveryCharge: area.deliveryCharge,
        freeDeliveryThreshold: area.freeDeliveryThreshold,
        estimatedDeliveryDays: area.estimatedDeliveryDays,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking delivery availability', error: error.message });
  }
});

// Get delivery areas
router.get('/areas', async (req, res) => {
  try {
    const areas = await DeliveryArea.find({ isActive: true })
      .select('name city deliveryCharge freeDeliveryThreshold');

    res.json(areas);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery areas', error: error.message });
  }
});

module.exports = router;
