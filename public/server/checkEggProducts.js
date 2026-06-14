require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function checkEggProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const allProducts = await Product.find({
      categoryId: { $exists: true }
    }).populate('categoryId');

    // Find all egg and cereal products
    const eggsCereals = allProducts.filter(p => 
      p.categoryId && ['eggs', 'brown-eggs', 'white-eggs', 'duck-eggs', 'quail-eggs', 'breakfast-cereals'].includes(p.categoryId.slug)
    );

    console.log('🥚 Current Eggs & Cereals Products:\n');
    console.log('============================================\n');

    const byCategory = {};
    eggsCereals.forEach(p => {
      const catName = p.categoryId.name;
      if (!byCategory[catName]) byCategory[catName] = [];
      byCategory[catName].push({
        name: p.name,
        price: p.price,
        image: p.images[0]
      });
    });

    Object.keys(byCategory).forEach(catName => {
      console.log(`${catName}: ${byCategory[catName].length} products`);
      byCategory[catName].forEach(p => {
        console.log(`  - ${p.name} (৳${p.price})`);
      });
      console.log('');
    });

    console.log('============================================');
    console.log(`Total: ${eggsCereals.length} products\n`);

    console.log('📋 Products from screenshot that may be missing:\n');
    console.log('  - Egg Loose (৳8.75 per piece)');
    console.log('  - Kazi Farm Kitchen Branded Egg (৳190)');
    console.log('  - Paragon Brown Egg 12Pcs (৳205)');
    console.log('  - Purnava Omega 3 enriched Egg 12Pcs (৳280)');
    console.log('  - Purnava Vitamin-E Enriched Egg 12Pcs (৳220)');
    console.log('  - Paragon Omega 3+ Egg 12 Pcs (৳265)');
    console.log('  - Quality Premium Egg 12Pcs (৳190)');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkEggProducts();
