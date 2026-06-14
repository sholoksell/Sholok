const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Complete nested category structure (Shwapno style - up to 4 levels deep!)
const categoriesData = [
  {
    name: 'Food',
    nameBn: 'খাদ্য',
    slug: 'food',
    icon: '🍽️',
    isFeatured: true,
    order: 1,
    subcategories: [
      {
        name: 'Fruits & Vegetables',
        nameBn: 'ফল ও সবজি',
        slug: 'fruits-vegetables',
        icon: '🥬',
        order: 1
      },
      {
        name: 'Meat & Fish',
        nameBn: 'মাংস ও মাছ',
        slug: 'meat-fish',
        icon: '🍖',
        order: 2,
        subcategories: [
          { name: 'Paratha & Roti', slug: 'paratha-roti', order: 1 },
          { name: 'Singara', slug: 'singara', order: 2 },
          { name: 'Samosa', slug: 'samosa', order: 3 },
          { name: 'Nuggets', slug: 'nuggets', order: 4 },
          { name: 'Sausage', slug: 'sausage', order: 5 },
          { name: 'French Fries', slug: 'french-fries', order: 6 },
          { name: 'Frozen Snacks Others', slug: 'frozen-snacks-others', order: 7 }
        ]
      },
      {
        name: 'Eggs',
        nameBn: 'ডিম',
        slug: 'eggs',
        icon: '🥚',
        order: 3
      },
      {
        name: 'Baking Needs',
        nameBn: 'বেকিং সামগ্রী',
        slug: 'baking-needs',
        icon: '🧁',
        order: 4
      },
      {
        name: 'Drinks',
        nameBn: 'পানীয়',
        slug: 'drinks',
        icon: '🥤',
        order: 5
      },
      {
        name: 'Snacks',
        nameBn: 'স্ন্যাকস',
        slug: 'snacks',
        icon: '🍿',
        order: 6,
        subcategories: [
          {
            name: 'Biscuits',
            slug: 'biscuits',
            order: 1,
            subcategories: [
              { name: 'Energy Biscuit', slug: 'energy-biscuit', order: 1 },
              { name: 'Milk Biscuits', slug: 'milk-biscuits', order: 2 },
              { name: 'Cream & Sandwich Biscuits', slug: 'cream-sandwich-biscuits', order: 3 },
              { name: 'Toast Biscuit', slug: 'toast-biscuit', order: 4 },
              { name: 'Salted', slug: 'salted-biscuits', order: 5 },
              { name: 'Sugar Free Biscuits', slug: 'sugar-free-biscuits', order: 6 },
              { name: 'Dry-Cake', slug: 'dry-cake', order: 7 },
              { name: 'Biscuits Others', slug: 'biscuits-others', order: 8 }
            ]
          },
          { name: 'Local Snacks', slug: 'local-snacks', order: 2 },
          { name: 'Popcorn & Nuts', slug: 'popcorn-nuts', order: 3 },
          { name: 'Chips & Pretzels', slug: 'chips-pretzels', order: 4 },
          { name: 'Dried Fruits', slug: 'dried-fruits', order: 5 }
        ]
      },
      {
        name: 'Frozen',
        nameBn: 'হিমায়িত',
        slug: 'frozen',
        icon: '❄️',
        order: 7,
        subcategories: [
          { name: 'Paratha & Roti', slug: 'frozen-paratha-roti', order: 1 },
          { name: 'Singara', slug: 'frozen-singara', order: 2 },
          { name: 'Samosa', slug: 'frozen-samosa', order: 3 },
          { name: 'Nuggets', slug: 'frozen-nuggets', order: 4 },
          { name: 'Sausage', slug: 'frozen-sausage', order: 5 },
          { name: 'French Fries', slug: 'frozen-french-fries', order: 6 },
          { name: 'Frozen Snacks Others', slug: 'frozen-snacks-others-main', order: 7 }
        ]
      },
      {
        name: 'Canned Food',
        nameBn: 'টিনজাত খাবার',
        slug: 'canned-food',
        icon: '🥫',
        order: 8,
        subcategories: [
          { name: 'Canned Vegetables', slug: 'canned-vegetables', order: 1 },
          { name: 'Canned Fish', slug: 'canned-fish', order: 2 },
          { name: 'Canned Fruits', slug: 'canned-fruits', order: 3 },
          { name: 'Canned Meat', slug: 'canned-meat', order: 4 }
        ]
      },
      {
        name: 'Ice Cream',
        nameBn: 'আইসক্রিম',
        slug: 'ice-cream',
        icon: '🍦',
        order: 9
      },
      {
        name: 'Candy & Chocolate',
        nameBn: 'ক্যান্ডি ও চকলেট',
        slug: 'candy-chocolate',
        icon: '🍫',
        order: 10
      },
      {
        name: 'Dairy',
        nameBn: 'দুগ্ধজাত',
        slug: 'dairy',
        icon: '🥛',
        order: 11,
        subcategories: [
          { name: 'Ghee', slug: 'ghee', order: 1 },
          { name: 'Butter', slug: 'butter', order: 2 },
          { name: 'Cheese', slug: 'cheese', order: 3 },
          { name: 'Condensed Milk & Cream', slug: 'condensed-milk-cream', order: 4 },
          {
            name: 'Liquid & UHT Milk',
            slug: 'liquid-uht-milk',
            order: 5,
            subcategories: [
              { name: 'Full Cream Milk', slug: 'full-cream-milk', order: 1 },
              { name: 'Diabetic Milk', slug: 'diabetic-milk', order: 2 },
              { name: 'Low Fat Milk', slug: 'low-fat-milk', order: 3 },
              { name: 'Non Fat Milk', slug: 'non-fat-milk', order: 4 },
              { name: 'Milk Others', slug: 'milk-others', order: 5 }
            ]
          },
          {
            name: 'Powder Milk',
            slug: 'powder-milk',
            order: 6,
            subcategories: [
              { name: 'Full Cream Milk', slug: 'powder-full-cream', order: 1 },
              { name: 'Diabetic Milk', slug: 'powder-diabetic', order: 2 },
              { name: 'Low Fat Milk', slug: 'powder-low-fat', order: 3 },
              { name: 'Non Fat Milk', slug: 'powder-non-fat', order: 4 },
              { name: 'Powder Milk Others', slug: 'powder-milk-others', order: 5 }
            ]
          },
          { name: 'Yogurt', slug: 'yogurt', order: 7 },
          { name: 'Laban', slug: 'laban', order: 8 },
          { name: 'Lacchi', slug: 'lacchi', order: 9 }
        ]
      },
      {
        name: 'Breakfast',
        nameBn: 'প্রাতঃরাশ',
        slug: 'breakfast',
        icon: '🥞',
        order: 12,
        subcategories: [
          { name: 'Breads', slug: 'breads', order: 1 },
          { name: 'Jam & Jelly', slug: 'jam-jelly', order: 2 },
          { name: 'Dips & Spreads', slug: 'dips-spreads', order: 3 },
          { name: 'Honey', slug: 'honey', order: 4 },
          { name: 'Cereals', slug: 'cereals', order: 5 }
        ]
      },
      {
        name: 'Sauces & Pickles',
        nameBn: 'সস ও আচার',
        slug: 'sauces-pickles',
        icon: '🫙',
        order: 13,
        subcategories: [
          { name: 'Pickle & Condiments', slug: 'pickle-condiments', order: 1 },
          { name: 'Dipping Sauce', slug: 'dipping-sauce', order: 2 },
          { name: 'Cooking Sauce', slug: 'cooking-sauce', order: 3 }
        ]
      },
      {
        name: 'Cooking',
        nameBn: 'রান্না',
        slug: 'cooking',
        icon: '👨‍🍳',
        order: 14,
        subcategories: [
          {
            name: 'Rice',
            slug: 'rice',
            order: 1,
            subcategories: [
              { name: 'Loose Rice', slug: 'loose-rice', order: 1 },
              { name: 'Packed Rice', slug: 'packed-rice', order: 2 }
            ]
          },
          {
            name: 'Dal or Lentil',
            slug: 'dal-lentil',
            order: 2,
            subcategories: [
              { name: 'Loose Daal', slug: 'loose-daal', order: 1 },
              { name: 'Packed Daal', slug: 'packed-daal', order: 2 }
            ]
          },
          {
            name: 'Oil',
            slug: 'oil',
            order: 3,
            subcategories: [
              { name: 'Soybean Oil', slug: 'soybean-oil', order: 1 },
              { name: 'Rice Bran Oil', slug: 'rice-bran-oil', order: 2 },
              { name: 'Sunflower Oil', slug: 'sunflower-oil', order: 3 },
              { name: 'Olive Oil', slug: 'olive-oil', order: 4 },
              { name: 'Mustard Oil', slug: 'mustard-oil', order: 5 },
              { name: 'Flavored Oil', slug: 'flavored-oil', order: 6 }
            ]
          },
          {
            name: 'Spices',
            slug: 'spices',
            order: 4,
            subcategories: [
              { name: 'Regular Spice', slug: 'regular-spice', order: 1 },
              { name: 'Mixed Spice', slug: 'mixed-spice', order: 2 },
              { name: 'Wholespice', slug: 'wholespice', order: 3 }
            ]
          },
          {
            name: 'Salt & Sugar',
            slug: 'salt-sugar',
            order: 5,
            subcategories: [
              { name: 'Salt', slug: 'salt', order: 1 },
              { name: 'Sugar', slug: 'sugar', order: 2 }
            ]
          }
        ]
      },
      {
        name: 'Noodles & Pasta',
        nameBn: 'নুডলস ও পাস্তা',
        slug: 'noodles-pasta',
        icon: '🍝',
        order: 15,
        subcategories: [
          { name: 'Noodles', slug: 'noodles', order: 1 },
          { name: 'Pasta', slug: 'pasta', order: 2 },
          { name: 'Macaroni', slug: 'macaroni', order: 3 },
          { name: 'Soup', slug: 'soup', order: 4 },
          { name: 'Cakes', slug: 'cakes', order: 5 }
        ]
      },
      { name: 'Mayonnaise', slug: 'mayonnaise', icon: '🥫', order: 16 },
      { name: 'Shemai', slug: 'shemai', icon: '🍜', order: 17 }
    ]
  },
  {
    name: 'Baby Food & Care',
    nameBn: 'শিশু খাদ্য ও যত্ন',
    slug: 'baby-food-care',
    icon: '👶',
    isFeatured: true,
    order: 2,
    subcategories: [
      { name: 'Baby Food', slug: 'baby-food', order: 1 },
      { name: 'Diapers', slug: 'diapers', order: 2 },
      { name: 'Baby Care', slug: 'baby-care', order: 3 },
      { name: 'Baby Toiletries', slug: 'baby-toiletries', order: 4 },
      { name: 'Baby Accessories', slug: 'baby-accessories', order: 5 }
    ]
  },
  {
    name: 'Home Cleaning',
    nameBn: 'ঘর পরিষ্কার',
    slug: 'home-cleaning',
    icon: '🧹',
    isFeatured: true,
    order: 3,
    subcategories: [
      { name: 'Dishwashing', slug: 'dishwashing', order: 1 },
      { name: 'Laundry', slug: 'laundry', order: 2 },
      { name: 'Floor & Surface', slug: 'floor-surface', order: 3 },
      { name: 'Toilet Cleaning', slug: 'toilet-cleaning', order: 4 },
      { name: 'Air Fresheners', slug: 'air-fresheners', order: 5 },
      { name: 'Cleaning Tools', slug: 'cleaning-tools', order: 6 }
    ]
  },
  {
    name: 'Pet Care',
    nameBn: 'পোষা প্রাণীর যত্ন',
    slug: 'pet-care',
    icon: '🐾',
    isFeatured: true,
    order: 4,
    subcategories: [
      { name: 'Pet Food', slug: 'pet-food', order: 1 },
      { name: 'Pet Accessories', slug: 'pet-accessories', order: 2 },
      { name: 'Pet Grooming', slug: 'pet-grooming', order: 3 }
    ]
  },
  {
    name: 'Beauty & Health',
    nameBn: 'সৌন্দর্য ও স্বাস্থ্য',
    slug: 'beauty-health',
    icon: '💄',
    isFeatured: true,
    order: 5,
    subcategories: [
      { name: 'Skin Care', slug: 'skin-care', order: 1 },
      { name: 'Hair Care', slug: 'hair-care', order: 2 },
      { name: 'Makeup', slug: 'makeup', order: 3 },
      { name: 'Personal Care', slug: 'personal-care', order: 4 },
      { name: 'Health Care', slug: 'health-care', order: 5 },
      { name: 'Oral Care', slug: 'oral-care', order: 6 }
    ]
  },
  {
    name: 'Fashion & Lifestyle',
    nameBn: 'ফ্যাশন ও জীবনধারা',
    slug: 'fashion-lifestyle',
    icon: '👗',
    isFeatured: true,
    order: 6,
    subcategories: [
      { name: 'Clothing', slug: 'clothing', order: 1 },
      { name: 'Shoes', slug: 'shoes', order: 2 },
      { name: 'Accessories', slug: 'fashion-accessories', order: 3 },
      { name: 'Jewelry', slug: 'jewelry', order: 4 },
      { name: 'Watches', slug: 'watches', order: 5 }
    ]
  },
  {
    name: 'Home & Kitchen',
    nameBn: 'ঘর ও রান্নাঘর',
    slug: 'home-kitchen',
    icon: '🏠',
    isFeatured: true,
    order: 7,
    subcategories: [
      { name: 'Cookware', slug: 'cookware', order: 1 },
      { name: 'Tableware', slug: 'tableware', order: 2 },
      { name: 'Kitchen Appliances', slug: 'kitchen-appliances', order: 3 },
      { name: 'Storage', slug: 'storage', order: 4 },
      { name: 'Home Decor', slug: 'home-decor', order: 5 },
      { name: 'Bedding', slug: 'bedding', order: 6 }
    ]
  },
  {
    name: 'Stationeries',
    nameBn: 'স্টেশনারি',
    slug: 'stationeries',
    icon: '📝',
    isFeatured: true,
    order: 8,
    subcategories: [
      { name: 'Writing', slug: 'writing', order: 1 },
      { name: 'Paper Products', slug: 'paper-products', order: 2 },
      { name: 'Office Supplies', slug: 'office-supplies', order: 3 },
      { name: 'School Supplies', slug: 'school-supplies', order: 4 },
      { name: 'Art & Craft', slug: 'art-craft', order: 5 }
    ]
  },
  {
    name: 'Toys & Sports',
    nameBn: 'খেলনা ও খেলাধুলা',
    slug: 'toys-sports',
    icon: '🧸',
    isFeatured: true,
    order: 9,
    subcategories: [
      { name: 'Action Figures', slug: 'action-figures', order: 1 },
      { name: 'Dolls', slug: 'dolls', order: 2 },
      { name: 'Board Games', slug: 'board-games', order: 3 },
      { name: 'Outdoor Toys', slug: 'outdoor-toys', order: 4 },
      { name: 'Sports Equipment', slug: 'sports-equipment', order: 5 },
      { name: 'Fitness', slug: 'fitness', order: 6 }
    ]
  },
  {
    name: 'Gadget',
    nameBn: 'গ্যাজেট',
    slug: 'gadget',
    icon: '📱',
    isFeatured: true,
    order: 10,
    subcategories: [
      { name: 'Mobile Accessories', slug: 'mobile-accessories', order: 1 },
      { name: 'Audio', slug: 'audio', order: 2 },
      { name: 'Smart Devices', slug: 'smart-devices', order: 3 },
      { name: 'Computer Accessories', slug: 'computer-accessories', order: 4 },
      { name: 'Camera & Photo', slug: 'camera-photo', order: 5 }
    ]
  }
];

