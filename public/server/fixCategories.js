const mongoose = require('mongoose');
const Category = require('./models/Category');

// Use the same MongoDB URI as the main server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

const requiredCategories = [
  'Food',
  'Baby Food & Care',
  'Home Cleaning',
  'Pet Care',
  'Beauty & Health',
  'Fashion & Lifestyle',
  'Home & Kitchen',
  'Stationeries',
  'Toys & Sports',
  'Gadget'
];

async function fixCategories() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📂 Fetching all categories...\n');
    const allCategories = await Category.find().lean();
    
    console.log(`Total categories in database: ${allCategories.length}\n`);
    
    console.log('🔍 Checking for required categories:\n');
    console.log('=' .repeat(60));
    
    let updatedCount = 0;
    
    for (const reqCatName of requiredCategories) {
      // Try to find by exact name match
      let category = allCategories.find(cat => 
        cat.name === reqCatName || 
        cat.name.toLowerCase() === reqCatName.toLowerCase()
      );
      
      if (category) {
        console.log(`\n✅ Found: ${category.name}`);
        console.log(`   Slug: ${category.slug}`);
        console.log(`   Featured: ${category.isFeatured}`);
        console.log(`   Active: ${category.isActive}`);
        console.log(`   Parent: ${category.parentId ? 'Has Parent' : 'Root Category'}`);
        
        // Update if needed
        if (!category.isFeatured || !category.isActive || category.parentId) {
          await Category.updateOne(
            { _id: category._id },
            { 
              $set: { 
                isFeatured: true, 
                isActive: true,
                parentId: null  // Make sure it's a root category
              } 
            }
          );
          updatedCount++;
          console.log(`   🔄 Updated to: isFeatured=true, isActive=true, parentId=null`);
        } else {
          console.log(`   ✔️  Already featured and active`);
        }
      } else {
        console.log(`\n❌ NOT FOUND: ${reqCatName}`);
        console.log(`   Available similar names:`);
        const similar = allCategories.filter(cat => 
          !cat.parentId && (
            cat.name.toLowerCase().includes(reqCatName.toLowerCase()) ||
            reqCatName.toLowerCase().includes(cat.name.toLowerCase())
          )
        );
        similar.forEach(cat => {
          console.log(`   - ${cat.name} (${cat.slug}) [Featured: ${cat.isFeatured}]`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Categories check completed!`);
    console.log(`📊 Updated: ${updatedCount} categories`);
    
    // Show all root featured categories
    console.log('\n📋 Current Featured Root Categories:');
    const featured = await Category.find({ 
      isFeatured: true, 
      isActive: true,
      parentId: null 
    }).sort('order name');
    
    featured.forEach((cat, idx) => {
      console.log(`${idx + 1}. ${cat.name} (${cat.slug})`);
    });
    
    console.log(`\nTotal Featured Root Categories: ${featured.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

fixCategories();
