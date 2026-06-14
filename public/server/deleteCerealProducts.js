const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function deleteCerealProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the Breakfast Cereals category
    console.log('📂 Finding Breakfast Cereals category...');
    const cerealCategory = await Category.findOne({ 
      $or: [
        { name: /cereal/i },
        { slug: /cereal/i },
        { name: 'Breakfast Cereals' }
      ]
    });

    if (!cerealCategory) {
      console.log('⚠️  Breakfast Cereals category not found');
      return;
    }

    console.log(`✅ Found category: ${cerealCategory.name} (ID: ${cerealCategory._id})\n`);

    // Find all products in this category
    console.log('🔍 Finding all cereal products...');
    const cerealProducts = await Product.find({ categoryId: cerealCategory._id });
    
    if (cerealProducts.length === 0) {
      console.log('⚠️  No cereal products found to delete');
      return;
    }

    console.log(`📊 Found ${cerealProducts.length} cereal products:\n`);
    cerealProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.weight}) - ৳${product.regularPrice}`);
    });

    // Delete the products
    console.log('\n🗑️  Deleting cereal products...');
    const deleteResult = await Product.deleteMany({ categoryId: cerealCategory._id });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Breakfast Cereals products deleted successfully!');
    console.log(`📊 Total products deleted: ${deleteResult.deletedCount}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Delete failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

deleteCerealProducts();
