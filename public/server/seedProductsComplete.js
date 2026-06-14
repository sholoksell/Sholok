const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

// Use the same MongoDB URI as the main server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Helper function to create slug
function createSlug(name) {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Helper function to generate SKU
function generateSKU(index) {
  return `PROD-${String(index).padStart(6, '0')}`;
}

// Enhanced product data - will be dynamically assigned to categories
const allProducts = [
  // Rice & Grains
  
  // Fresh Vegetables
  
  // Fresh Fruits
  
  // Milk & Dairy
  
  // Chicken & Meat
  
  // Eggs
  
  // Cooking Oil
  { name: 'Pure Mustard Oil', categoryPattern: /mustard.*oil/i, brand: 'Radhuni', weight: '1L', price: 195, description: 'Pure mustard cooking oil' },
  
  // Sugar & Salt
  
  // Lentils/Dal
  
  // Spices
  
  // Noodles & Pasta
  
  // Sauces
  
  // Ice Cream
  
  // Beverages - Soft Drinks
  
  // Juice
  
  // Tea & Coffee
  
  // Energy Drinks & Water
  
  // Powder Drinks
  
  // Biscuits & Snacks
  
  // Cakes
  
  // Chips & Snacks
  
  // Chocolates & Candy
  
  // Nuts
  
  // Snacks & Sweets - Chips & Crisps
  
  // Snacks & Sweets - Biscuits & Cookies
  
  // Snacks & Sweets - Chocolates & Candies
  
  // Snacks & Sweets - Sweet Snacks & Wafers
  
  // Snacks & Sweets - Traditional Sweets
  
  // Snacks & Sweets - Cakes & Pastries
  
  // Beverages - Tea
  
  // Beverages - Coffee
  
  // Beverages - Juices
  
  // Beverages - Soft Drinks
  
  // Beverages - Energy Drinks
  
  // Personal Care - Soap
  
  // Shampoo
  
  // Toothpaste
  
  // Toothbrush
  
  // Face Wash & Lotion
  
  // Deodorant
  
  // Baby Care
  
  // Household Cleaning
  
  // Gadgets & Electronics
  
  // Frozen Foods & Ice Cream
];

async function seedProducts() {
  try {
    console.log('ðŸ”Œ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('âœ… Connected to MongoDB\n');

    console.log('ðŸ—‘ï¸  Clearing existing products...');
    await Product.deleteMany({});
    console.log('âœ… Cleared existing products\n');

    console.log('ðŸ“‚ Fetching categories from database...');
    const allCategories = await Category.find({ isActive: true }).lean();
    console.log(`âœ… Found ${allCategories.length} categories\n`);

    let totalProductsCreated = 0;
    console.log('ðŸŒ± Starting product seeding...\n');

    // Process each product
    for (const [index, productData] of allProducts.entries()) {
      try {
        // Find matching category using pattern
        const category = allCategories.find(cat => 
          productData.categoryPattern.test(cat.name) || 
          productData.categoryPattern.test(cat.slug)
        );

        if (!category) {
          console.log(`âš ï¸  No category match for: ${productData.name}`);
          continue;
        }

        const slug = createSlug(`${productData.name}-${productData.weight}-${productData.brand}`);
        const sku = generateSKU(index + 1);

        // Randomize some properties
        const isFeatured = Math.random() > 0.7;
        const isNewArrival = Math.random() > 0.8;
        const isBestSeller = Math.random() > 0.75;
        const stock = Math.floor(Math.random() * 450) + 50;

        // Calculate sale price (random discount for some products)
        let salePrice = null;
        if (Math.random() > 0.6) {
          const discount = Math.floor(Math.random() * 20) + 10;
          salePrice = Math.round(productData.price * (100 - discount) / 100);
        }

        const product = new Product({
          name: productData.name,
          nameBn: productData.name,
          slug: slug,
          description: productData.description,
          descriptionBn: productData.description,
          shortDescription: `${productData.name} - ${productData.weight}`,
          categoryId: category._id,
          regularPrice: productData.price,
          salePrice: salePrice,
          sku: sku,
          stock: stock,
          images: [productData.image],
          thumbnail: productData.image,
          brand: productData.brand,
          unit: 'pcs',
          weight: productData.weight,
          tags: [category.name, productData.brand],
          isFeatured: isFeatured,
          isNewArrival: isNewArrival,
          isBestSeller: isBestSeller,
          status: stock > 0 ? 'active' : 'out_of_stock',
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          reviewCount: Math.floor(Math.random() * 100),
          soldCount: Math.floor(Math.random() * 500)
        });

        await product.save();
        totalProductsCreated++;
        console.log(`âœ… [${totalProductsCreated}] ${productData.name} â†’ ${category.name}`);

      } catch (error) {
        console.error(`âŒ Error creating product: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('âœ… Product seed completed successfully!');
    console.log('ðŸ“Š Total products created:', totalProductsCreated);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('âŒ Seed failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nðŸ”Œ Database connection closed');
    process.exit(0);
  }
}

seedProducts();
