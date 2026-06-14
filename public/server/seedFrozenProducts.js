const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

// Use the same MongoDB URI as the main server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Helper function to create slug
function createSlug(name) {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Frozen food products to add
const frozenProducts = [
  { name: 'Vanilla Ice Cream Tub', categoryPattern: /dairy.*frozen/i, brand: 'Igloo', weight: '500ml', price: 285, description: 'Creamy vanilla ice cream' },
  { name: 'Chocolate Ice Cream', categoryPattern: /dairy.*frozen/i, brand: 'Igloo', weight: '500ml', price: 295, description: 'Rich chocolate ice cream' },
  { name: 'Strawberry Ice Cream', categoryPattern: /dairy.*frozen/i, brand: 'Igloo', weight: '500ml', price: 295, description: 'Sweet strawberry ice cream' },
  { name: 'Mango Ice Cream Premium', categoryPattern: /dairy.*frozen/i, brand: 'Polar', weight: '500ml', price: 310, description: 'Tropical mango ice cream' },
  { name: 'Ice Cream Sandwich', categoryPattern: /dairy.*frozen/i, brand: 'Movenpick', weight: '6 pcs', price: 450, description: 'Delicious ice cream sandwiches' },
  { name: 'Ice Cream Cone Mix', categoryPattern: /dairy.*frozen/i, brand: 'Kwality', weight: '4 pcs', price: 180, description: 'Ice cream cones variety pack' },
  { name: 'Frozen Mixed Vegetables', categoryPattern: /dairy.*frozen/i, brand: 'Aftab', weight: '500g', price: 145, description: 'Pre-cut frozen mixed vegetables' },
  { name: 'Frozen Green Peas', categoryPattern: /dairy.*frozen/i, brand: 'Aftab', weight: '500g', price: 125, description: 'Frozen green peas' },
  { name: 'Frozen Sweet Corn', categoryPattern: /dairy.*frozen/i, brand: 'Fresh', weight: '500g', price: 135, description: 'Frozen sweet corn kernels' },
  { name: 'Frozen French Fries', categoryPattern: /dairy.*frozen|snack/i, brand: 'Farm Frites', weight: '1kg', price: 275, description: 'Crispy frozen french fries' },
  { name: 'Frozen Chicken Nuggets', categoryPattern: /dairy.*frozen|snack/i, brand: 'Kazi Farms', weight: '400g', price: 365, description: 'Frozen chicken nuggets' },
  { name: 'Frozen Fish Fingers', categoryPattern: /dairy.*frozen|snack/i, brand: 'Birds Eye', weight: '400g', price: 395, description: 'Frozen breaded fish fingers' },
  { name: 'Frozen Chicken Sausage', categoryPattern: /dairy.*frozen|snack/i, brand: 'Kazi Farms', weight: '340g', price: 285, description: 'Frozen chicken sausage' },
  { name: 'Frozen Pizza', categoryPattern: /dairy.*frozen|snack/i, brand: 'Frozen', weight: '400g', price: 445, description: 'Ready-to-cook frozen pizza' },
  { name: 'Frozen Paratha', categoryPattern: /dairy.*frozen|snack/i, brand: 'Aftab', weight: '400g', price: 165, description: 'Frozen layered paratha' },
  { name: 'Greek Yogurt Plain', categoryPattern: /yogurt/i, brand: 'Aarong', weight: '200g', price: 145, description: 'Thick Greek style yogurt' },
  { name: 'Mango Yogurt Cup', categoryPattern: /yogurt/i, brand: 'Pran', weight: '80g', price: 28, description: 'Sweet mango flavored yogurt' },
  { name: 'Mixed Berry Yogurt', categoryPattern: /yogurt/i, brand: 'Pran', weight: '80g', price: 28, description: 'Mixed berry flavored yogurt' }
];

async function seedFrozenProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📂 Fetching categories from database...');
    const allCategories = await Category.find({ isActive: true }).lean();
    console.log(`✅ Found ${allCategories.length} categories\n`);

    let totalProductsCreated = 0;
    let totalProductsSkipped = 0;
    console.log('🌱 Starting frozen product seeding...\n');

    // Process each product
    for (const [index, productData] of frozenProducts.entries()) {
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
        const sku = `FROZEN-${String(Date.now() + index).slice(-6)}`;

        // Randomize some properties
        const isFeatured = Math.random() > 0.6;
        const isNewArrival = Math.random() > 0.7;
        const isBestSeller = Math.random() > 0.7;
        const stock = Math.floor(Math.random() * 300) + 50;

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
          images: [],
          thumbnail: '',
          brand: productData.brand,
          unit: 'pcs',
          weight: productData.weight,
          tags: [category.name, productData.brand, 'frozen'],
          isFeatured: isFeatured,
          isNewArrival: isNewArrival,
          isBestSeller: isBestSeller,
          status: stock > 0 ? 'active' : 'out_of_stock',
          rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
          reviewCount: Math.floor(Math.random() * 80) + 10,
          soldCount: Math.floor(Math.random() * 300) + 50
        });

        await product.save();
        totalProductsCreated++;
        console.log(`✅ [${totalProductsCreated}] ${productData.name} → ${category.name}`);

      } catch (error) {
        console.error(`❌ Error creating product ${productData.name}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Frozen product seed completed successfully!');
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

seedFrozenProducts();
