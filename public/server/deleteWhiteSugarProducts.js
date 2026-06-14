const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function deleteWhiteSugarProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find White Sugar category
    const whiteSugarCategory = await Category.findOne({ 
      $or: [
        { name: /white.*sugar/i },
        { slug: /white.*sugar/i },
        { name: 'White Sugar' }
      ]
    });

    if (!whiteSugarCategory) {
      console.log('⚠️  White Sugar category not found');
      return;
    }

    console.log(`✅ Found category: ${whiteSugarCategory.name} (ID: ${whiteSugarCategory._id})\n`);

    // Find the two specific products
    const productsToDelete = [
      'White Sugar Family Pack',
      'White Refined Sugar'
    ];

    console.log('🔍 Finding and deleting products...\n');
    
    let deletedCount = 0;
    for (const productName of productsToDelete) {
      const product = await Product.findOne({ 
        categoryId: whiteSugarCategory._id,
        name: new RegExp(productName, 'i')
      });

      if (product) {
        console.log(`✅ Found: ${product.name} (${product.weight}) - ৳${product.regularPrice || product.salePrice}`);
        await Product.deleteOne({ _id: product._id });
        console.log(`🗑️  Deleted: ${product.name}\n`);
        deletedCount++;
      } else {
        console.log(`⚠️  Not found: ${productName}\n`);
      }
    }

    console.log('='.repeat(60));
    console.log(`✅ Successfully deleted ${deletedCount} products from White Sugar`);
    console.log('='.repeat(60));

    // Check remaining products
    const remainingProducts = await Product.find({ categoryId: whiteSugarCategory._id });
    console.log(`\n📦 Remaining products in White Sugar category: ${remainingProducts.length}`);
    if (remainingProducts.length > 0) {
      remainingProducts.forEach(p => {
        console.log(`   - ${p.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

deleteWhiteSugarProducts();
