const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// Collect the given category id plus every descendant id (BFS).
async function collectSubtreeIds(rootIds) {
  const roots = (Array.isArray(rootIds) ? rootIds : [rootIds])
    .filter(Boolean)
    .map((id) => id.toString());
  if (roots.length === 0) return [];

  const all = new Set(roots);
  let frontier = roots;
  while (frontier.length > 0) {
    const children = await Category.find({ parentId: { $in: frontier } }).select('_id');
    const next = [];
    for (const c of children) {
      const cid = c._id.toString();
      if (!all.has(cid)) {
        all.add(cid);
        next.push(cid);
      }
    }
    frontier = next;
  }
  return Array.from(all);
}

// For a list of subtree ids, return [{ _id, name, count }] for ones that still hold products.
async function findCategoriesWithProducts(categoryIds) {
  if (!categoryIds.length) return [];
  const objectIds = categoryIds.map((id) => new mongoose.Types.ObjectId(id));
  const grouped = await Product.aggregate([
    { $match: { categoryId: { $in: objectIds } } },
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  ]);
  if (!grouped.length) return [];
  const cats = await Category.find({ _id: { $in: grouped.map((g) => g._id) } }).select('name');
  const nameMap = new Map(cats.map((c) => [c._id.toString(), c.name]));
  return grouped.map((g) => ({
    _id: g._id.toString(),
    name: nameMap.get(g._id.toString()) || 'Unknown',
    count: g.count,
  }));
}

// ─── PUBLIC ROUTES (must be before /:id) ────────────────────────────────────

// Get category by slug - public, used by storefront CategoryPage
router.get('/public/slug/:slug', async (req, res) => {
  try {
    const cat = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!cat) return res.status(404).json({ message: 'Category not found' });

    // Get subcategories
    const subcategories = await Category.find({ parentId: cat._id, isActive: true }).sort({ order: 1, name: 1 });

    // Get parent chain for breadcrumb
    let parent = null;
    if (cat.parentId) {
      parent = await Category.findById(cat.parentId).select('name slug');
    }

    res.json({
      category: {
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        banner: cat.banner,
        icon: cat.icon,
        parentId: cat.parentId,
        parent: parent ? { name: parent.name, slug: parent.slug } : null,
      },
      subcategories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get all active categories nested - used by stoefront sidebar & Shop By Category
router.get('/public/all', async (req, res) => {
  try {
    const allCategories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    const categoryMap = {};
    const rootCategories = [];
    allCategories.forEach(cat => {
      categoryMap[cat._id.toString()] = {
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        icon: cat.icon,
        featured: cat.featured,
        order: cat.order,
        subcategories: []
      };
    });
    allCategories.forEach(cat => {
      if (cat.parentId) {
        const parent = categoryMap[cat.parentId.toString()];
        if (parent) parent.subcategories.push(categoryMap[cat._id.toString()]);
      } else {
        rootCategories.push(categoryMap[cat._id.toString()]);
      }
    });
    res.json(rootCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured/top categories with subcategories - used by homepage Shop By Category section
router.get('/public/featured', async (req, res) => {
  try {
    // Return ALL active root categories (not just featured-flagged ones)
    const rootCategories = await Category.find({
      isActive: true,
      parentId: null
    }).sort({ order: 1, name: 1 });

    const allCats = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });

    // Build full nested structure in one pass (no extra queries per category)
    const categoryMap = {};
    allCats.forEach(cat => {
      categoryMap[cat._id.toString()] = {
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        banner: cat.banner,
        icon: cat.icon,
        featured: cat.featured,
        order: cat.order,
        subcategories: []
      };
    });
    allCats.forEach(cat => {
      if (cat.parentId) {
        const parent = categoryMap[cat.parentId.toString()];
        if (parent) parent.subcategories.push(categoryMap[cat._id.toString()]);
      }
    });

    const result = rootCategories.map(cat => categoryMap[cat._id.toString()]).filter(Boolean);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Legacy shop-by-category public endpoint
router.get('/public/shop-by-category', async (req, res) => {
  try {
    const allCategories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    const categoryMap = {};
    const rootCategories = [];
    allCategories.forEach(cat => {
      categoryMap[cat._id.toString()] = {
        _id: cat._id, name: cat.name, slug: cat.slug,
        description: cat.description, image: cat.image, banner: cat.banner,
        icon: cat.icon, featured: cat.featured, order: cat.order, subcategories: []
      };
    });
    allCategories.forEach(cat => {
      if (cat.parentId) {
        const parent = categoryMap[cat.parentId.toString()];
        if (parent) parent.subcategories.push(categoryMap[cat._id.toString()]);
      } else {
        rootCategories.push(categoryMap[cat._id.toString()]);
      }
    });
    res.json(rootCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── AUTHENTICATED ROUTES ────────────────────────────────────────────────────

// Get all categories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find().populate('parentId', 'name').sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get category by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('parentId', 'name');
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create category
router.post('/', authMiddleware, async (req, res) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update category
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete category (recursive — also blocks if any descendant subcategory has products)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Collect this category + every descendant
    const subtreeIds = await collectSubtreeIds(id);

    // Check products anywhere in the subtree
    const blocked = await findCategoriesWithProducts(subtreeIds);
    if (blocked.length > 0) {
      const total = blocked.reduce((s, b) => s + b.count, 0);
      const detail = blocked.map((b) => `${b.name} (${b.count})`).join(', ');
      const isSelf = blocked.length === 1 && blocked[0]._id === id.toString();
      const message = isSelf
        ? `Cannot delete this category. ${total} product(s) are still assigned to it. You must move or delete products first.`
        : `Cannot delete this category. Its subcategories still contain ${total} product(s): ${detail}. You must move or delete products first.`;
      return res.status(400).json({
        message,
        productCount: total,
        blocked,
        code: 'CATEGORY_HAS_PRODUCTS',
      });
    }

    // Safe to delete the entire subtree atomically
    await Category.deleteMany({ _id: { $in: subtreeIds } });
    res.json({
      message: 'Category deleted successfully',
      deletedCount: subtreeIds.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk delete (recursive — blocks if any selected category OR its descendants have products)
router.post('/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No category ids provided' });
    }

    const subtreeIds = await collectSubtreeIds(ids);
    const blocked = await findCategoriesWithProducts(subtreeIds);

    if (blocked.length > 0) {
      const total = blocked.reduce((s, b) => s + b.count, 0);
      const names = blocked.map((b) => `${b.name} (${b.count})`).join(', ');
      return res.status(400).json({
        message: `Cannot delete categories with products: ${names}. ${total} product(s) total. You must move or delete products first.`,
        productCount: total,
        blocked,
        code: 'CATEGORY_HAS_PRODUCTS',
      });
    }

    await Category.deleteMany({ _id: { $in: subtreeIds } });
    res.json({
      message: `${subtreeIds.length} categories deleted successfully`,
      deletedCount: subtreeIds.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk update status
router.post('/bulk-update', authMiddleware, async (req, res) => {
  try {
    const { ids, isActive } = req.body;
    await Category.updateMany(
      { _id: { $in: ids } },
      { isActive }
    );
    res.json({ message: `${ids.length} categories updated successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
