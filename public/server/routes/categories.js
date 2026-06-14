const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Simple in-memory cache for categories
let categoryCache = {
  data: null,
  featuredData: null,
  timestamp: 0,
  featuredTimestamp: 0
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper to manually clear cache (for admin operations)
function clearCache() {
  categoryCache = {
    data: null,
    featuredData: null,
    timestamp: 0,
    featuredTimestamp: 0
  };
  console.log('🗑️ Category cache cleared');
}

// API endpoint to clear cache
router.post('/clear-cache', (req, res) => {
  clearCache();
  res.json({ success: true, message: 'Category cache cleared' });
});

// Helper function to build category hierarchy from flat array
function buildCategoryHierarchy(categories, parentId = null) {
  const result = [];
  
  for (const category of categories) {
    const catParentId = category.parentId ? category.parentId.toString() : null;
    const compareId = parentId ? parentId.toString() : null;
    
    if (catParentId === compareId) {
      const children = buildCategoryHierarchy(categories, category._id.toString());
      
      const categoryObj = {
        _id: category._id,
        name: category.name,
        nameBn: category.nameBn,
        slug: category.slug,
        icon: category.icon,
        image: category.image,
        description: category.description,
        descriptionBn: category.descriptionBn
      };
      
      if (children.length > 0) {
        categoryObj.subcategories = children;
      }
      
      result.push(categoryObj);
    }
  }
  
  return result;
}

// Get all categories (hierarchical)
router.get('/', async (req, res) => {
  try {
    const { featured } = req.query;
    const now = Date.now();

    // Check cache for regular categories
    if (!featured && categoryCache.data && (now - categoryCache.timestamp) < CACHE_TTL) {
      return res.json(categoryCache.data);
    }

    const query = { isActive: true };
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const categories = await Category.find(query)
      .sort('order')
      .lean()
      .exec();

    // Build hierarchy
    const rootCategories = buildCategoryHierarchy(categories, null);

    // Cache the result
    if (!featured) {
      categoryCache.data = rootCategories;
      categoryCache.timestamp = now;
    }

    res.json(rootCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Get featured categories with nested subcategories (OPTIMIZED - Single Query)
router.get('/public/featured', async (req, res) => {
  try {
    const now = Date.now();
    
    // Check cache
    if (categoryCache.featuredData && (now - categoryCache.featuredTimestamp) < CACHE_TTL) {
      return res.json(categoryCache.featuredData);
    }

    // Fetch ALL active categories in ONE query (not recursive!)
    const allCategories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean()
      .exec();
    
    // Filter featured root categories
    const featuredRootCategories = allCategories.filter(
      cat => cat.isFeatured && !cat.parentId
    );
    
    // Build hierarchy for each featured category
    const result = featuredRootCategories.map(cat => {
      const children = buildCategoryHierarchy(allCategories, cat._id.toString());
      
      return {
        _id: cat._id,
        name: cat.name,
        nameBn: cat.nameBn,
        slug: cat.slug,
        description: cat.description,
        descriptionBn: cat.descriptionBn,
        icon: cat.icon,
        image: cat.image,
        subcategories: children.length > 0 ? children : undefined
      };
    });
    
    // Cache the result
    categoryCache.featuredData = result;
    categoryCache.featuredTimestamp = now;
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching featured categories:', error);
    res.status(500).json({ message: 'Error fetching featured categories', error: error.message });
  }
});

// Get category by slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get subcategories
    const subcategories = await Category.find({
      parentId: category._id,
      isActive: true,
    }).sort('order');

    res.json({
      category,
      subcategories,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
});

// Helper function to clear category cache (can be called after updates)
function clearCategoryCache() {
  categoryCache.data = null;
  categoryCache.featuredData = null;
  categoryCache.timestamp = 0;
  categoryCache.featuredTimestamp = 0;
}

// Export router and cache clearing function
module.exports = router;
module.exports.clearCategoryCache = clearCategoryCache;
