const mongoose = require('mongoose');
const Product = require('./models/Product');

const checkProducts = async () => {
  try {
    await mongoose.connect('mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0');
    
    console.log('Connected to database...\n');
    
    // Count total products
    const totalProducts = await Product.countDocuments();
    console.log(`Total products: ${totalProducts}\n`);
    
    // Get first 5 products with images
    const products = await Product.find()
      .limit(5)
      .select('name slug thumbnail images categoryId');
    
    console.log('Sample products:');
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Thumbnail: ${product.thumbnail || 'N/A'}`);
      console.log(`   Images: ${product.images?.length || 0} images`);
      if (product.images && product.images.length > 0) {
        console.log(`   First image: ${product.images[0]}`);
      }
    });
    
    await mongoose.connection.close();
    console.log('\n\nDatabase connection closed.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkProducts();
