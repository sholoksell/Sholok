const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function deleteBasmatiRicePremium() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the product
    const product = await Product.findOne({ name: 'Basmati Rice Premium' });

    if (product) {
      console.log(`✅ Found product: ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Price: ৳${product.regularPrice}`);
      console.log(`   Weight: ${product.weight}`);
      
      // Delete the product
      await Product.deleteOne({ _id: product._id });
      console.log(`\n🗑️  Deleted: ${product.name}`);
      console.log('✅ Product removed successfully!');
    } else {
      console.log('⚠️  Product "Basmati Rice Premium" not found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

deleteBasmatiRicePremium();
