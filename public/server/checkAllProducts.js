const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function checkProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Beverages
    console.log('=== BEVERAGES ===');
    const beverageCategories = await Category.find({
      $or: [
        { slug: /tea/i },
        { slug: /coffee/i },
        { slug: /juice/i },
        { slug: /cola/i },
        { slug: /soft-drink/i },
        { slug: /beverage/i }
      ]
    });
    console.log('Beverage categories found:', beverageCategories.length);
    beverageCategories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));
    
    const beverageProducts = await Product.find({
      categoryId: { $in: beverageCategories.map(c => c._id) }
    }).select('name');
    console.log(`Beverage products: ${beverageProducts.length}`);
    beverageProducts.slice(0, 5).forEach(p => console.log(`  - ${p.name}`));

    // Check Frozen Foods
    console.log('\n=== FROZEN FOODS ===');
    const frozenCategories = await Category.find({
      $or: [
        { slug: /frozen/i },
        { slug: /ice-cream/i },
        { slug: /dairy.*frozen/i },
        { slug: /yogurt/i }
      ]
    });
    console.log('Frozen categories found:', frozenCategories.length);
    frozenCategories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));
    
    const frozenProducts = await Product.find({
      categoryId: { $in: frozenCategories.map(c => c._id) }
    }).select('name');
    console.log(`Frozen products: ${frozenProducts.length}`);
    frozenProducts.slice(0, 5).forEach(p => console.log(`  - ${p.name}`));

    // Check Snacks
    console.log('\n=== SNACKS & SWEETS ===');
    const snackCategories = await Category.find({
      $or: [
        { slug: /snack/i },
        { slug: /biscuit/i },
        { slug: /cookie/i },
        { slug: /chocolate/i },
        { slug: /cake/i }
      ]
    });
    console.log('Snack categories found:', snackCategories.length);
    snackCategories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));
    
    const snackProducts = await Product.find({
      categoryId: { $in: snackCategories.map(c => c._id) }
    }).select('name');
    console.log(`Snack products: ${snackProducts.length}`);
    snackProducts.slice(0, 5).forEach(p => console.log(`  - ${p.name}`));

    // Check Vegetables/Fruits
    console.log('\n=== VEGETABLES & FRUITS ===');
    const vegetableCategories = await Category.find({
      $or: [
        { slug: /vegetable/i },
        { slug: /fruit/i },
        { slug: /produce/i }
      ]
    });
    console.log('Vegetable/Fruit categories found:', vegetableCategories.length);
    vegetableCategories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));
    
    const vegetableProducts = await Product.find({
      categoryId: { $in: vegetableCategories.map(c => c._id) }
    }).select('name');
    console.log(`Vegetable/Fruit products: ${vegetableProducts.length}`);
    vegetableProducts.slice(0, 5).forEach(p => console.log(`  - ${p.name}`));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkProducts();
