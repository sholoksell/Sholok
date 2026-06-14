const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function checkTabCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Eggs & Cereals
    console.log('=== EGGS & CEREALS ===');
    const eggsCategories = await Category.find({
      $or: [
        { slug: /egg/i },
        { slug: /cereal/i },
        { slug: /breakfast/i },
        { slug: /oat/i }
      ]
    });
    console.log('Categories found:', eggsCategories.length);
    eggsCategories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));
    
    const eggsProducts = await Product.find({
      categoryId: { $in: eggsCategories.map(c => c._id) }
    }).select('name');
    console.log(`Products: ${eggsProducts.length}`);
    eggsProducts.slice(0, 5).forEach(p => console.log(`  - ${p.name}`));

    // Check Frozen Snacks
    console.log('\n=== FROZEN SNACKS ===');
    const frozenCategories = await Category.find({
      $or: [
        { slug: /frozen/i },
        { slug: /ice-cream/i }
      ]
    });
    console.log('Categories found:', frozenCategories.length);
    frozenCategories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));
    
    const frozenProducts = await Product.find({
      categoryId: { $in: frozenCategories.map(c => c._id) }
    }).select('name');
    console.log(`Products: ${frozenProducts.length}`);
    frozenProducts.slice(0, 5).forEach(p => console.log(`  - ${p.name}`));

    // Check Diabetic Corner
    console.log('\n=== DIABETIC CORNER ===');
    const diabeticCategories = await Category.find({
      $or: [
        { slug: /diabetic/i },
        { slug: /sugar-free/i },
        { slug: /organic/i },
        { slug: /health/i }
      ]
    });
    console.log('Categories found:', diabeticCategories.length);
    diabeticCategories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));
    
    const diabeticProducts = await Product.find({
      categoryId: { $in: diabeticCategories.map(c => c._id) }
    }).select('name');
    console.log(`Products: ${diabeticProducts.length}`);
    diabeticProducts.slice(0, 5).forEach(p => console.log(`  - ${p.name}`));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkTabCategories();
