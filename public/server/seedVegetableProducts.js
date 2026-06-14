const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Helper function to create slug
function createSlug(name) {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const vegetableProducts = [
  // Fresh Vegetables
  { name: 'Fresh Potato', nameBn: 'আলু', categoryPattern: /vegetable/i, brand: '', weight: '1kg', price: 40, unit: 'kg', description: 'Farm fresh potatoes, perfect for cooking and frying' },
  { name: 'Fresh Tomato', nameBn: 'টমেটো', categoryPattern: /vegetable/i, brand: '', weight: '1kg', price: 60, unit: 'kg', description: 'Juicy red tomatoes, rich in vitamins and antioxidants' },
  { name: 'Fresh Onion', nameBn: 'পেঁয়াজ', categoryPattern: /vegetable/i, brand: '', weight: '1kg', price: 80, unit: 'kg', description: 'Premium quality onions for everyday cooking' },
  { name: 'Fresh Carrot', nameBn: 'গাজর', categoryPattern: /vegetable/i, brand: '', weight: '1kg', price: 70, unit: 'kg', description: 'Crunchy orange carrots, high in beta-carotene' },
  { name: 'Fresh Cabbage', nameBn: 'বাঁধাকপি', categoryPattern: /vegetable/i, brand: '', weight: '1pc', price: 50, unit: 'piece', description: 'Green cabbage, ideal for salads and stir-fry' },
  { name: 'Fresh Cauliflower', nameBn: 'ফুলকপি', categoryPattern: /vegetable/i, brand: '', weight: '1pc', price: 55, unit: 'piece', description: 'White cauliflower, perfect for curries and roasting' },
  { name: 'Fresh Spinach', nameBn: 'পালংশাক', categoryPattern: /vegetable/i, brand: '', weight: '1 bunch', price: 35, unit: 'bunch', description: 'Leafy green spinach, iron-rich and nutritious' },
  { name: 'Fresh Broccoli', nameBn: 'ব্রকলি', categoryPattern: /vegetable/i, brand: '', weight: '1kg', price: 120, unit: 'kg', description: 'Green broccoli florets, superfood packed with nutrients' },
  { name: 'Fresh Cucumber', nameBn: 'শসা', categoryPattern: /vegetable/i, brand: '', weight: '1kg', price: 45, unit: 'kg', description: 'Crisp cucumbers, perfect for salads and raita' },
  { name: 'Fresh Bell Pepper', nameBn: 'ক্যাপসিকাম', categoryPattern: /vegetable/i, brand: '', weight: '1kg', price: 150, unit: 'kg', description: 'Colorful bell peppers, sweet and crunchy' },
  { name: 'Fresh Eggplant', nameBn: 'বেগুন', categoryPattern: /vegetable/i, brand: '', weight: '1kg', price: 55, unit: 'kg', description: 'Purple eggplants, ideal for bharta and curry' },
  { name: 'Fresh Green Beans', nameBn: 'সবুজ বিনস', categoryPattern: /vegetable/i, brand: '', weight: '1kg', price: 65, unit: 'kg', description: 'Tender green beans, great for stir-fry and salads' },
  { name: 'Fresh Bitter Gourd', nameBn: 'করলা', categoryPattern: /vegetable/i, brand: '', weight: '1kg', price: 60, unit: 'kg', description: 'Bitter gourd, known for health benefits' },
  { name: 'Fresh Pumpkin', nameBn: 'মিষ্টি কুমড়া', categoryPattern: /vegetable/i, brand: '', weight: '1kg', price: 40, unit: 'kg', description: 'Sweet pumpkin, perfect for curries and desserts' },
  { name: 'Fresh Radish', nameBn: 'মুলা', categoryPattern: /vegetable/i, brand: '', weight: '1kg', price: 35, unit: 'kg', description: 'Crisp white radish, great for salads' },
  { name: 'Fresh Coriander', nameBn: 'ধনেপাতা', categoryPattern: /vegetable/i, brand: '', weight: '1 bunch', price: 20, unit: 'bunch', description: 'Fresh coriander leaves, aromatic herb for garnishing' },
  { name: 'Fresh Green Chili', nameBn: 'কাঁচা মরিচ', categoryPattern: /vegetable/i, brand: '', weight: '1kg', price: 100, unit: 'kg', description: 'Spicy green chilies, adds heat to any dish' },
  { name: 'Fresh Garlic', nameBn: 'রসুন', categoryPattern: /vegetable/i, brand: '', weight: '1kg', price: 200, unit: 'kg', description: 'Premium quality garlic bulbs for cooking' },
  { name: 'Fresh Lemon', nameBn: 'লেবু', categoryPattern: /vegetable/i, brand: '', weight: '1kg', price: 120, unit: 'kg', description: 'Juicy lemons, rich in vitamin C' },
  
  // Fresh Fruits
  { name: 'Fresh Apple', nameBn: 'আপেল', categoryPattern: /fruit/i, brand: '', weight: '1kg', price: 180, unit: 'kg', description: 'Crisp red apples, sweet and healthy' },
  { name: 'Fresh Banana', nameBn: 'কলা', categoryPattern: /fruit/i, brand: '', weight: '12pcs', price: 60, unit: 'dozen', description: 'Ripe bananas, energy-packed fruit' },
  { name: 'Fresh Orange', nameBn: 'কমলা', categoryPattern: /fruit/i, brand: '', weight: '1kg', price: 150, unit: 'kg', description: 'Juicy oranges, loaded with vitamin C' },
  { name: 'Fresh Mango', nameBn: 'আম', categoryPattern: /fruit/i, brand: '', weight: '1kg', price: 200, unit: 'kg', description: 'Sweet mangoes, the king of fruits' },
  { name: 'Fresh Watermelon', nameBn: 'তরমুজ', categoryPattern: /fruit/i, brand: '', weight: '1kg', price: 40, unit: 'kg', description: 'Sweet red watermelon, refreshing summer fruit' },
  { name: 'Fresh Papaya', nameBn: 'পেঁপে', categoryPattern: /fruit/i, brand: '', weight: '1kg', price: 60, unit: 'kg', description: 'Ripe papaya, aids digestion' },
  { name: 'Fresh Pineapple', nameBn: 'আনারস', categoryPattern: /fruit/i, brand: '', weight: '1pc', price: 80, unit: 'piece', description: 'Tropical pineapple, sweet and tangy' },
  { name: 'Fresh Guava', nameBn: 'পেয়ারা', categoryPattern: /fruit/i, brand: '', weight: '1kg', price: 80, unit: 'kg', description: 'Fresh guava, vitamin C powerhouse' },
];

async function seedVegetableProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📂 Fetching categories from database...');
    const allCategories = await Category.find({ isActive: true }).lean();
    console.log(`✅ Found ${allCategories.length} categories\n`);

    let totalProductsCreated = 0;
    let totalProductsSkipped = 0;
    console.log('🌱 Starting vegetable & fruit product seeding...\n');

    // Process each product
    for (const [index, productData] of vegetableProducts.entries()) {
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

        const slug = createSlug(`${productData.name}-${productData.weight}`);
        const sku = `VEG-${String(Date.now() + index).slice(-6)}`;

        // Randomize some properties
        const isFeatured = Math.random() > 0.5;
        const isNewArrival = Math.random() > 0.7;
        const isBestSeller = Math.random() > 0.6;
        const stock = Math.floor(Math.random() * 300) + 100;

        // Calculate sale price (random discount for some products)
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
          tags: [category.name, 'fresh', 'organic'],
          isFeatured: isFeatured,
          isNewArrival: isNewArrival,
          isBestSeller: isBestSeller,
          status: stock > 0 ? 'active' : 'out_of_stock',
          rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
          reviewCount: Math.floor(Math.random() * 100) + 15,
          soldCount: Math.floor(Math.random() * 500) + 50
        });

        await product.save();
        totalProductsCreated++;
        console.log(`✅ [${totalProductsCreated}] ${productData.name} → ${category.name}`);

      } catch (error) {
        console.error(`❌ Error creating product ${productData.name}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Vegetable & fruit product seed completed successfully!');
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

seedVegetableProducts();
