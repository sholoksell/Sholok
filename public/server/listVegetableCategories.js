const mongoose = require('mongoose');
const Category = require('./models/Category');

const uri = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function listVegetableCategories() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Find categories related to vegetables
    const categories = await Category.find({
      $or: [
        { slug: /vegetable/i },
        { slug: /produce/i },
        { slug: /fruit/i },
        { 'name.en': /vegetable/i },
        { 'name.en': /produce/i },
        { 'name.en': /fruit/i }
      ]
    }).select('name slug');

    console.log('\n📦 Vegetable/Produce Categories:');
    categories.forEach(cat => {
      console.log(`- ${cat.name.en} (slug: ${cat.slug})`);
    });

    console.log(`\n✅ Found ${categories.length} categories`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

listVegetableCategories();
