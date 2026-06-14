require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Banner = require('./models/Banner');

const MONGODB_URI = process.env.MONGODB_URI;

async function clearAllImages() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear all product images
    console.log('\n📦 Clearing product images...');
    const productResult = await Product.updateMany(
      {},
      { $set: { images: [] } }
    );
    console.log(`✅ Updated ${productResult.modifiedCount} products - all images removed`);

    // Clear all category images
    console.log('\n📁 Clearing category images...');
    const categoryResult = await Category.updateMany(
      {},
      { $set: { image: null } }
    );
    console.log(`✅ Updated ${categoryResult.modifiedCount} categories - all images removed`);

    // Clear all banner images
    console.log('\n🎨 Clearing banner images...');
    const bannerResult = await Banner.updateMany(
      {},
      { $set: { image: null, mobileImage: null } }
    );
    console.log(`✅ Updated ${bannerResult.modifiedCount} banners - all images removed`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All images cleared from database!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearAllImages();
