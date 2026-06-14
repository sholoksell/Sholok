const mongoose = require('mongoose');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function listCategories() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    console.log('📂 Searching for beverage related categories:\n');
    
    const patterns = [/beverage/i, /tea/i, /coffee/i, /juice/i, /cola/i, /soft.*drink/i, /drink/i, /water/i];
    
    patterns.forEach(pattern => {
      console.log(`\n🔍 Pattern: ${pattern}`);
      const matches = categories.filter(cat => 
        pattern.test(cat.name) || pattern.test(cat.slug)
      );
      if (matches.length > 0) {
        matches.forEach(cat => {
          console.log(`  - ${cat.name} (slug: ${cat.slug})`);
        });
      } else {
        console.log('  No matches found');
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

listCategories();
