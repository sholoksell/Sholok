const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');

// ─── PUBLIC ROUTES (no auth, for storefront) ─────────────────────────────────

// Public: get products by category slug or search
router.get('/public', async (req, res) => {
  try {
    const { category, search, featured, limit = 50, page = 1, sort = '-createdAt' } = req.query;
    // 'active' and 'published' both mean visible on storefront
    let query = { status: { $in: ['active', 'published'] } };

    if (category) {
      // category param is a slug — resolve to ObjectId
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        // Also include products from child categories
        const childCats = await Category.find({ parentId: cat._id });
        const catIds = [cat._id, ...childCats.map(c => c._id)];
        query.categoryId = { $in: catIds };
      } else {
        // No category found — return empty
        return res.json({ products: [], pagination: { total: 0, page: 1, pages: 0 } });
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (featured === 'true') query.featured = true;
    if (req.query.onSale === 'true') query.salePrice = { $ne: null, $gt: 0 };
    // bestSeller: no dedicated flag in schema — return latest active products

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortMap = {
      '-createdAt': { createdAt: -1 },
      'price_asc': { regularPrice: 1 },
      'price_desc': { regularPrice: -1 },
      'name': { name: 1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public: get single product by slug
router.get('/public/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      status: { $in: ['active', 'published'] },
    })
      .populate('categoryId', 'name slug')
      .populate('relatedProducts', 'name slug regularPrice salePrice images thumbnail')
      .populate('upsellProducts', 'name slug regularPrice salePrice images thumbnail')
      .populate('crossSellProducts', 'name slug regularPrice salePrice images thumbnail');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PUBLIC LIST HELPERS (storefront homepage sections) ────────────────────

// Helper to build a populated active-product query
const findStorePublic = (filter = {}, sort = { createdAt: -1 }, limit = 12) =>
  Product.find({ status: { $in: ['active', 'published'] }, ...filter })
    .populate('categoryId', 'name slug')
    .sort(sort)
    .limit(parseInt(limit) || 12);

// Featured products
router.get('/featured/list', async (req, res) => {
  try {
    const limit = req.query.limit || 12;
    const products = await findStorePublic({ featured: true }, { createdAt: -1 }, limit);
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Best sellers - approximated by featured flag + newest, since there's no soldCount
router.get('/best-sellers/list', async (req, res) => {
  try {
    const limit = req.query.limit || 12;
    const products = await findStorePublic({}, { featured: -1, createdAt: -1 }, limit);
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Deals / on-sale products (have a salePrice)
router.get('/deals/list', async (req, res) => {
  try {
    const limit = req.query.limit || 12;
    const products = await findStorePublic(
      { salePrice: { $ne: null, $gt: 0 } },
      { createdAt: -1 },
      limit
    );
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// New arrivals
router.get('/new-arrivals/list', async (req, res) => {
  try {
    const limit = req.query.limit || 12;
    const products = await findStorePublic({}, { createdAt: -1 }, limit);
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── AUTHENTICATED ADMIN ROUTES ───────────────────────────────────────────────

// Get all products
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};

    if (category) query.categoryId = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).populate('categoryId', 'name').sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper: normalise status - admin uses 'published', DB uses 'active'
const normaliseStatus = (status) => {
  if (status === 'published') return 'active';
  if (status === 'archived') return 'draft';
  return status;
};

// Helper: ensure slug is unique by appending -1, -2, ... if needed
const getUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Product.findOne(query);
    if (!existing) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
};

// Helper: ensure SKU is unique by appending -1, -2, ... if needed
const getUniqueSku = async (baseSku, excludeId = null) => {
  let sku = baseSku;
  let counter = 1;
  while (true) {
    const query = { sku };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Product.findOne(query);
    if (!existing) return sku;
    sku = `${baseSku}-${counter++}`;
  }
};

// Create product
router.post('/', authMiddleware, async (req, res) => {
  try {
    const body = { ...req.body };

    // Auto-resolve duplicate slug
    if (body.slug) {
      body.slug = await getUniqueSlug(body.slug);
    }

    // Auto-resolve duplicate SKU
    if (body.sku) {
      body.sku = await getUniqueSku(body.sku);
    }

    // Normalise status
    if (body.status) body.status = normaliseStatus(body.status);

    // Set thumbnail from first image if not provided
    if (!body.thumbnail && body.images && body.images.length > 0) {
      body.thumbnail = body.images[0];
    }

    const product = new Product(body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ message: `Duplicate value for ${field}. Please use a different value.` });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update product
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const body = { ...req.body };

    // Auto-resolve duplicate slug (excluding current product)
    if (body.slug) {
      body.slug = await getUniqueSlug(body.slug, req.params.id);
    }

    // Auto-resolve duplicate SKU (excluding current product)
    if (body.sku) {
      body.sku = await getUniqueSku(body.sku, req.params.id);
    }

    // Normalise status
    if (body.status) body.status = normaliseStatus(body.status);

    // Set thumbnail from first image if not provided
    if (!body.thumbnail && body.images && body.images.length > 0) {
      body.thumbnail = body.images[0];
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ message: `Duplicate value for ${field}. Please use a different value.` });
    }
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk delete
router.post('/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    await Product.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${ids.length} products deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk update status
router.post('/bulk-update', authMiddleware, async (req, res) => {
  try {
    const { ids, status } = req.body;
    await Product.updateMany(
      { _id: { $in: ids } },
      { status }
    );
    res.json({ message: `${ids.length} products updated successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update stock
router.patch('/:id/stock', authMiddleware, async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
