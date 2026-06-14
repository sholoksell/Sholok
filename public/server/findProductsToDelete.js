const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function findProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all products with "Ginger", "Grapes", or "Pomegranate" in name
    const products = await Product.find({
      $or: [
        { name: /ginger/i },
        { name: /grapes/i },
        { name: /pomegranate/i }
      ]
    }).select('name slug categoryId').populate('categoryId', 'name');

    console.log('📦 Products found:');
    products.forEach(p => {
      console.log(`   - ${p.name} (${p.categoryId?.name || 'No category'})`);
      console.log(`     ID: ${p._id}`);
    });

    console.log(`\n✅ Total: ${products.length} products`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

findProducts();
