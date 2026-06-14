const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function removeBeveragesFromWhiteSugar() {
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

    // Get all products in White Sugar category
    const allProducts = await Product.find({ categoryId: whiteSugarCategory._id });
    console.log(`📦 Total products in White Sugar category: ${allProducts.length}\n`);

    // List of beverage products to remove
    const beverageNames = [
      'Red Bull Energy Drink',
      'Red Bull',
      'Mountain Dew',
      'Fanta Orange',
      'Fanta',
      'Sprite Lemon Lime',
      'Sprite',
      'Pepsi Large Bottle',
      'Pepsi',
      'Coca Cola Bottle',
      'Coca Cola',
      'Coca-Cola',
      'Lychee Juice Drink',
      'Lychee Juice',
      'Apple Juice Natural',
      'Apple Juice',
      'Mixed Fruit Juice',
      'Orange Juice Fresh',
      'Orange Juice',
      'Mango Juice',
      'Mineral Water'
    ];

    // Find products that are beverages (not actual sugar)
    const productsToDelete = await Product.find({
      categoryId: whiteSugarCategory._id,
      $or: [
        // Match by name
        ...beverageNames.map(name => ({ name: new RegExp(name, 'i') })),
        // Match by image (beverages typically have these image patterns)
        { images: { $regex: /fanta|pepsi|sprite|cola|juice|energy|drink|bottle|can/i } }
      ]
    });

    if (productsToDelete.length === 0) {
      console.log('⚠️  No beverage products found in White Sugar category');
      console.log('\nCurrent products in category:');
      allProducts.forEach(p => {
        console.log(`   - ${p.name} (${p.weight})`);
      });
      return;
    }

    console.log(`🔍 Found ${productsToDelete.length} beverage products to remove:\n`);
    
    let deletedCount = 0;
    for (const product of productsToDelete) {
      console.log(`   📦 ${product.name} (${product.weight}) - ৳${product.regularPrice || product.salePrice}`);
      await Product.deleteOne({ _id: product._id });
      deletedCount++;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Successfully removed ${deletedCount} beverage products from White Sugar`);
    console.log('='.repeat(60));

    // Show remaining products
    const remainingProducts = await Product.find({ categoryId: whiteSugarCategory._id });
    if (remainingProducts.length > 0) {
      console.log(`\n✅ Remaining products in White Sugar category: ${remainingProducts.length}`);
      remainingProducts.forEach(p => {
        console.log(`   - ${p.name} (${p.weight})`);
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

removeBeveragesFromWhiteSugar();
