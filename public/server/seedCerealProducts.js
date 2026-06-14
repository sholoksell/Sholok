const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Helper function to create slug
function createSlug(name) {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const cerealProducts = [
  // Breakfast Cereals
  { name: 'Kelloggs Corn Flakes', nameBn: 'কর্ন ফ্লেক্স', categoryPattern: /cereal/i, brand: 'Kelloggs', weight: '275g', price: 285, unit: 'box', description: 'Crispy golden corn flakes for healthy breakfast' },
  { name: 'Kelloggs Chocos', nameBn: 'চকোস', categoryPattern: /cereal/i, brand: 'Kelloggs', weight: '250g', price: 295, unit: 'box', description: 'Chocolate flavored wheat breakfast cereal' },
  { name: 'Quaker Oats Regular', nameBn: 'ওটস', categoryPattern: /cereal/i, brand: 'Quaker', weight: '500g', price: 185, unit: 'box', description: 'Whole grain oats for healthy breakfast' },
  { name: 'Kelloggs All Bran', nameBn: 'ব্রান', categoryPattern: /cereal/i, brand: 'Kelloggs', weight: '500g', price: 485, unit: 'box', description: 'High fiber wheat bran cereal' },
  { name: 'Nestle Milo Cereal', nameBn: 'মিলো সিরিয়াল', categoryPattern: /cereal/i, brand: 'Nestle', weight: '330g', price: 345, unit: 'box', description: 'Chocolate malt breakfast cereal' },
  { name: 'Kelloggs Froot Loops', nameBn: 'ফ্রুট লুপস', categoryPattern: /cereal/i, brand: 'Kelloggs', weight: '285g', price: 395, unit: 'box', description: 'Colorful fruit flavored cereal loops' },
  { name: 'Nestle Fitness Cereal', nameBn: 'ফিটনেস সিরিয়াল', categoryPattern: /cereal/i, brand: 'Nestle', weight: '300g', price: 425, unit: 'box', description: 'Whole wheat flakes for fitness conscious' },
  { name: 'Kelloggs Special K', nameBn: 'স্পেশাল কে', categoryPattern: /cereal/i, brand: 'Kelloggs', weight: '300g', price: 485, unit: 'box', description: 'Crispy rice cereal with vitamins' },
];

async function seedCerealProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📂 Fetching categories from database...');
    const allCategories = await Category.find({ isActive: true }).lean();
    console.log(`✅ Found ${allCategories.length} categories\n`);

    let totalProductsCreated = 0;
    let totalProductsSkipped = 0;
    console.log('🌱 Starting cereal product seeding...\n');

    for (const [index, productData] of cerealProducts.entries()) {
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
        const sku = `CEREAL-${String(Date.now() + index).slice(-6)}`;

        const isFeatured = Math.random() > 0.5;
        const isNewArrival = Math.random() > 0.7;
        const isBestSeller = Math.random() > 0.6;
        const stock = Math.floor(Math.random() * 200) + 80;

        let salePrice = null;
        if (Math.random() > 0.5) {
          const discount = Math.floor(Math.random() * 20) + 5;
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
          tags: [category.name, productData.brand, 'breakfast', 'cereal'],
          isFeatured: isFeatured,
          isNewArrival: isNewArrival,
          isBestSeller: isBestSeller,
          status: stock > 0 ? 'active' : 'out_of_stock',
          rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
          reviewCount: Math.floor(Math.random() * 80) + 10,
          soldCount: Math.floor(Math.random() * 400) + 50
        });

        await product.save();
        totalProductsCreated++;
        console.log(`✅ [${totalProductsCreated}] ${productData.name} → ${category.name}`);

      } catch (error) {
        console.error(`❌ Error creating product ${productData.name}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Cereal product seed completed successfully!');
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

seedCerealProducts();
