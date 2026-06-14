require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function quickCheck() {
  try {
    await mongoose.connect(MONGODB_URI);

    const allProducts = await Product.find({ categoryId: { $exists: true } }).populate('categoryId');

    const eggsCereals = allProducts.filter(p => 
      p.categoryId && ['eggs', 'brown-eggs', 'white-eggs', 'duck-eggs', 'quail-eggs', 'breakfast-cereals'].includes(p.categoryId.slug)
    );

    const eggs = eggsCereals.filter(p => !p.categoryId.slug.includes('cereal'));
    const cereals = eggsCereals.filter(p => p.categoryId.slug.includes('cereal'));

    console.log('\n🥚 EGGS & CEREALS TAB:');
    console.log(`├─ Egg products: ${eggs.length}`);
    eggs.forEach(p => console.log(`│  • ${p.name} (৳${p.price})`));
    console.log(`├─ Cereal products: ${cereals.length}`);
    console.log(`└─ Total: ${eggsCereals.length} products\n`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

quickCheck();
