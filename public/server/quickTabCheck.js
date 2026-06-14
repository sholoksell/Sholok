require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function checkAllTabs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Tab 1: Fresh Vegetables
    const vegProducts = await Product.find({
      categoryId: { $exists: true }
    }).populate('categoryId');
    
    const veggies = vegProducts.filter(p => 
      p.categoryId && ['fresh-vegetables', 'fresh-fruits', 'fresh-produce'].includes(p.categoryId.slug)
    );
    console.log(`🥬 Fresh Vegetables: ${veggies.length} products`);
    
    // Tab 2: Eggs & Cereals
    const eggs = vegProducts.filter(p => 
      p.categoryId && ['eggs', 'brown-eggs', 'white-eggs', 'duck-eggs', 'quail-eggs', 'breakfast-cereals'].includes(p.categoryId.slug)
    );
    console.log(`🥚 Eggs & Cereals: ${eggs.length} products`);
    
    // Tab 3: Frozen Snacks
    const frozen = vegProducts.filter(p => 
      p.categoryId && ['dairy-and-frozen', 'ice-cream', 'frozen-vegetables', 'frozen-snacks', 'yogurt'].includes(p.categoryId.slug)
    );
    console.log(`❄️ Frozen Snacks: ${frozen.length} products`);
    
    // Tab 4: Diabetic Corner
    const diabetic = vegProducts.filter(p => 
      p.categoryId && ['health-supplements', 'beauty-and-health'].includes(p.categoryId.slug)
    );
    console.log(`💊 Diabetic Corner: ${diabetic.length} products`);
    
    console.log(`\n✅ TOTAL: ${veggies.length + eggs.length + frozen.length + diabetic.length} products across all tabs`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAllTabs();
