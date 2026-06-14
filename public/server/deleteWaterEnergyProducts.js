const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function deleteProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const productsToDelete = [
      'Spa Mineral Water',
      'Mum Water 1L',
      'Speed Energy Drink'
    ];

    console.log('🗑️  Deleting products...\n');

    for (const productName of productsToDelete) {
      const result = await Product.deleteOne({ name: productName });
      
      if (result.deletedCount > 0) {
        console.log(`✅ Deleted: ${productName}`);
      } else {
        console.log(`⚠️  Not found: ${productName}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Product deletion completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

deleteProducts();
