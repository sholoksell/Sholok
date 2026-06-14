const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Main categories with their subcategories (Shwapno style)
const categoriesData = [
  {
    name: 'Food',
    nameBn: 'খাদ্য',
    slug: 'food',
    icon: '🍽️',
    description: 'All kinds of food items',
    descriptionBn: 'সব ধরনের খাদ্য পণ্য',
    isFeatured: true,
    order: 1,
    subcategories: [
      { name: 'Fruits & Vegetables', nameBn: 'ফল ও সবজি', slug: 'fruits-vegetables', icon: '🥬' },
      { name: 'Meat & Fish', nameBn: 'মাংস ও মাছ', slug: 'meat-fish', icon: '🍖' },
      { name: 'Eggs', nameBn: 'ডিম', slug: 'eggs', icon: '🥚' },
      { name: 'Baking Needs', nameBn: 'বেকিং সামগ্রী', slug: 'baking-needs', icon: '🧁' },
      { name: 'Drinks', nameBn: 'পানীয়', slug: 'drinks', icon: '🥤' },
      { name: 'Snacks', nameBn: 'স্ন্যাকস', slug: 'snacks', icon: '🍿' },
      { name: 'Frozen', nameBn: 'হিমায়িত', slug: 'frozen', icon: '❄️' },
      { name: 'Canned Food', nameBn: 'টিনজাত খাবার', slug: 'canned-food', icon: '🥫' },
      { name: 'Ice Cream', nameBn: 'আইসক্রিম', slug: 'ice-cream', icon: '🍦' },
      { name: 'Candy & Chocolate', nameBn: 'ক্যান্ডি ও চকলেট', slug: 'candy-chocolate', icon: '🍫' },
      { name: 'Dairy', nameBn: 'দুগ্ধজাত', slug: 'dairy', icon: '🥛' },
      { name: 'Breakfast', nameBn: 'প্রাতঃরাশ', slug: 'breakfast', icon: '🥞' },
      { name: 'Sauces & Pickles', nameBn: 'সস ও আচার', slug: 'sauces-pickles', icon: '🫙' },
      { name: 'Cookies', nameBn: 'কুকিজ', slug: 'cookies', icon: '🍪' }
    ]
  },
  {
    name: 'Baby Food & Care',
    nameBn: 'শিশু খাদ্য ও যত্ন',
    slug: 'baby-food-care',
    icon: '👶',
    description: 'Everything for your baby',
    descriptionBn: 'আপনার শিশুর জন্য সবকিছু',
    isFeatured: true,
    order: 2,
    subcategories: [
      { name: 'Baby Food', nameBn: 'শিশু খাদ্য', slug: 'baby-food', icon: '🍼' },
      { name: 'Diapers', nameBn: 'ডায়াপার', slug: 'diapers', icon: '🧷' },
      { name: 'Baby Care', nameBn: 'শিশু যত্ন', slug: 'baby-care', icon: '🧴' },
      { name: 'Baby Toiletries', nameBn: 'শিশু প্রসাধনী', slug: 'baby-toiletries', icon: '🧼' },
      { name: 'Baby Accessories', nameBn: 'শিশু আনুষাঙ্গিক', slug: 'baby-accessories', icon: '🧸' }
    ]
  },
  {
    name: 'Home Cleaning',
    nameBn: 'ঘর পরিষ্কার',
    slug: 'home-cleaning',
    icon: '🧹',
    description: 'Cleaning supplies for your home',
    descriptionBn: 'আপনার ঘরের জন্য পরিষ্কারের সামগ্রী',
    isFeatured: true,
    order: 3,
    subcategories: [
      { name: 'Dishwashing', nameBn: 'বাসন ধোয়া', slug: 'dishwashing', icon: '🍽️' },
      { name: 'Laundry', nameBn: 'কাপড় ধোয়া', slug: 'laundry', icon: '🧺' },
      { name: 'Floor & Surface', nameBn: 'মেঝে ও পৃষ্ঠ', slug: 'floor-surface', icon: '🧽' },
      { name: 'Toilet Cleaning', nameBn: 'টয়লেট পরিষ্কার', slug: 'toilet-cleaning', icon: '🚽' },
      { name: 'Air Fresheners', nameBn: 'এয়ার ফ্রেশনার', slug: 'air-fresheners', icon: '🌸' },
      { name: 'Cleaning Tools', nameBn: 'পরিষ্কারের সরঞ্জাম', slug: 'cleaning-tools', icon: '🧹' }
    ]
  },
  {
    name: 'Pet Care',
    nameBn: 'পোষা প্রাণীর যত্ন',
    slug: 'pet-care',
    icon: '🐾',
    description: 'Products for your beloved pets',
    descriptionBn: 'আপনার প্রিয় পোষা প্রাণীর জন্য পণ্য',
    isFeatured: true,
    order: 4,
    subcategories: [
      { name: 'Pet Food', nameBn: 'পোষা প্রাণীর খাবার', slug: 'pet-food', icon: '🦴' },
      { name: 'Pet Accessories', nameBn: 'পোষা প্রাণীর আনুষাঙ্গিক', slug: 'pet-accessories', icon: '🎾' },
      { name: 'Pet Grooming', nameBn: 'পোষা প্রাণীর সাজসজ্জা', slug: 'pet-grooming', icon: '✂️' }
    ]
  },
  {
    name: 'Beauty & Health',
    nameBn: 'সৌন্দর্য ও স্বাস্থ্য',
    slug: 'beauty-health',
    icon: '💄',
    description: 'Beauty and healthcare products',
    descriptionBn: 'সৌন্দর্য এবং স্বাস্থ্যসেবা পণ্য',
    isFeatured: true,
    order: 5,
    subcategories: [
      { name: 'Skin Care', nameBn: 'ত্বকের যত্ন', slug: 'skin-care', icon: '🧴' },
      { name: 'Hair Care', nameBn: 'চুলের যত্ন', slug: 'hair-care', icon: '💇' },
      { name: 'Makeup', nameBn: 'মেকআপ', slug: 'makeup', icon: '💅' },
      { name: 'Personal Care', nameBn: 'ব্যক্তিগত যত্ন', slug: 'personal-care', icon: '🧼' },
      { name: 'Health Care', nameBn: 'স্বাস্থ্যসেবা', slug: 'health-care', icon: '💊' },
      { name: 'Oral Care', nameBn: 'মুখের যত্ন', slug: 'oral-care', icon: '🦷' }
    ]
  },
  {
    name: 'Fashion & Lifestyle',
    nameBn: 'ফ্যাশন ও জীবনধারা',
    slug: 'fashion-lifestyle',
    icon: '👗',
    description: 'Fashion and lifestyle products',
    descriptionBn: 'ফ্যাশন এবং জীবনধারা পণ্য',
    isFeatured: true,
    order: 6,
    subcategories: [
      { name: 'Clothing', nameBn: 'পোশাক', slug: 'clothing', icon: '👔' },
      { name: 'Shoes', nameBn: 'জুতা', slug: 'shoes', icon: '👠' },
      { name: 'Accessories', nameBn: 'আনুষাঙ্গিক', slug: 'fashion-accessories', icon: '👜' },
      { name: 'Jewelry', nameBn: 'গহনা', slug: 'jewelry', icon: '💍' },
      { name: 'Watches', nameBn: 'ঘড়ি', slug: 'watches', icon: '⌚' }
    ]
  },
  {
    name: 'Home & Kitchen',
    nameBn: 'ঘর ও রান্নাঘর',
    slug: 'home-kitchen',
    icon: '🏠',
    description: 'Home and kitchen essentials',
    descriptionBn: 'ঘর এবং রান্নাঘরের প্রয়োজনীয় জিনিস',
    isFeatured: true,
    order: 7,
    subcategories: [
      { name: 'Cookware', nameBn: 'রান্নার সরঞ্জাম', slug: 'cookware', icon: '🍳' },
      { name: 'Tableware', nameBn: 'খাবার পাত্র', slug: 'tableware', icon: '🍽️' },
      { name: 'Kitchen Appliances', nameBn: 'রান্নাঘরের যন্ত্রপাতি', slug: 'kitchen-appliances', icon: '🔌' },
      { name: 'Storage', nameBn: 'সংরক্ষণ', slug: 'storage', icon: '📦' },
      { name: 'Home Decor', nameBn: 'বাড়ির সাজসজ্জা', slug: 'home-decor', icon: '🖼️' },
      { name: 'Bedding', nameBn: 'বিছানা', slug: 'bedding', icon: '🛏️' }
    ]
  },
  {
    name: 'Stationeries',
    nameBn: 'স্টেশনারি',
    slug: 'stationeries',
    icon: '📝',
    description: 'Office and school supplies',
    descriptionBn: 'অফিস এবং স্কুলের সরঞ্জাম',
    isFeatured: true,
    order: 8,
    subcategories: [
      { name: 'Writing', nameBn: 'লেখালেখি', slug: 'writing', icon: '✏️' },
      { name: 'Paper Products', nameBn: 'কাগজের পণ্য', slug: 'paper-products', icon: '📄' },
      { name: 'Office Supplies', nameBn: 'অফিসের সরঞ্জাম', slug: 'office-supplies', icon: '📎' },
      { name: 'School Supplies', nameBn: 'স্কুলের সরঞ্জাম', slug: 'school-supplies', icon: '🎒' },
      { name: 'Art & Craft', nameBn: 'শিল্প ও কারুশিল্প', slug: 'art-craft', icon: '🎨' }
    ]
  },
  {
    name: 'Toys & Sports',
    nameBn: 'খেলনা ও খেলাধুলা',
    slug: 'toys-sports',
    icon: '🧸',
    description: 'Toys and sports equipment',
    descriptionBn: 'খেলনা এবং খেলাধুলার সরঞ্জাম',
    isFeatured: true,
    order: 9,
    subcategories: [
      { name: 'Action Figures', nameBn: 'অ্যাকশন ফিগার', slug: 'action-figures', icon: '🦸' },
      { name: 'Dolls', nameBn: 'পুতুল', slug: 'dolls', icon: '👸' },
      { name: 'Board Games', nameBn: 'বোর্ড গেম', slug: 'board-games', icon: '🎲' },
      { name: 'Outdoor Toys', nameBn: 'বাইরের খেলনা', slug: 'outdoor-toys', icon: '⚽' },
      { name: 'Sports Equipment', nameBn: 'খেলাধুলার সরঞ্জাম', slug: 'sports-equipment', icon: '🏀' },
      { name: 'Fitness', nameBn: 'ফিটনেস', slug: 'fitness', icon: '💪' }
    ]
  },
  {
    name: 'Gadget',
    nameBn: 'গ্যাজেট',
    slug: 'gadget',
    icon: '📱',
    description: 'Electronic gadgets and accessories',
    descriptionBn: 'ইলেকট্রনিক গ্যাজেট এবং আনুষাঙ্গিক',
    isFeatured: true,
    order: 10,
    subcategories: [
      { name: 'Mobile Accessories', nameBn: 'মোবাইল আনুষাঙ্গিক', slug: 'mobile-accessories', icon: '📱' },
      { name: 'Audio', nameBn: 'অডিও', slug: 'audio', icon: '🎧' },
      { name: 'Smart Devices', nameBn: 'স্মার্ট ডিভাইস', slug: 'smart-devices', icon: '⌚' },
      { name: 'Computer Accessories', nameBn: 'কম্পিউটার আনুষাঙ্গিক', slug: 'computer-accessories', icon: '⌨️' },
      { name: 'Camera & Photo', nameBn: 'ক্যামেরা ও ফটো', slug: 'camera-photo', icon: '📷' }
    ]
  }
];

