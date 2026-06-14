const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function analyzeProductImages() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all categories
    const categories = await Category.find({}).sort({ name: 1 });
    console.log(`\nFound ${categories.length} categories`);
    
    // Create category map
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat;
    });

    // Get all products with their categories
    const products = await Product.find({}).populate('categoryId');
    console.log(`\nFound ${products.length} products`);
    
    // Group products by category
    const productsByCategory = {};
    products.forEach(product => {
      const catId = product.categoryId?._id?.toString();
      if (catId) {
        if (!productsByCategory[catId]) {
          productsByCategory[catId] = {
            categoryName: product.categoryId.name,
            products: []
          };
        }
        productsByCategory[catId].products.push({
          name: product.name,
          images: product.images,
          thumbnail: product.thumbnail
        });
      }
    });

    // Display product image information by category
    console.log('\n\n=== PRODUCTS BY CATEGORY ===\n');
    for (const [catId, data] of Object.entries(productsByCategory)) {
      console.log(`\n📦 Category: ${data.categoryName} (${data.products.length} products)`);
      console.log('─'.repeat(60));
      
      data.products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name}`);
        if (product.images && product.images.length > 0) {
          console.log(`     Images: ${product.images.length} image(s)`);
          product.images.forEach((img, i) => {
            const imgUrl = img.length > 70 ? img.substring(0, 70) + '...' : img;
            console.log(`       [${i + 1}] ${imgUrl}`);
          });
        } else {
          console.log(`     ⚠️  No images`);
        }
        if (product.thumbnail) {
          const thumbUrl = product.thumbnail.length > 70 ? product.thumbnail.substring(0, 70) + '...' : product.thumbnail;
          console.log(`     Thumbnail: ${thumbUrl}`);
        }
      });
    }

    // Find products with duplicate images
    console.log('\n\n=== POTENTIAL IMAGE ISSUES ===\n');
    const imageUsage = {};
    products.forEach(product => {
      const images = [...(product.images || [])];
      if (product.thumbnail) images.push(product.thumbnail);
      
      images.forEach(img => {
        if (!imageUsage[img]) {
          imageUsage[img] = [];
        }
        imageUsage[img].push(product.name);
      });
    });

    // Show images used by multiple products
    const duplicateImages = Object.entries(imageUsage).filter(([img, prods]) => prods.length > 1);
    if (duplicateImages.length > 0) {
      console.log('⚠️  Images used by multiple products:');
      duplicateImages.forEach(([img, prods]) => {
        const imgUrl = img.length > 70 ? img.substring(0, 70) + '...' : img;
        console.log(`\n  Image: ${imgUrl}`);
        console.log(`  Used by ${prods.length} products:`);
        prods.forEach(prod => console.log(`    - ${prod}`));
      });
    }

    // Find products without images
    const productsWithoutImages = products.filter(p => !p.images || p.images.length === 0);
    if (productsWithoutImages.length > 0) {
      console.log(`\n⚠️  ${productsWithoutImages.length} products without images:`);
      productsWithoutImages.forEach(p => {
        console.log(`  - ${p.name} (Category: ${p.categoryId?.name || 'Unknown'})`);
      });
    }

    await mongoose.disconnect();
    console.log('\n\nAnalysis complete!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

analyzeProductImages();
