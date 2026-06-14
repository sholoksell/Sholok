const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function countAllProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    
    console.log('📊 Product Summary:');
    console.log(`   Total Products: ${totalProducts}`);
    console.log(`   Active Products: ${activeProducts}`);
    console.log('');

    // Get category breakdown
    const categories = await Category.find().select('name slug');
    console.log('📦 Products by Category:');
    
    for (const cat of categories) {
      const count = await Product.countDocuments({ categoryId: cat._id });
      if (count > 0) {
        console.log(`   ${cat.name}: ${count} products`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

countAllProducts();