// Recursive function to create categories
async function createCategoriesRecursive(categories, parentId = null, level = 0) {
  const createdCategories = [];
  
  for (const catData of categories) {
    const { subcategories, ...categoryFields } = catData;
    
    const category = await Category.create({
      ...categoryFields,
      nameBn: categoryFields.nameBn || categoryFields.name,
      description: categoryFields.description || `${categoryFields.name} category`,
      descriptionBn: categoryFields.descriptionBn || `${categoryFields.nameBn || categoryFields.name} ক্যাটাগরি`,
      parentId: parentId,
      isActive: true,
      isFeatured: level === 0 && categoryFields.isFeatured,
    });
    
    const indent = '  '.repeat(level);
    console.log(`${indent}✓ Created: ${category.name}`);
    
    createdCategories.push(category);
    
    // Recursively create subcategories
    if (subcategories && subcategories.length > 0) {
      await createCategoriesRecursive(subcategories, category._id, level + 1);
    }
  }
  
  return createdCategories;
}

async function seedCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing categories
    console.log('🗑️  Clearing existing categories...');
    await Category.deleteMany({});
    console.log('✓ Cleared\n');

    // Create all categories
    console.log('📦 Creating nested categories (Shwapno style)...\n');
    await createCategoriesRecursive(categoriesData);

    // Count results
    const totalCount = await Category.countDocuments();
    const mainCount = await Category.countDocuments({ parentId: null });
    
    console.log('\n✅ Seed completed successfully!');
    console.log(`📊 Total categories created: ${totalCount}`);
    console.log(`📂 Main categories: ${mainCount}`);
    console.log(`📁 Subcategories: ${totalCount - mainCount}`);

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the seed function
seedCategories();
