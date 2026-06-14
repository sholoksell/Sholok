require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function seedBrandedEggProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find egg categories
    const eggCategories = await Category.find({
      slug: { $in: ['eggs', 'brown-eggs', 'white-eggs'] }
    });

    if (eggCategories.length === 0) {
      console.log('❌ No egg categories found!');
      await mongoose.connection.close();
      return;
    }

    // Delete old simple egg products
    const oldEggNames = ['Brown Eggs Fresh', 'Brown Eggs Dozen', 'White Eggs Fresh', 'Duck Eggs Fresh'];
    const deleteResult = await Product.deleteMany({
      name: { $in: oldEggNames }
    });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} old egg products\n`);

    // Get the main Eggs category
    const eggsCategory = eggCategories.find(cat => cat.slug === 'eggs') || eggCategories[0];

    // Branded egg products from the screenshot
    const brandedEggProducts = [
      {
        name: 'Egg Loose',
        slug: 'egg-loose',
        description: 'Farm fresh loose eggs, sold per piece. Perfect for daily cooking needs.',
        price: 8.75,
        regularPrice: 10, images: [],
        categoryId: eggsCategory._id,
        sku: 'EGG-LOOSE-001',
        stock: 500,
        unit: 'piece',
        tags: ['eggs', 'fresh', 'loose'],
        isFeatured: true,
        isAvailable: true,
        featured: true,
        bestSeller: true
      },
      {
        name: 'Kazi Farm Kitchen Branded Egg (12Pcs Pack)',
        slug: 'kazi-farm-kitchen-branded-egg-12pcs-pack',
        description: 'Kazi Farm Kitchen branded eggs, pack of 12. Premium quality farm eggs.',
        price: 190,
        regularPrice: 210, images: [],
        categoryId: eggsCategory._id,
        sku: 'EGG-KAZI-12',
        stock: 85,
        unit: 'pack',
        tags: ['eggs', 'kazi-farm', 'branded', 'pack'],
        isFeatured: true,
        isAvailable: true,
        featured: true,
        bestSeller: true
      },
      {
        name: 'Paragon Brown Egg 12Pcs (12Pcs Pack Box)',
        slug: 'paragon-brown-egg-12pcs-pack-box',
        description: 'Paragon brown eggs in a convenient 12-piece pack box. Rich in nutrients.',
        price: 205,
        regularPrice: 220, images: [],
        categoryId: eggsCategory._id,
        sku: 'EGG-PARAGON-BROWN-12',
        stock: 120,
        unit: 'pack',
        tags: ['eggs', 'paragon', 'brown-eggs', 'pack'],
        isFeatured: true,
        isAvailable: true,
        featured: true
      },
      {
        name: 'Purnava Omega 3 enriched Egg (12Pcs Pack)',
        slug: 'purnava-omega-3-enriched-egg-12pcs-pack',
        description: 'Purnava Omega 3 enriched eggs, 12-piece pack. Enhanced with healthy Omega 3 fatty acids.',
        price: 280,
        regularPrice: 300, images: [],
        categoryId: eggsCategory._id,
        sku: 'EGG-PURNAVA-OMEGA3-12',
        stock: 75,
        unit: 'pack',
        tags: ['eggs', 'purnava', 'omega-3', 'health', 'pack'],
        isFeatured: true,
        isAvailable: true,
        featured: true,
        bestSeller: true
      },
      {
        name: 'Purnava Vitamin-E Enriched Egg (12Pcs Pack)',
        slug: 'purnava-vitamin-e-enriched-egg-12pcs-pack',
        description: 'Purnava Vitamin-E enriched eggs, 12-piece pack. Extra nutrition with Vitamin E.',
        price: 220,
        regularPrice: 240, images: [],
        categoryId: eggsCategory._id,
        sku: 'EGG-PURNAVA-VITE-12',
        stock: 90,
        unit: 'pack',
        tags: ['eggs', 'purnava', 'vitamin-e', 'health', 'pack'],
        isFeatured: true,
        isAvailable: true,
        featured: true
      },
      {
        name: 'Paragon Omega 3+ Egg 12 Pcs (12Pcs Pack Box)',
        slug: 'paragon-omega-3-plus-egg-12-pcs-pack-box',
        description: 'Paragon Omega 3+ eggs, 12-piece pack box. Premium eggs with extra Omega 3.',
        price: 265,
        regularPrice: 285, images: [],
        categoryId: eggsCategory._id,
        sku: 'EGG-PARAGON-OMEGA3-12',
        stock: 65,
        unit: 'pack',
        tags: ['eggs', 'paragon', 'omega-3', 'premium', 'pack'],
        isFeatured: true,
        isAvailable: true,
        featured: true
      },
      {
        name: 'Quality Premium Egg (12Pcs Pack Box)',
        slug: 'quality-premium-egg-12pcs-pack-box',
        description: 'Quality Premium eggs in 12-piece pack box. Farm fresh and carefully selected.',
        price: 190,
        regularPrice: 205, images: [],
        categoryId: eggsCategory._id,
        sku: 'EGG-QUALITY-PREM-12',
        stock: 100,
        unit: 'pack',
        tags: ['eggs', 'premium', 'quality', 'pack'],
        isFeatured: true,
        isAvailable: true,
        featured: true
      }
    ];

    console.log('🥚 Seeding branded egg products...\n');

    let created = 0;
    let skipped = 0;

    for (const productData of brandedEggProducts) {
      const existing = await Product.findOne({ name: productData.name });
      
      if (existing) {
        console.log(`⏭️  Skipped: ${productData.name} (already exists)`);
        skipped++;
        continue;
      }

      const product = new Product(productData);
      await product.save();
      console.log(`✅ Created: ${productData.name} - ৳${productData.price}`);
      created++;
    }

    console.log(`\n============================================`);
    console.log(`✅ Seeding completed!`);
    console.log(`   Created: ${created} products`);
    console.log(`   Skipped: ${skipped} products`);
    console.log(`============================================\n`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedBrandedEggProducts();