async function seedCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories
    console.log('Clearing existing categories...');
    await Category.deleteMany({});

    // Create main categories first
    console.log('Creating main categories...');
    const createdCategories = [];

    for (const catData of categoriesData) {
      const { subcategories, ...mainCategoryData } = catData;
      
      const mainCategory = await Category.create({
        ...mainCategoryData,
        isActive: true,
        parentId: null
      });

      console.log(`✓ Created main category: ${mainCategory.name}`);
      createdCategories.push({ main: mainCategory, subcategories });
    }

    // Create subcategories
    console.log('\nCreating subcategories...');
    for (const { main, subcategories } of createdCategories) {
      for (let i = 0; i < subcategories.length; i++) {
        const subcat = subcategories[i];
        await Category.create({
          ...subcat,
          description: `${subcat.name} under ${main.name}`,
          descriptionBn: `${main.nameBn} এর অধীনে ${subcat.nameBn}`,
          parentId: main._id,
          isActive: true,
          isFeatured: false,
          order: i + 1
        });
        console.log(`  ✓ Created subcategory: ${subcat.name}`);
      }
    }

    console.log('\n✅ Seed completed successfully!');
    console.log(`Total main categories: ${categoriesData.length}`);
    console.log(`Total subcategories: ${categoriesData.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0)}`);

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedCategories();
