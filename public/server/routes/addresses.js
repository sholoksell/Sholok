const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Address = require('../models/Address');

// Get all addresses
router.get('/', auth, async (req, res) => {
  try {
    const addresses = await Address.find({ customerId: req.customerId })
      .sort('-isDefault -createdAt');

    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
});

// Get single address
router.get('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      customerId: req.customerId,
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json(address);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching address', error: error.message });
  }
});

// Create address
router.post('/', auth, async (req, res) => {
  try {
    const addressData = {
      ...req.body,
      customerId: req.customerId,
    };

    // If this is the first address or marked as default, set it as default
    const existingAddresses = await Address.countDocuments({ customerId: req.customerId });
    
    if (existingAddresses === 0 || addressData.isDefault) {
      // Remove default from other addresses
      await Address.updateMany(
        { customerId: req.customerId },
        { isDefault: false }
      );
      addressData.isDefault = true;
    }

    const address = new Address(addressData);
    await address.save();

    // Update customer default address
    if (address.isDefault) {
      await require('../models/Customer').findByIdAndUpdate(req.customerId, {
        defaultAddress: address._id,
      });
    }

    res.status(201).json({ message: 'Address added successfully', address });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ message: 'Error creating address', error: error.message });
  }
});

// Update address
router.put('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      customerId: req.customerId,
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If setting as default, remove default from others
    if (req.body.isDefault) {
      await Address.updateMany(
        { customerId: req.customerId, _id: { $ne: req.params.id } },
        { isDefault: false }
      );

      // Update customer default address
      await require('../models/Customer').findByIdAndUpdate(req.customerId, {
        defaultAddress: req.params.id,
      });
    }

    Object.assign(address, req.body);
    await address.save();

    res.json({ message: 'Address updated successfully', address });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
});

// Delete address
router.delete('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      customerId: req.customerId,
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = address.isDefault;
    await address.deleteOne();

    // If deleted address was default, set another as default
    if (wasDefault) {
      const newDefault = await Address.findOne({ customerId: req.customerId });
      if (newDefault) {
        newDefault.isDefault = true;
        await newDefault.save();

        await require('../models/Customer').findByIdAndUpdate(req.customerId, {
          defaultAddress: newDefault._id,
        });
      }
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
});

module.exports = router;
