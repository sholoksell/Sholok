const mongoose = require('mongoose');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function verifyCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    console.log('📋 FEATURED CATEGORIES WITH SUBCATEGORIES:');
    console.log('='.repeat(80));

    const featured = await Category.find({ 
      isFeatured: true, 
      isActive: true,
      parentId: null 
    }).sort('order name');

    for (const cat of featured) {
      const subCount = await Category.countDocuments({ 
        parentId: cat._id, 
        isActive: true 
      });
      
      const icon = cat.icon || '📦';
      const name = cat.name.padEnd(30);
      
      console.log(`${icon} ${name} → ${subCount.toString().padStart(3)} subcategories`);
    }

    console.log('='.repeat(80));
    console.log(`\n✅ Total Featured Categories: ${featured.length}`);
    
    const totalSubs = await Category.countDocuments({ 
      parentId: { $ne: null }, 
      isActive: true 
    });
    console.log(`✅ Total Active Subcategories: ${totalSubs}\n`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyCategories();
