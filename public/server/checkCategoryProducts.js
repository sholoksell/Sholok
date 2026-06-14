const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function checkCategoryProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all categories
    const categories = await Category.find({ isActive: true }).lean();
    console.log(`📂 Found ${categories.length} active categories\n`);

    // Check each category for products
    for (const category of categories) {
      const productCount = await Product.countDocuments({ 
        categoryId: category._id,
        status: 'active'
      });

      console.log(`\n📁 Category: ${category.name} (${category.slug})`);
      console.log(`   ID: ${category._id}`);
      console.log(`   Products: ${productCount}`);

      if (productCount === 0) {
        console.log(`   ⚠️  No products found in this category!`);
      }
    }

    // Check for products without valid category
    const orphanProducts = await Product.find({
      $or: [
        { categoryId: null },
        { categoryId: { $exists: false } }
      ]
    });

    if (orphanProducts.length > 0) {
      console.log(`\n⚠️  Found ${orphanProducts.length} products without category:`);
      orphanProducts.forEach(p => {
        console.log(`   - ${p.name}`);
      });
    }

    // Total products
    const totalProducts = await Product.countDocuments({ status: 'active' });
    console.log(`\n📊 Total active products: ${totalProducts}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

checkCategoryProducts();
