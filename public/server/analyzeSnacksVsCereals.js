require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function analyzeProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const allProducts = await Product.find({
      categoryId: { $exists: true }
    }).populate('categoryId');

    // Current Snacks & Sweets filter
    const snacksSlugs = ['snacks', 'biscuits-and-cookies', 'breakfast-cereals', 'chips-crisps', 'chocolate', 'candy', 'traditional-sweets', 'cake-mix'];
    const snacksProducts = allProducts.filter(p => 
      p.categoryId && snacksSlugs.includes(p.categoryId.slug)
    );

    // Current Eggs & Cereals filter
    const eggsCerealsSlugs = ['eggs', 'brown-eggs', 'white-eggs', 'duck-eggs', 'quail-eggs', 'breakfast-cereals'];
    const eggsCerealsProducts = allProducts.filter(p => 
      p.categoryId && eggsCerealsSlugs.includes(p.categoryId.slug)
    );

    console.log('🔍 ANALYZING OVERLAP ISSUE:\n');
    console.log('==========================================');
    
    console.log('\n🍪 SNACKS & SWEETS Section (Current):');
    console.log(`Total: ${snacksProducts.length} products`);
    console.log('\nBy Category:');
    const snacksByCategory = {};
    snacksProducts.forEach(p => {
      const slug = p.categoryId.slug;
      if (!snacksByCategory[slug]) snacksByCategory[slug] = [];
      snacksByCategory[slug].push(p.name);
    });
    Object.keys(snacksByCategory).forEach(slug => {
      console.log(`  ${slug}: ${snacksByCategory[slug].length} products`);
      snacksByCategory[slug].forEach(name => console.log(`    - ${name}`));
    });

    console.log('\n==========================================');
    console.log('\n🥚 EGGS & CEREALS Tab (Current):');
    console.log(`Total: ${eggsCerealsProducts.length} products`);
    console.log('\nBy Category:');
    const eggsByCategory = {};
    eggsCerealsProducts.forEach(p => {
      const slug = p.categoryId.slug;
      if (!eggsByCategory[slug]) eggsByCategory[slug] = [];
      eggsByCategory[slug].push(p.name);
    });
    Object.keys(eggsByCategory).forEach(slug => {
      console.log(`  ${slug}: ${eggsByCategory[slug].length} products`);
      eggsByCategory[slug].forEach(name => console.log(`    - ${name}`));
    });

    console.log('\n==========================================');
    console.log('\n⚠️  PROBLEM FOUND:');
    console.log('   Both sections include "breakfast-cereals" category!');
    console.log('   Cereals are appearing in BOTH places.\n');

    console.log('✅ SOLUTION:');
    console.log('   Remove "breakfast-cereals" from Snacks & Sweets');
    console.log('   Keep it ONLY in Eggs & Cereals tab');
    console.log('   Snacks & Sweets should have: snacks, biscuits, chips, chocolate, candy, sweets\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

analyzeProducts();
