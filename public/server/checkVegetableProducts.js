const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function checkVegetableProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find vegetable categories
    const categories = await Category.find({
      slug: { $in: ['fresh-vegetables', 'fresh-fruits', 'fresh-produce'] }
    });

    console.log('📦 Categories found:');
    const categoryIds = categories.map(cat => {
      console.log(`- ${cat.name} (${cat.slug})`);
      return cat._id;
    });

    // Count products in these categories
    const products = await Product.find({ categoryId: { $in: categoryIds } })
      .select('name slug categoryId')
      .populate('categoryId', 'name slug');

    console.log(`\n✅ Total products found: ${products.length}\n`);
    console.log('Products:');
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (${p.categoryId.name})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkVegetableProducts();
