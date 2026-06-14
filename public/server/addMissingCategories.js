const mongoose = require('mongoose');
const Category = require('./models/Category');

// Use the same MongoDB URI as the main server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Helper function to create slug
function createSlug(name) {
  return name.toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const newCategories = [
  {
    name: 'Food',
    nameBn: 'খাদ্য',
    slug: 'food',
    icon: '🍽️',
    description: 'All types of food items and groceries',
    descriptionBn: 'সব ধরনের খাদ্য সামগ্রী এবং মুদি',
    order: 10
  },
  {
    name: 'Baby Food & Care',
    nameBn: 'শিশু খাদ্য ও যত্ন',
    slug: 'baby-food-and-care',
    icon: '👶',
    description: 'Baby food, diapers, and care products',
    descriptionBn: 'শিশু খাদ্য, ডায়াপার এবং যত্ন পণ্য',
    order: 20
  },
  {
    name: 'Home Cleaning',
    nameBn: 'গৃহস্থালি পরিষ্কার',
    slug: 'home-cleaning',
    icon: '🧹',
    description: 'Cleaning supplies and household products',
    descriptionBn: 'পরিষ্কার সরঞ্জাম এবং গৃহস্থালি পণ্য',
    order: 30
  },
  {
    name: 'Pet Care',
    nameBn: 'পোষা প্রাণীর যত্ন',
    slug: 'pet-care',
    icon: '🐾',
    description: 'Pet food and care products',
    descriptionBn: 'পোষা প্রাণীর খাদ্য ও যত্ন পণ্য',
    order: 40
  },
  {
    name: 'Beauty & Health',
    nameBn: 'সৌন্দর্য ও স্বাস্থ্য',
    slug: 'beauty-and-health',
    icon: '💄',
    description: 'Beauty, health and personal care products',
    descriptionBn: 'সৌন্দর্য, স্বাস্থ্য এবং ব্যক্তিগত যত্ন পণ্য',
    order: 50
  },
  {
    name: 'Fashion & Lifestyle',
    nameBn: 'ফ্যাশন ও জীবনযাত্রা',
    slug: 'fashion-and-lifestyle',
    icon: '👗',
    description: 'Fashion accessories and lifestyle products',
    descriptionBn: 'ফ্যাশন আনুষাঙ্গিক এবং জীবনযাত্রা পণ্য',
    order: 60
  },
  {
    name: 'Home & Kitchen',
    nameBn: 'ঘর ও রান্নাঘর',
    slug: 'home-and-kitchen',
    icon: '🏠',
    description: 'Home decor and kitchen essentials',
    descriptionBn: 'ঘর সাজানো এবং রান্নাঘরের প্রয়োজনীয় জিনিস',
    order: 70
  },
  {
    name: 'Stationeries',
    nameBn: 'স্টেশনারি',
    slug: 'stationeries',
    icon: '✏️',
    description: 'Office and school stationery items',
    descriptionBn: 'অফিস ও স্কুলের স্টেশনারি সামগ্রী',
    order: 80
  },
  {
    name: 'Toys & Sports',
    nameBn: 'খেলনা ও ক্রীড়া',
    slug: 'toys-and-sports',
    icon: '⚽',
    description: 'Toys, games and sports equipment',
    descriptionBn: 'খেলনা, গেম এবং ক্রীড়া সরঞ্জাম',
    order: 90
  },
  {
    name: 'Gadget',
    nameBn: 'গ্যাজেট',
    slug: 'gadget',
    icon: '📱',
    description: 'Electronics and gadgets',
    descriptionBn: 'ইলেকট্রনিক্স এবং গ্যাজেট',
    order: 100
  }
];

async function addNewCategories() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🌱 Adding new categories...\n');
    console.log('='.repeat(60));

    let addedCount = 0;
    let skippedCount = 0;

    for (const catData of newCategories) {
      // Check if category already exists
      const existing = await Category.findOne({ slug: catData.slug });

      if (existing) {
        console.log(`\n⏭️  SKIPPED: ${catData.name} (already exists)`);
        
        // Update if not featured
        if (!existing.isFeatured || !existing.isActive) {
          await Category.updateOne(
            { _id: existing._id },
            { 
              $set: { 
                isFeatured: true,
                isActive: true,
                order: catData.order
              } 
            }
          );
          console.log(`   🔄 Updated: isFeatured=true, isActive=true`);
        }
        skippedCount++;
      } else {
        // Create new category
        const newCategory = new Category({
          ...catData,
          parentId: null,
          isFeatured: true,
          isActive: true,
        });

        await newCategory.save();
        addedCount++;
        console.log(`\n✅ ADDED: ${catData.name}`);
        console.log(`   Slug: ${catData.slug}`);
        console.log(`   Icon: ${catData.icon}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Categories addition completed!`);
    console.log(`📊 Added: ${addedCount} new categories`);
    console.log(`⏭️  Skipped: ${skippedCount} existing categories`);

    // Show all featured categories
    console.log('\n📋 All Featured Root Categories:');
    console.log('='.repeat(60));
    const featured = await Category.find({ 
      isFeatured: true, 
      isActive: true,
      parentId: null 
    }).sort('order name');
    
    featured.forEach((cat, idx) => {
      console.log(`${(idx + 1).toString().padStart(2, ' ')}. ${cat.icon || '📦'} ${cat.name.padEnd(25)} (${cat.slug})`);
    });
    
    console.log('='.repeat(60));
    console.log(`\n📊 Total Featured Root Categories: ${featured.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

addNewCategories();
