const express = require('express');
const router = express.Router();
const Cafe = require('../models/Cafe');

// GET /api/cafes - list cafes with filters
router.get('/', async (req, res) => {
  try {
    const {
      city,
      area,
      establishmentType,
      mealType,
      cuisines,
      dishes,
      priceRange,
      rating,
      isOpenNow,
      awards,
      features,
      dietaryRestrictions,
      search,
      sort = 'rating',
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true };

    if (city) query.city = city;
    if (area) query.area = new RegExp(area, 'i');
    if (isOpenNow === 'true') query.isOpenNow = true;

    if (establishmentType) {
      const types = Array.isArray(establishmentType) ? establishmentType : [establishmentType];
      query.establishmentType = { $in: types };
    }
    if (mealType) {
      const types = Array.isArray(mealType) ? mealType : [mealType];
      query.mealType = { $in: types };
    }
    if (cuisines) {
      const list = Array.isArray(cuisines) ? cuisines : [cuisines];
      query.cuisines = { $in: list };
    }
    if (dishes) {
      const list = Array.isArray(dishes) ? dishes : [dishes];
      query.dishes = { $in: list };
    }
    if (priceRange) {
      const list = Array.isArray(priceRange) ? priceRange : [priceRange];
      query.priceRange = { $in: list };
    }
    if (awards) {
      const list = Array.isArray(awards) ? awards : [awards];
      query.awards = { $in: list };
    }
    if (features) {
      const list = Array.isArray(features) ? features : [features];
      query.features = { $in: list };
    }
    if (dietaryRestrictions) {
      const list = Array.isArray(dietaryRestrictions) ? dietaryRestrictions : [dietaryRestrictions];
      query.dietaryRestrictions = { $in: list };
    }
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    if (sort === 'rating') sortOptions.rating = -1;
    else if (sort === 'reviewCount') sortOptions.reviewCount = -1;
    else if (sort === 'name') sortOptions.name = 1;
    else if (sort === 'newest') sortOptions.createdAt = -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Cafe.countDocuments(query);
    const cafes = await Cafe.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-reviews'); // exclude reviews for listing

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      cafes,
    });
  } catch (error) {
    console.error('GET /api/cafes error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/cafes/filters - get available filter options for a city
router.get('/filters', async (req, res) => {
  try {
    const { city = 'Dhaka' } = req.query;
    const match = { isActive: true, city };

    const [establishments, meals, cuisinesList, dishesList, priceRanges] = await Promise.all([
      Cafe.distinct('establishmentType', match),
      Cafe.distinct('mealType', match),
      Cafe.distinct('cuisines', match),
      Cafe.distinct('dishes', match),
      Cafe.distinct('priceRange', match),
    ]);

    res.json({
      success: true,
      filters: {
        establishmentType: establishments,
        mealType: meals,
        cuisines: cuisinesList,
        dishes: dishesList,
        priceRange: priceRanges,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/cafes/:id - single cafe with reviews
router.get('/:id', async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);
    if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });
    res.json({ success: true, cafe });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/cafes - create cafe (admin)
router.post('/', async (req, res) => {
  try {
    const cafe = new Cafe(req.body);
    await cafe.save();
    res.status(201).json({ success: true, cafe });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/cafes/:id - update cafe (admin)
router.put('/:id', async (req, res) => {
  try {
    const cafe = await Cafe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });
    res.json({ success: true, cafe });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/cafes/:id/reviews - add a review
router.post('/:id/reviews', async (req, res) => {
  try {
    const { author, rating, title, content } = req.body;
    if (!author || !rating || !content) {
      return res.status(400).json({ success: false, message: 'Author, rating, and content are required' });
    }
    const cafe = await Cafe.findById(req.params.id);
    if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });

    cafe.reviews.push({ author, rating, title, content });

    // Recalculate average rating
    const totalRating = cafe.reviews.reduce((acc, r) => acc + r.rating, 0);
    cafe.rating = Math.round((totalRating / cafe.reviews.length) * 10) / 10;
    cafe.reviewCount = cafe.reviews.length;

    await cafe.save();
    res.status(201).json({ success: true, review: cafe.reviews[cafe.reviews.length - 1] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/cafes/:id - delete cafe (admin)
router.delete('/:id', async (req, res) => {
  try {
    const cafe = await Cafe.findByIdAndDelete(req.params.id);
    if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });
    res.json({ success: true, message: 'Cafe deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
