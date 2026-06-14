const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

// Use the same MongoDB URI as the main server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Helper function to create slug
function createSlug(name) {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Beverage products to add
const beverageProducts = [
  // Tea
  { name: 'Premium Black Tea', categoryPattern: /tea.*coffee/i, brand: 'Finlay', weight: '200g', price: 165, description: 'Premium quality black tea leaves' },
  { name: 'Green Tea Healthy', categoryPattern: /tea.*coffee/i, brand: 'Ispahani', weight: '100g', price: 195, description: 'Healthy green tea for wellness' },
  { name: 'Taaza Tea Strong', categoryPattern: /tea.*coffee/i, brand: 'Taaza', weight: '400g', price: 215, description: 'Strong black tea blend' },
  { name: 'Brooke Bond Red Label', categoryPattern: /tea.*coffee/i, brand: 'Brooke Bond', weight: '500g', price: 265, description: 'Classic red label tea' },
  { name: 'Herbal Tea Mix', categoryPattern: /tea.*coffee/i, brand: 'Organic', weight: '100g', price: 295, description: 'Natural herbal tea blend' },
  { name: 'Earl Grey Tea', categoryPattern: /tea.*coffee/i, brand: 'Twinings', weight: '200g', price: 445, description: 'Premium Earl Grey tea' },
  
  // Coffee
  { name: 'Nescafe Classic Coffee', categoryPattern: /tea.*coffee/i, brand: 'Nescafe', weight: '200g', price: 595, description: 'Instant coffee classic blend' },
  { name: 'Nescafe 3in1 Coffee', categoryPattern: /tea.*coffee/i, brand: 'Nescafe', weight: '20 pcs', price: 385, description: '3-in-1 instant coffee sachets' },
  { name: 'Premium Ground Coffee', categoryPattern: /tea.*coffee/i, brand: 'Lavazza', weight: '250g', price: 895, description: 'Premium Italian ground coffee' },
  { name: 'Cappuccino Mix', categoryPattern: /tea.*coffee/i, brand: 'Nescafe', weight: '10 sachets', price: 325, description: 'Instant cappuccino mix' },
  
  // Juices
  { name: 'Mango Juice Pran', categoryPattern: /tea.*coffee/i, brand: 'Pran', weight: '1L', price: 165, description: 'Fresh mango fruit juice' },
  { name: 'Orange Juice Fresh', categoryPattern: /tea.*coffee/i, brand: 'Pran', weight: '1L', price: 175, description: 'Fresh orange juice' },
  { name: 'Mixed Fruit Juice', categoryPattern: /tea.*coffee/i, brand: 'Shezan', weight: '1L', price: 185, description: 'Mix of tropical fruits juice' },
  { name: 'Apple Juice Natural', categoryPattern: /tea.*coffee/i, brand: 'Real', weight: '1L', price: 245, description: 'Natural apple juice' },
  { name: 'Lychee Juice Drink', categoryPattern: /tea.*coffee/i, brand: 'Pran', weight: '250ml', price: 45, description: 'Sweet lychee juice drink' },
  
  // Soft Drinks
  { name: 'Coca Cola Bottle', categoryPattern: /tea.*coffee/i, brand: 'Coca Cola', weight: '1.5L', price: 85, description: 'Coca Cola soft drink' },
  { name: 'Pepsi Large Bottle', categoryPattern: /tea.*coffee/i, brand: 'Pepsi', weight: '1.5L', price: 85, description: 'Pepsi cola soft drink' },
  { name: 'Sprite Lemon Lime', categoryPattern: /tea.*coffee/i, brand: 'Sprite', weight: '1.5L', price: 85, description: 'Lemon lime flavored drink' },
  { name: 'Fanta Orange', categoryPattern: /tea.*coffee/i, brand: 'Fanta', weight: '1.5L', price: 85, description: 'Orange flavored soft drink' },
  { name: 'Mountain Dew', categoryPattern: /tea.*coffee/i, brand: 'Mountain Dew', weight: '1L', price: 75, description: 'Citrus flavored drink' },
  
  // Energy Drinks
  { name: 'Red Bull Energy Drink', categoryPattern: /tea.*coffee/i, brand: 'Red Bull', weight: '250ml', price: 195, description: 'Energy drink with caffeine' }
];

async function seedBeverageProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📂 Fetching categories from database...');
    const allCategories = await Category.find({ isActive: true }).lean();
    console.log(`✅ Found ${allCategories.length} categories\n`);

    let totalProductsCreated = 0;
    let totalProductsSkipped = 0;
    console.log('🌱 Starting beverage product seeding...\n');

    // Process each product
    for (const [index, productData] of beverageProducts.entries()) {
      try {
        // Check if product already exists
        const existingProduct = await Product.findOne({ name: productData.name });
        if (existingProduct) {
          console.log(`⏭️  Skipped (already exists): ${productData.name}`);
          totalProductsSkipped++;
          continue;
        }

        // Find matching category using pattern
        const category = allCategories.find(cat => 
          productData.categoryPattern.test(cat.name) || 
          productData.categoryPattern.test(cat.slug)
        );

        if (!category) {
          console.log(`⚠️  No category match for: ${productData.name}`);
          continue;
        }

        const slug = createSlug(`${productData.name}-${productData.weight}-${productData.brand}`);
        const sku = `BEV-${String(Date.now() + index).slice(-6)}`;

        // Randomize some properties
        const isFeatured = Math.random() > 0.6;
        const isNewArrival = Math.random() > 0.7;
        const isBestSeller = Math.random() > 0.65;
        const stock = Math.floor(Math.random() * 400) + 80;

        // Calculate sale price (random discount for some products)
        let salePrice = null;
        if (Math.random() > 0.5) {
          const discount = Math.floor(Math.random() * 15) + 5;
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
          tags: [category.name, productData.brand, 'beverage'],
          isFeatured: isFeatured,
          isNewArrival: isNewArrival,
          isBestSeller: isBestSeller,
          status: stock > 0 ? 'active' : 'out_of_stock',
          rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
          reviewCount: Math.floor(Math.random() * 90) + 15,
          soldCount: Math.floor(Math.random() * 400) + 60
        });

        await product.save();
        totalProductsCreated++;
        console.log(`✅ [${totalProductsCreated}] ${productData.name} → ${category.name}`);

      } catch (error) {
        console.error(`❌ Error creating product ${productData.name}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Beverage product seed completed successfully!');
    console.log('📊 Total products created:', totalProductsCreated);
    console.log('⏭️  Total products skipped:', totalProductsSkipped);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

seedBeverageProducts();
