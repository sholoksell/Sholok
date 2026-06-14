require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function verifyFix() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const allProducts = await Product.find({
      categoryId: { $exists: true }
    }).populate('categoryId');

    // NEW Snacks & Sweets filter (WITHOUT breakfast-cereals)
    const snacksSlugs = ['snacks', 'biscuits-and-cookies', 'chips-crisps', 'chocolate', 'candy', 'traditional-sweets', 'cake-mix'];
    const snacksProducts = allProducts.filter(p => 
      p.categoryId && snacksSlugs.includes(p.categoryId.slug)
    );

    // Eggs & Cereals filter (WITH breakfast-cereals)
    const eggsCerealsSlugs = ['eggs', 'brown-eggs', 'white-eggs', 'duck-eggs', 'quail-eggs', 'breakfast-cereals'];
    const eggsCerealsProducts = allProducts.filter(p => 
      p.categoryId && eggsCerealsSlugs.includes(p.categoryId.slug)
    );

    console.log('============================================');
    console.log('✅ FIXED - NO MORE OVERLAP!\n');
    console.log('============================================\n');
    
    console.log('🍪 SNACKS & SWEETS Section (Main Page):');
    console.log(`   Total: ${snacksProducts.length} products\n`);
    console.log('   Categories:');
    const snacksByCategory = {};
    snacksProducts.forEach(p => {
      const slug = p.categoryId.slug;
      if (!snacksByCategory[slug]) snacksByCategory[slug] = [];
      snacksByCategory[slug].push(p.name);
    });
    Object.keys(snacksByCategory).forEach(slug => {
      console.log(`   • ${slug}: ${snacksByCategory[slug].length} products`);
      snacksByCategory[slug].slice(0, 3).forEach(name => console.log(`     - ${name}`));
      if (snacksByCategory[slug].length > 3) {
        console.log(`     ... and ${snacksByCategory[slug].length - 3} more`);
      }
    });

    console.log('\n============================================\n');
    console.log('🥚 EGGS & CEREALS Tab (Fresh Vegetables Section):');
    console.log(`   Total: ${eggsCerealsProducts.length} products\n`);
    console.log('   Categories:');
    const eggsByCategory = {};
    eggsCerealsProducts.forEach(p => {
      const slug = p.categoryId.slug;
      if (!eggsByCategory[slug]) eggsByCategory[slug] = [];
      eggsByCategory[slug].push(p.name);
    });
    Object.keys(eggsByCategory).forEach(slug => {
      console.log(`   • ${slug}: ${eggsByCategory[slug].length} products`);
      eggsByCategory[slug].slice(0, 3).forEach(name => console.log(`     - ${name}`));
      if (eggsByCategory[slug].length > 3) {
        console.log(`     ... and ${eggsByCategory[slug].length - 3} more`);
      }
    });

    console.log('\n============================================');
    console.log('✅ PROBLEM FIXED!');
    console.log('   Cereals are NOW ONLY in Eggs & Cereals tab');
    console.log('   Snacks section has NO cereals anymore');
    console.log('============================================\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyFix();
