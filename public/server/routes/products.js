const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');

// Get all products with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      brand,
      sort = '-createdAt',
      page = 1,
      limit = 20,
      featured,
      deal,
      newArrival,
      bestSeller,
    } = req.query;

    const query = { status: 'active' };

    // Category filter (supports both ID and slug)
    if (category) {
      // Check if it's a valid ObjectId
      const Category = require('../models/Category');
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.categoryId = category;
      } else {
        // Find category by slug
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          query.categoryId = categoryDoc._id;
        }
      }
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.$or = [
        { 
          regularPrice: { 
            ...(minPrice && { $gte: Number(minPrice) }),
            ...(maxPrice && { $lte: Number(maxPrice) })
          }
        },
        { 
          salePrice: { 
            $ne: null,
            ...(minPrice && { $gte: Number(minPrice) }),
            ...(maxPrice && { $lte: Number(maxPrice) })
          }
        }
      ];
    }

    // Brand filter
    if (brand) {
      query.brand = brand;
    }

    // Feature filters
    if (featured === 'true') query.isFeatured = true;
    if (deal === 'true') query.isDeal = true;
    if (newArrival === 'true') query.isNewArrival = true;
    if (bestSeller === 'true') query.isBestSeller = true;

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('categoryId', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get single product by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('categoryId', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    // Get related products
    const relatedProducts = await Product.find({
      categoryId: product.categoryId,
      _id: { $ne: product._id },
      status: 'active',
    })
      .limit(8)
      .select('name slug thumbnail regularPrice salePrice rating reviewCount');

    res.json({
      product,
      relatedProducts,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// Get featured products
router.get('/featured/list', async (req, res) => {
  try {
    const products = await Product.find({ 
      isFeatured: true, 
      status: 'active' 
    })
      .populate('categoryId', 'name slug')
      .limit(12)
      .sort('-createdAt');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured products', error: error.message });
  }
});

// Get deals
router.get('/deals/list', async (req, res) => {
  try {
    const products = await Product.find({ 
      isDeal: true,
      dealEndDate: { $gte: new Date() },
      status: 'active' 
    })
      .populate('categoryId', 'name slug')
      .limit(20)
      .sort('-createdAt');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deals', error: error.message });
  }
});

// Get new arrivals
router.get('/new-arrivals/list', async (req, res) => {
  try {
    const products = await Product.find({ 
      isNewArrival: true,
      status: 'active' 
    })
      .populate('categoryId', 'name slug')
      .limit(12)
      .sort('-createdAt');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching new arrivals', error: error.message });
  }
});

// Get best sellers
router.get('/best-sellers/list', async (req, res) => {
  try {
    const products = await Product.find({ 
      isBestSeller: true,
      status: 'active' 
    })
      .populate('categoryId', 'name slug')
      .limit(12)
      .sort('-soldCount');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching best sellers', error: error.message });
  }
});

module.exports = router;
