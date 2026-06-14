const mongoose = require('mongoose');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

const gadgetSubcategories = [
  {
    name: 'Audio',
    nameBn: 'অডিও',
    slug: 'audio',
    description: 'Headphones, Earphones, Speakers',
    icon: '🎧',
    parentSlug: 'gadget'
  },
  {
    name: 'Smart Devices',
    nameBn: 'স্মার্ট ডিভাইস',
    slug: 'smart-devices',
    description: 'Smart Watches, Smart Home Devices',
    icon: '⌚',
    parentSlug: 'gadget'
  }
];

async function createGadgetCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the parent Gadget category
    const gadgetCategory = await Category.findOne({ slug: 'gadget' });
    
    if (!gadgetCategory) {
      console.log('❌ Gadget parent category not found!');
      process.exit(1);
    }
    
    console.log(`Found parent category: ${gadgetCategory.name} (ID: ${gadgetCategory._id})\n`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const catData of gadgetSubcategories) {
      try {
        // Check if category already exists
        const existingCategory = await Category.findOne({ slug: catData.slug });

        if (existingCategory) {
          console.log(`⏭️  Already exists: ${catData.name}`);
          skippedCount++;
          continue;
        }

        // Create subcategory
        const category = new Category({
          name: catData.name,
          nameBn: catData.nameBn,
          slug: catData.slug,
          description: catData.description,
          icon: catData.icon,
          parentId: gadgetCategory._id,
          isActive: true,
          isFeatured: false,
          order: addedCount + 1
        });

        await category.save();
        addedCount++;
        console.log(`✅ ${addedCount}. Created: ${catData.name} → ${catData.slug}`);
      } catch (error) {
        console.error(`❌ Error creating ${catData.name}:`, error.message);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Successfully created: ${addedCount} categories`);
    console.log(`⏭️  Skipped (already exist): ${skippedCount} categories`);
    console.log(`${'='.repeat(60)}\n`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

createGadgetCategories();
