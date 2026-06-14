const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function checkGadgets() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Gadgets
    console.log('=== GADGETS & ELECTRONICS ===');
    const gadgetCategories = await Category.find({
      $or: [
        { slug: /gadget/i },
        { slug: /mobile/i },
        { slug: /audio/i },
        { slug: /smart-device/i },
        { slug: /computer/i },
        { slug: /camera/i },
        { slug: /headphone/i },
        { slug: /power-bank/i },
        { slug: /smart-watch/i },
        { slug: /electronic/i }
      ]
    });
    console.log('Gadget categories found:', gadgetCategories.length);
    gadgetCategories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));
    
    const gadgetProducts = await Product.find({
      categoryId: { $in: gadgetCategories.map(c => c._id) }
    }).select('name categoryId').populate('categoryId', 'name slug');
    console.log(`\nGadget products: ${gadgetProducts.length}`);
    gadgetProducts.forEach(p => console.log(`  - ${p.name} (${p.categoryId.name})`));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkGadgets();
