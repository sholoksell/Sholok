const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Helper function to create slug
function createSlug(name) {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const diabeticProducts = [
  // Sugar-Free & Diabetic Products
  { name: 'Sugar Free Gold', nameBn: 'সুগার ফ্রি', categoryPattern: /health|supplement/i, brand: 'Zydus', weight: '100 tablets', price: 165, unit: 'bottle', description: 'Sugar-free sweetener tablets for diabetics' },
  { name: 'Sugar Free Natura', nameBn: 'সুগার ফ্রি', categoryPattern: /health|supplement/i, brand: 'Zydus', weight: '500 pellets', price: 195, unit: 'bottle', description: 'Natural sugar substitute pellets' },
  { name: 'Diabetic Biscuits', nameBn: 'ডায়াবেটিক বিস্কুট', categoryPattern: /health|supplement/i, brand: 'Britannia', weight: '200g', price: 125, unit: 'pack', description: 'Sugar-free digestive biscuits for diabetics' },
  { name: 'Sugar Free Tea', nameBn: 'সুগার ফ্রি চা', categoryPattern: /health|supplement/i, brand: 'Twinings', weight: '25 bags', price: 285, unit: 'box', description: 'Herbal tea for diabetic patients' },
  { name: 'Diabetic Chocolate', nameBn: 'ডায়াবেটিক চকলেট', categoryPattern: /health|supplement/i, brand: 'Cadbury', weight: '75g', price: 185, unit: 'bar', description: 'Sugar-free dark chocolate bar' },
  { name: 'Sugar Free Jam', nameBn: 'সুগার ফ্রি জাম', categoryPattern: /health|supplement/i, brand: 'Diabexy', weight: '350g', price: 295, unit: 'jar', description: 'Sugar-free strawberry jam' },
  { name: 'Oats for Diabetics', nameBn: 'ডায়াবেটিক ওটস', categoryPattern: /health|supplement/i, brand: 'Quaker', weight: '500g', price: 225, unit: 'pack', description: 'Rolled oats ideal for diabetic diet' },
  { name: 'Brown Rice', nameBn: 'ব্রাউন রাইস', categoryPattern: /health|supplement/i, brand: 'Organic', weight: '1kg', price: 175, unit: 'kg', description: 'Healthy brown rice for diabetic patients' },
  { name: 'Chia Seeds', nameBn: 'চিয়া সিড', categoryPattern: /health|supplement/i, brand: 'Organic', weight: '250g', price: 385, unit: 'pack', description: 'Organic chia seeds for diabetic diet' },
  { name: 'Flax Seeds', nameBn: 'ফ্ল্যাক্স সিড', categoryPattern: /health|supplement/i, brand: 'Organic', weight: '250g', price: 285, unit: 'pack', description: 'Flax seeds for blood sugar control' },
  { name: 'Sugar Free Honey', nameBn: 'সুগার ফ্রি মধু', categoryPattern: /health|supplement/i, brand: 'Dabur', weight: '250g', price: 325, unit: 'bottle', description: 'Sugar-free honey alternative' },
  { name: 'Whey Protein', nameBn: 'হোয়ে প্রোটিন', categoryPattern: /health|supplement/i, brand: 'Optimum', weight: '1kg', price: 3850, unit: 'bottle', description: 'Protein supplement for diabetics' },
];

async function seedDiabeticProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📂 Fetching categories from database...');
    const allCategories = await Category.find({ isActive: true }).lean();
    console.log(`✅ Found ${allCategories.length} categories\n`);

    let totalProductsCreated = 0;
    let totalProductsSkipped = 0;
    console.log('🌱 Starting diabetic product seeding...\n');

    for (const [index, productData] of diabeticProducts.entries()) {
      try {
        const existingProduct = await Product.findOne({ name: productData.name });
        if (existingProduct) {
          console.log(`⏭️  Skipped (already exists): ${productData.name}`);
          totalProductsSkipped++;
          continue;
        }

        const category = allCategories.find(cat => 
          productData.categoryPattern.test(cat.name) || 
          productData.categoryPattern.test(cat.slug)
        );

        if (!category) {
          console.log(`⚠️  No category match for: ${productData.name}`);
          continue;
        }

        const slug = createSlug(`${productData.name}-${productData.weight}`);
        const sku = `DIABETIC-${String(Date.now() + index).slice(-6)}`;

        const isFeatured = Math.random() > 0.4;
        const isNewArrival = Math.random() > 0.6;
        const isBestSeller = Math.random() > 0.5;
        const stock = Math.floor(Math.random() * 150) + 50;

        let salePrice = null;
        if (Math.random() > 0.5) {
          const discount = Math.floor(Math.random() * 15) + 5;
          salePrice = Math.round(productData.price * (100 - discount) / 100);
        }

        const product = new Product({
          name: productData.name,
          nameBn: productData.nameBn,
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
          unit: productData.unit,
          weight: productData.weight,
          tags: [category.name, productData.brand, 'diabetic', 'sugar-free', 'health'],
          isFeatured: isFeatured,
          isNewArrival: isNewArrival,
          isBestSeller: isBestSeller,
          status: stock > 0 ? 'active' : 'out_of_stock',
          rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
          reviewCount: Math.floor(Math.random() * 60) + 8,
          soldCount: Math.floor(Math.random() * 300) + 40
        });

        await product.save();
        totalProductsCreated++;
        console.log(`✅ [${totalProductsCreated}] ${productData.name} → ${category.name}`);

      } catch (error) {
        console.error(`❌ Error creating product ${productData.name}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Diabetic product seed completed successfully!');
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

seedDiabeticProducts();
