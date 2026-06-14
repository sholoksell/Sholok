const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function updateBestSellers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all products
    const allProducts = await Product.find({ status: 'active' }).sort({ createdAt: -1 });
    console.log(`📦 Found ${allProducts.length} active products`);

    if (allProducts.length === 0) {
      console.log('❌ No products found in database');
      process.exit(0);
    }

    // Update first 10 products as best sellers with varying soldCount
    const updates = [];
    const productsToUpdate = allProducts.slice(0, Math.min(10, allProducts.length));
    
    for (let i = 0; i < productsToUpdate.length; i++) {
      const product = productsToUpdate[i];
      const soldCount = Math.floor(Math.random() * 500) + 50; // Random sales between 50-550
      
      updates.push(
        Product.findByIdAndUpdate(
          product._id,
          { 
            isBestSeller: true,
            soldCount: soldCount,
            viewCount: soldCount * 5 // Views are typically higher than sales
          },
          { new: true }
        )
      );
    }

    const updatedProducts = await Promise.all(updates);
    
    console.log('\n✅ Updated Best Sellers:');
    updatedProducts.forEach(p => {
      console.log(`  📦 ${p.name} - Sold: ${p.soldCount}, Best Seller: ${p.isBestSeller}`);
    });

    console.log('\n🎉 Successfully updated trending products!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateBestSellers();
