const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function removeBeveragesFromTeaCoffee() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find Tea & Coffee category
    const teaCoffeeCategory = await Category.findOne({ 
      $or: [
        { name: /tea.*coffee/i },
        { slug: /tea.*coffee/i },
        { name: 'Tea & Coffee' }
      ]
    });

    if (!teaCoffeeCategory) {
      console.log('⚠️  Tea & Coffee category not found');
      return;
    }

    console.log(`✅ Found category: ${teaCoffeeCategory.name} (ID: ${teaCoffeeCategory._id})\n`);

    // List of beverage products to remove (soft drinks, juices, energy drinks)
    const beverageNames = [
      'Red Bull Energy Drink',
      'Mountain Dew',
      'Fanta Orange',
      'Sprite Lemon Lime',
      'Pepsi Large Bottle',
      'Pepsi',
      'Coca Cola Bottle',
      'Coca Cola',
      'Lychee Juice Drink',
      'Apple Juice Natural',
      'Mixed Fruit Juice',
      'Orange Juice Fresh',
      'Coca-Cola',
      'Sprite',
      'Fanta',
      'Mango Juice',
      'Mineral Water'
    ];

    // Find all products in Tea & Coffee category that match beverage names
    const productsToDelete = await Product.find({
      categoryId: teaCoffeeCategory._id,
      $or: beverageNames.map(name => ({ name: new RegExp(name, 'i') }))
    });

    if (productsToDelete.length === 0) {
      console.log('⚠️  No beverage products found in Tea & Coffee category');
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
    console.log(`✅ Successfully removed ${deletedCount} beverage products from Tea & Coffee`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

removeBeveragesFromTeaCoffee();
