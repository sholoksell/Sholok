const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function deleteDiaperProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const productsToDelete = [
      'Huggies Baby Diapers',
      'Pampers Newborn Diapers'
    ];

    console.log('🔍 Finding diaper products to delete...\n');
    
    let totalDeleted = 0;
    
    for (const productName of productsToDelete) {
      const product = await Product.findOne({ name: productName });
      
      if (product) {
        console.log(`✅ Found: ${product.name} (${product.weight}) - ৳${product.regularPrice}`);
        await Product.deleteOne({ _id: product._id });
        totalDeleted++;
        console.log(`🗑️  Deleted: ${product.name}\n`);
      } else {
        console.log(`⚠️  Not found: ${productName}\n`);
      }
    }

    console.log('='.repeat(60));
    console.log('✅ Diaper products deletion completed!');
    console.log(`📊 Total products deleted: ${totalDeleted}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Delete failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

deleteDiaperProducts();
